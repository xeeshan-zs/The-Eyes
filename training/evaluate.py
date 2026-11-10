"""Paired evaluation of two frozen models at the production 0.5 threshold.

Run from the project root with python -m training.evaluate --help.
"""

import argparse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
import hashlib
import io
import json
from pathlib import Path
import random
import tarfile
import tempfile
import zipfile

import joblib
import numpy as np
from PIL import Image
from sklearn.metrics import confusion_matrix, roc_auc_score
from threadpoolctl import threadpool_limits

from backend.app.feature_extractor import LEGACY_FEATURE_VERSION, extract_fingerprint
from backend.app import feature_extractor, image_features
from training.data import ARCHIVE, IMAGE_EXTS, ROOT, SCENES, select_samples


def local_cases(archive):
    # Reproduce the exact sample order and edit subset of the original audit.
    original_rng = random.Random(20261110)
    fresh_rng = random.Random(89021)
    train_keys = {(i.CRC, i.file_size) for i in archive.infolist() if "/train/" in i.filename}
    cases = []
    for group in range(1, 5):
        for label, cls in enumerate(("real", "fake")):
            prefix = f"Data Set {group}/Data Set {group}/test/{cls}/"
            paths = sorted(i.filename for i in archive.infolist() if i.filename.startswith(prefix)
                           and i.filename.lower().endswith(IMAGE_EXTS)
                           and (i.CRC, i.file_size) not in train_keys)
            reference = original_rng.sample(paths, 250)
            cases.extend((p, label, "reference", i < 25) for i, p in enumerate(reference))
            fresh = fresh_rng.sample(sorted(set(paths).difference(reference)), 250)
            cases.extend((p, label, "fresh", False) for p in fresh)
    return cases


def metrics(y, scores):
    pred = scores >= 0.5
    tn, fp, fn, tp = confusion_matrix(y, pred, labels=[0, 1]).ravel().tolist()
    return dict(count=len(y), accuracy=(tp + tn) / len(y), auc=float(roc_auc_score(y, scores)),
                real_correct=tn, real_flagged=fp, ai_missed=fn, ai_correct=tp,
                real_false_positive_rate=fp / (fp + tn), ai_recall=tp / (tp + fn))


