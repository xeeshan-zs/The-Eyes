"""Fit a candidate on train images and stop on a separate validation split."""

import argparse
import copy
import io
from pathlib import Path
import tempfile
import zipfile

import joblib
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier, VotingClassifier
from sklearn.frozen import FrozenEstimator
from sklearn.metrics import accuracy_score, log_loss, roc_auc_score
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from threadpoolctl import threadpool_limits

from backend.app.image_features import FEATURE_VERSION
from training.data import ARCHIVE, ROOT, SCENES, SEED, feature_matrix, select_samples
from training.split_guard import find_exclusions


def load_split(split, sources, workers):
    features, labels, weights, domains, edits = [], [], [], [], []
    for path, train_limit, val_limit, domain_weight in sources:
        limit = train_limit if split == "train" else val_limit
        x, y, edited = feature_matrix(path, split, limit, workers)
        excluded = find_exclusions(path)
        with zipfile.ZipFile(path) as archive:
            samples = select_samples(archive, split, limit)
        keep = np.repeat([s.path not in excluded for s in samples],
                         [1 + bool(s.augmentation_seed) for s in samples])
        x, y, edited = x[keep], y[keep], edited[keep]
        features.append(x)
        labels.append(y)
        edits.append(edited)
        domains.append(np.full(len(y), path.stem))
        # Give both classes equal weight within each source. A small scene set
        # should still influence the model alongside a much larger portrait set.
        w = domain_weight / (2 * np.bincount(y)[y])
        weights.append(w)
        print(f"{path.stem} {split}: {len(y):,} views of {np.count_nonzero(~edited):,} originals", flush=True)
    w = np.concatenate(weights)
    return (np.concatenate(features), np.concatenate(labels), w / w.mean(),
            np.concatenate(domains), np.concatenate(edits))


def fit_neural_model(x, y, weight, val_x, val_y, val_weight):
    scaler = StandardScaler().fit(x, sample_weight=weight)
    x = scaler.transform(x)
    val_x = scaler.transform(val_x)
    network = MLPClassifier(hidden_layer_sizes=(160, 64), batch_size=256,
                            learning_rate_init=0.0006, alpha=0.05,
                            random_state=np.random.RandomState(SEED))
    best_loss = float("inf")
    best_epoch = 0
    best_network = None
    for epoch in range(1, 41):
        network.partial_fit(x, y, classes=[0, 1], sample_weight=weight)
        loss = log_loss(val_y, network.predict_proba(val_x), sample_weight=val_weight)
        if loss < best_loss - 0.0003:
            best_loss, best_epoch = loss, epoch
            best_network = copy.deepcopy(network)
        if epoch % 5 == 0:
            print(f"Neural epoch {epoch}: validation loss {loss:.4f}", flush=True)
        if epoch - best_epoch >= 6:
            break
    print(f"Best neural epoch: {best_epoch}", flush=True)
    return make_pipeline(scaler, best_network)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--per-group", type=int, default=12000, help="Training originals per local dataset/class")
    parser.add_argument("--with-public-scenes", action="store_true", help="Include the prepared public-scenes.zip")
    parser.add_argument("--workers", type=int, default=3)
    parser.add_argument("--output", type=Path, help="Stage a candidate here instead of updating the application weights")
    args = parser.parse_args()
    if min(args.per_group, args.workers) < 1:
        parser.error("--per-group and --workers must be positive")
    sources = [(ARCHIVE, args.per_group, 250, 0.7)]
    if args.with_public_scenes:
        if not SCENES.is_file():
            parser.error("Prepare the public scenes with training/prepare_public_data.py first.")
        sources.append((SCENES, 100_000, 100_000, 0.3))
    train_x, train_y, train_w, _, _ = load_split("train", sources, args.workers)
    val_x, val_y, val_w, domains, edited = load_split("validation", sources, args.workers)

    trees = HistGradientBoostingClassifier(
        learning_rate=0.08, max_iter=450, max_leaf_nodes=31, min_samples_leaf=30,
        max_features=0.65, max_bins=127, l2_regularization=4,
        early_stopping=True, scoring="loss", n_iter_no_change=35,
        random_state=SEED,
    )
    print(f"Fitting {len(train_y):,} examples with {train_x.shape[1]} features...", flush=True)
    with threadpool_limits(limits=args.workers):
        trees.fit(train_x, train_y, sample_weight=train_w,
                  X_val=val_x, y_val=val_y, sample_weight_val=val_w)
        print(f"Fitted {trees.n_iter_} boosting iterations", flush=True)
        neural = fit_neural_model(train_x, train_y, train_w, val_x, val_y, val_w)
        blend = VotingClassifier([("trees", FrozenEstimator(trees)), ("neural", FrozenEstimator(neural))],
                                 voting="soft").fit(train_x, train_y)
        # Fix the cutoff at 0.5. Select using validation accuracy across both
        # sources and their edited views, with log loss as the tie breaker.
        best = (-1.0, -float("inf"))
        for name, candidate in (("trees", trees), ("neural", neural), ("average", blend)):
            s = candidate.predict_proba(val_x)[:, 1]
            acc = accuracy_score(val_y, s >= 0.5, sample_weight=val_w)
            loss = log_loss(val_y, s, sample_weight=val_w)
            print(f"{name}: weighted validation accuracy {acc:.3f}, loss {loss:.4f}", flush=True)
            if (acc, -loss) > best:
                best, model, scores = (acc, -loss), candidate, s
        print(f"Selected {type(model).__name__}", flush=True)
    model.eyes_feature_version_ = FEATURE_VERSION
    model.eyes_training_seed_ = SEED
    for domain in np.unique(domains):
        for is_edit in (False, True):
            mask = (domains == domain) & (edited == is_edit)
            y = val_y[mask]
            pred = scores[mask] >= 0.5
            print(f"{domain} validation {'edited' if is_edit else 'original'}: "
                  f"accuracy {accuracy_score(y, pred):.3f}, AUC {roc_auc_score(y, scores[mask]):.3f}, "
                  f"real flagged {pred[y == 0].mean():.3f}", flush=True)
    buffer = io.BytesIO()
    joblib.dump(model, buffer, compress=3)
    targets = [args.output] if args.output else [ROOT / "backend/model.pkl", ROOT / "ai_detector_svm.pkl"]
    for target in targets:
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=target.parent, delete=False) as out:
            out.write(buffer.getbuffer())
        Path(out.name).replace(target)
        print(f"Saved {target}", flush=True)


if __name__ == "__main__":
    main()
