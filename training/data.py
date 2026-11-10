"""Stratified, reproducible image sampling and training-only augmentation."""

from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
import hashlib
import io
from pathlib import Path
import random
import zipfile

import numpy as np
from PIL import Image

from backend.app import image_features


ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "data-set/archive.zip"
SCENES = ROOT / "data-set/public-scenes.zip"
SEED = 1729
IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp")


@dataclass(frozen=True)
class Sample:
    path: str
    label: int
    # A zero seed means use only the original pixels.
    augmentation_seed: int


def select_samples(archive, split, per_group, seed=SEED):
    by_group = defaultdict(list)
    seen = set()
    # Reserve every test file before validation, and both before training.
    # This also excludes exact duplicates stored under different names.
    splits = ["test", "validation", "train"]
    infos = [i for i in archive.infolist() if i.filename.lower().endswith(IMAGE_EXTS)]
    for partition in splits[:splits.index(split) + 1]:
        for info in infos:
            *source, part, cls, _ = info.filename.split("/")
            if part != partition or cls not in ("fake", "real"):
                continue
            key = (info.CRC, info.file_size)
            if key in seen:
                continue
            seen.add(key)
            if part == split:
                by_group[("/".join(source), cls)].append(info.filename)

    rng = random.Random(seed)
    samples = []
    for (_, cls), paths in sorted(by_group.items()):
        selected = rng.sample(sorted(paths), min(len(paths), per_group))
        for index, path in enumerate(selected):
            # Half of the training and validation originals also get an edited
            # view. Generate it only after selecting the original's partition.
            aug_seed = rng.randrange(1, 2**32) if split != "test" and index % 2 == 0 else 0
            samples.append(Sample(path, int(cls == "fake"), aug_seed))
    if {s.label for s in samples} != {0, 1}:
        raise ValueError(f"Missing a class in {split} split")
    return sorted(samples, key=lambda s: archive.getinfo(s.path).header_offset)


def augment(image, seed):
    rng = random.Random(seed)
    operation = rng.choice(("resize", "jpeg", "both"))
    if operation in ("resize", "both"):
        ratio = rng.uniform(0.4, 0.85)
        size = tuple(max(1, round(d * ratio)) for d in image.size)
        image = image.resize(size, rng.choice((Image.Resampling.LANCZOS, Image.Resampling.BILINEAR)))
    if operation in ("jpeg", "both"):
        stream = io.BytesIO()
        image.save(stream, "JPEG", quality=rng.randint(55, 92))
        with Image.open(io.BytesIO(stream.getvalue())) as compressed:
            image = compressed.convert("RGB")
    return image


def _extract(item):
    data, sample = item
    with Image.open(io.BytesIO(data)) as original:
        image = original.convert("RGB")
    rows = [image_features.extract_image_features(image)]
    if sample.augmentation_seed:
        rows.append(image_features.extract_image_features(augment(image, sample.augmentation_seed)))
    return rows


def feature_matrix(path, split, per_group, workers):
    # Each cache is scoped to the archive, feature code, and sampling recipe.
    digest = hashlib.sha256(Path(__file__).read_bytes() + Path(image_features.__file__).read_bytes())
    with zipfile.ZipFile(path) as archive:
        samples = select_samples(archive, split, per_group)
        for s in samples:
            info = archive.getinfo(s.path)
            digest.update(f"{s.path}|{info.CRC}|{info.file_size}|{s.augmentation_seed}\n".encode())
        cache = ROOT / "data-set/features" / f"{path.stem}-{split}-{digest.hexdigest()[:16]}.npz"
        if cache.is_file():
            with np.load(cache) as data:
                return data["features"], data["labels"], data["edited"]
        cache.parent.mkdir(parents=True, exist_ok=True)
        rows = sum(1 + bool(s.augmentation_seed) for s in samples)
        features = None
        labels = np.empty(rows, dtype=np.uint8)
        edited = np.empty(rows, dtype=bool)
        offset = 0
        with ThreadPoolExecutor(max_workers=workers) as pool:
            for start in range(0, len(samples), 128):
                batch = samples[start:start + 128]
                encoded = ((archive.read(s.path), s) for s in batch)
                for sample, values in zip(batch, pool.map(_extract, encoded)):
                    if features is None:
                        features = np.empty((rows, values[0].size), dtype=np.float32)
                    stop = offset + len(values)
                    features[offset:stop] = values
                    labels[offset:stop] = sample.label
                    edited[offset:stop] = False
                    if sample.augmentation_seed:
                        edited[offset + 1] = True
                    offset = stop
                if (start + 128) % 4096 == 0 or start + 128 >= len(samples):
                    print(f"{path.stem} {split}: {min(start + 128, len(samples)):,}/{len(samples):,} originals", flush=True)
    if not np.isfinite(features).all():
        raise ValueError(f"Non-finite image features in {split}")
    # A partially written cache must never be consumed by the next run.
    import tempfile
    with tempfile.NamedTemporaryFile(dir=cache.parent, suffix=".npz", delete=False) as tmp:
        np.savez(tmp, features=features, labels=labels, edited=edited)
    Path(tmp.name).replace(cache)
    return features, labels, edited
