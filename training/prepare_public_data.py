"""Convert the verified public Parquet shards to the local split format."""

from collections import Counter
import hashlib
import io
import json
from pathlib import Path
import tempfile
import zipfile

from PIL import Image
import pyarrow.parquet as pq

from fetch_public_data import DEST


def write_archive(shards, target):
    seen = {}
    counts = Counter()
    duplicates = 0
    shared_exports = 0
    with tempfile.NamedTemporaryFile(dir=target.parent, suffix=".zip", delete=False) as tmp:
        staged = Path(tmp.name)
    try:
        with zipfile.ZipFile(staged, "w") as out:
            for shard in shards:
                parquet = pq.ParquetFile(shard)
                info = json.loads(parquet.schema_arrow.metadata[b"huggingface"])
                names = info["info"]["features"]["label"]["names"]
                if len(names) != 2 or set(names) != {"real", "fake"}:
                    raise ValueError(f"Unexpected label schema in {shard.name}: {names}")
                for batch in parquet.iter_batches(batch_size=8, columns=["image", "label"]):
                    for row in batch.to_pylist():
                        label = row["label"]
                        if label not in (0, 1):
                            raise ValueError(f"Unexpected public label {label!r}")
                        cls = names[label]
                        data = row["image"]["bytes"]
                        with Image.open(io.BytesIO(data)) as image:
                            suffix = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}.get(image.format)
                            # Compare decoded content independently of metadata and filenames.
                            rgb = image.convert("RGB")
                            thumb = rgb.resize((64, 64), Image.Resampling.LANCZOS)
                            key = hashlib.sha256(thumb.tobytes()).hexdigest()
                        if suffix is None:
                            buf = io.BytesIO()
                            rgb.save(buf, "PNG")
                            data, suffix = buf.getvalue(), "png"
                        if key in seen:
                            if seen[key] != cls:
                                raise ValueError("Conflicting labels for the same decoded image")
                            duplicates += 1
                            continue
                        seen[key] = cls
                        split = "test" if shard.name.startswith("test-") else "train"
                        if split == "train" and int(key[:8], 16) % 10 == 0:
                            split = "validation"
                        # Some public images are multi-megapixel originals.
                        # Give both classes common web exports so a particular
                        # source's native compression is a less useful cue.
                        if split == "train" and int(key[8:10], 16) % 2 == 0:
                            side = (256, 384, 640)[int(key[10:12], 16) % 3]
                            rgb.thumbnail((side, side), Image.Resampling.LANCZOS)
                            buf = io.BytesIO()
                            rgb.save(buf, "JPEG", quality=65 + int(key[12:14], 16) % 26)
                            data, suffix = buf.getvalue(), "jpg"
                            shared_exports += 1
                        out.writestr(f"scenes/{split}/{cls}/{key}.{suffix}", data)
                        counts[split, cls] += 1
        staged.replace(target)
    finally:
        staged.unlink(missing_ok=True)
    print("Source images per split and label:", dict(sorted(counts.items())))
    print(f"Skipped {duplicates} repeated images. Used {shared_exports} smaller training exports. Saved {target}")


if __name__ == "__main__":
    shards = sorted(DEST.glob("test-*.parquet")) + sorted(DEST.glob("train-*.parquet"))
    if len(shards) != 4:
        raise FileNotFoundError("Run training/fetch_public_data.py first.")
    write_archive(shards, DEST.with_suffix(".zip"))