def extract_case(encoded, versions):
    case, data = encoded
    path, label, cohort, edits = case
    with Image.open(io.BytesIO(data)) as original:
        rgb = original.convert("RGB")
    views = {"original": rgb}
    if edits:
        buf = io.BytesIO()
        rgb.save(buf, format="JPEG", quality=70)
        with Image.open(io.BytesIO(buf.getvalue())) as compressed:
            views["jpeg70"] = compressed.convert("RGB")
        views["half_size"] = rgb.resize(tuple(max(1, d // 2) for d in rgb.size), Image.Resampling.LANCZOS)
        if cohort == "public_scenes":
            # Put both classes through the same image size and JPEG encoder.
            # This tests sensitivity to differences in the publishers' exports.
            buf = io.BytesIO()
            rgb.resize((256, 256), Image.Resampling.LANCZOS).save(buf, "JPEG", quality=80)
            with Image.open(io.BytesIO(buf.getvalue())) as common_export:
                views["common_jpeg256"] = common_export.convert("RGB")
    return [(cohort, label, view, path, [extract_fingerprint(img, version) for version in versions])
            for view, img in views.items()]


def test_inputs(archive_path, cases, versions, workers):
    # Evaluation matrices are independent of the fitted weights. In
    # particular, none of these matrices are read by the training job.
    digest = hashlib.sha256(str(versions).encode())
    for module in (__file__, feature_extractor.__file__, image_features.__file__):
        digest.update(Path(module).read_bytes())
    with zipfile.ZipFile(archive_path) as archive:
        for case in cases:
            digest.update(f"{case}|{archive.getinfo(case[0]).CRC}\n".encode())
        cache = ROOT / "data-set/features" / f"evaluation-{digest.hexdigest()[:20]}.npz"
        if not cache.exists():
            rows = []
            with ThreadPoolExecutor(max_workers=workers) as pool:
                for start in range(0, len(cases), 64):
                    batch = cases[start:start + 64]
                    encoded = ((c, archive.read(c[0])) for c in batch)
                    for items in pool.map(lambda it: extract_case(it, versions), encoded):
                        rows.extend(items)
            cache.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(dir=cache.parent, delete=False) as tmp:
                matrices = {f"x{i}": np.stack([r[4][i] for r in rows]) for i in range(len(versions))}
                np.savez(tmp, cohort=[r[0] for r in rows], label=[r[1] for r in rows],
                         view=[r[2] for r in rows], path=[r[3] for r in rows], **matrices)
            Path(tmp.name).replace(cache)
    return cache


def evaluate(archive_path, cases, models, workers):
    versions = [getattr(model, "eyes_feature_version_", LEGACY_FEATURE_VERSION) for model in models]
    records = defaultdict(list)
    with np.load(test_inputs(archive_path, cases, versions, workers)) as data:
        scores = [m.predict_proba(data[f"x{i}"])[:, list(m.classes_).index(1)] for i, m in enumerate(models)]
        for cohort, view, path, label, pair in zip(data["cohort"], data["view"], data["path"], data["label"], zip(*scores)):
            records[cohort, view].append((path, label, pair))
    results = {}
    for (cohort, view), rows in records.items():
        y = np.array([r[1] for r in rows])
        source = {p: s for p, _, s in records[cohort, "original"]}
        report = {}
        for i, name in enumerate(("previous", "retrained")):
            scores = np.array([r[2][i] for r in rows])
            report[name] = metrics(y, scores)
            if view != "original":
                original = np.array([source[p][i] for p, _, _ in rows])
                report[name]["label_flips"] = int(np.count_nonzero((scores >= 0.5) != (original >= 0.5)))
        results[f"{cohort}/{view}"] = report
    return results


def check_independent_photos(path, models):
    features = [[], []]
    versions = [getattr(model, "eyes_feature_version_", LEGACY_FEATURE_VERSION) for model in models]
    with tarfile.open(path, "r:gz") as archive:
        for item in archive:
            if not item.isfile() or "/images/test/" not in item.name or not item.name.endswith(".jpg"):
                continue
            with archive.extractfile(item) as stream, Image.open(io.BytesIO(stream.read())) as image:
                for column, version in zip(features, versions):
                    column.append(extract_fingerprint(image, version))
    if len(features[0]) != 100:
        raise ValueError("Expected 100 BSDS300 test photos")
    report = {}
    for name, model, x in zip(("previous", "retrained"), models, features):
        flagged = model.predict_proba(np.stack(x))[:, list(model.classes_).index(1)] >= 0.5
        report[name] = dict(count=len(x), real_flagged=int(flagged.sum()),
                            real_false_positive_rate=float(flagged.mean()))
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--previous", type=Path, required=True)
    parser.add_argument("--candidate", type=Path, default=ROOT / "backend/model.pkl")
    parser.add_argument("--with-public-scenes", action="store_true")
    parser.add_argument("--photo-test", type=Path, help="Optional BSDS300-images.tgz for checking real-photo errors")
    parser.add_argument("--output", type=Path, default=ROOT / "training/results.json")
    args = parser.parse_args()
    paths = [args.previous, args.candidate]
    models = [joblib.load(p) for p in paths]
    with zipfile.ZipFile(ARCHIVE) as archive:
        cases = local_cases(archive)
    with threadpool_limits(limits=3):
        results = evaluate(ARCHIVE, cases, models, 3)
        if args.with_public_scenes:
            with zipfile.ZipFile(SCENES) as archive:
                samples = select_samples(archive, "test", 100_000)
            cases = [(s.path, s.label, "public_scenes", True) for s in samples]
            results.update(evaluate(SCENES, cases, models, 3))
        photo_test = check_independent_photos(args.photo_test, models) if args.photo_test else None
    report = {
        "model_sha256": {n: hashlib.sha256(p.read_bytes()).hexdigest()
                         for n, p in zip(("previous", "retrained"), paths)},
        "threshold": 0.5, "cohorts": results, "independent_real_photos": photo_test,
    }
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    for cohort, scores in results.items():
        print(cohort, *(f"{name} {m['accuracy']:.2%}" for name, m in scores.items()), flush=True)


if __name__ == "__main__":
    main()
