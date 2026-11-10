"""Exclude visually near-identical photos across dataset splits before fitting."""

from collections import defaultdict
import hashlib
import io
import json
from pathlib import Path
import tempfile
import zipfile

import numpy as np
from PIL import Image
from scipy.fft import dctn

from training.data import IMAGE_EXTS


def fingerprint(data):
    with Image.open(io.BytesIO(data)) as image:
        image.draft("L", (32, 32))
        small = image.convert("L").resize((32, 32), Image.Resampling.BILINEAR)
        thumbnail = np.asarray(small.resize((16, 16), Image.Resampling.BILINEAR), dtype=np.int16)
    low = dctn(np.asarray(small, dtype=np.float32), norm="ortho")[:8, :8]
    bits = np.packbits(low > np.median(low.ravel()[1:]))
    return int.from_bytes(bits.tobytes(), "little"), thumbnail


def find_exclusions(path):
    partitions = defaultdict(list)
    signature = hashlib.sha256(Path(__file__).read_bytes())
    with zipfile.ZipFile(path) as archive:
        for item in archive.infolist():
            if item.filename.lower().endswith(IMAGE_EXTS):
                partitions[item.filename.split("/")[-3]].append(item.filename)
                signature.update(f"{item.filename}|{item.CRC}|{item.file_size}\n".encode())
        cache = path.parent / "features" / f"{path.stem}-split-check-{signature.hexdigest()[:16]}.json"
        if cache.is_file():
            return set(json.loads(cache.read_text(encoding="utf-8")))
        buckets = defaultdict(list)
        reserved = []
        excluded = []
        for split in ("test", "validation", "train"):
            initial = len(excluded)
            for name in partitions[split]:
                phash, thumbnail = fingerprint(archive.read(name))
                # At most two different bits must leave at least one of three
                # disjoint bands identical. Verify candidates in pixel space.
                bands = [(j, (phash >> (22 * j)) & 0x3fffff) for j in range(3)]
                if split != "test":
                    candidates = {i for band in bands for i in buckets.get(band, ())}
                    if any((phash ^ reserved[i][0]).bit_count() <= 2 and
                           np.mean(np.abs(thumbnail - reserved[i][1])) <= 2 for i in candidates):
                        excluded.append(name)
                if split != "train":
                    for band in bands:
                        buckets[band].append(len(reserved))
                    reserved.append((phash, thumbnail))
            print(f"{path.stem} {split}: screened {len(partitions[split]):,}, excluded {len(excluded) - initial:,}", flush=True)
    cache.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=cache.parent, mode="w", encoding="utf-8", delete=False) as tmp:
        json.dump(excluded, tmp)
    Path(tmp.name).replace(cache)
    return set(excluded)
