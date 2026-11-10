"""FastAPI Backend Server for AI vs Real Image Detector.

Endpoints:
- POST /predict: Accepts an image file, extracts spectral and texture features for local inference,
                 generates 2D FFT spectrum visualization and spectral diagnostics,
- GET /health: Health check and model readiness info.
"""

import hashlib
import os
import io
import time
import logging
import warnings
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import joblib
from dotenv import load_dotenv

# Load environment variables from all possible locations
_env_paths = [
    Path(__file__).parent.parent / ".env",
    Path(__file__).parent.parent.parent / ".env",
    Path(".env"),
    Path("backend/.env"),
]
for p in _env_paths:
    if p.exists():
        load_dotenv(p)

from .feature_extractor import (
    FEATURE_VERSION,
    LEGACY_FEATURE_VERSION,
    generate_fft_spectrum_image,
    extract_fingerprint,
    compute_spectral_diagnostics,
)
from .sightengine_service import check_image_with_sightengine

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ai_detector.backend")

MODEL_STATE: Dict[str, Any] = {
    "model": None,
    "model_name": None,
    "classes": None,
    "feature_version": None,
    "model_sha256": None,
}


def load_detector_model():
    """Searches for and loads the scikit-learn model pipeline using joblib."""
    possible_paths = [
        os.path.join(os.path.dirname(__file__), "..", "model.pkl"),
        os.path.join(os.path.dirname(__file__), "..", "..", "model.pkl"),
        os.path.join(os.path.dirname(__file__), "..", "..", "ai_detector_svm.pkl"),
        "model.pkl",
        "ai_detector_svm.pkl",
    ]

    for path in possible_paths:
        abs_path = os.path.abspath(path)
        if os.path.exists(abs_path):
            try:
                with open(abs_path, "rb") as weights:
                    checksum = hashlib.file_digest(weights, "sha256").hexdigest()
                    weights.seek(0)
                    loaded = joblib.load(weights)
                version = getattr(loaded, "eyes_feature_version_", LEGACY_FEATURE_VERSION)
                if version not in (FEATURE_VERSION, LEGACY_FEATURE_VERSION):
                    raise ValueError(f"Unsupported feature version {version!r}")
                expected = (40 if version == LEGACY_FEATURE_VERSION
                            else extract_fingerprint(Image.new("RGB", (8, 8)), version).size)
                if getattr(loaded, "n_features_in_", expected) != expected:
                    raise ValueError(f"Model input does not match {version} ({expected} features)")
                classes = getattr(loaded, "classes_", None)
                if classes is None and hasattr(loaded, "named_steps"):
                    for step in loaded.named_steps.values():
                        if hasattr(step, "classes_"):
                            classes = step.classes_
                            break
                MODEL_STATE.update(
                    model=loaded, model_name=os.path.basename(abs_path), feature_version=version, model_sha256=checksum,
                    classes=[
                        int(c) if hasattr(c, "item") and isinstance(c.item(), int) else str(c)
                        for c in classes
                    ] if classes is not None else None,
                )
                logger.info(f"Loaded model: {abs_path} (classes: {MODEL_STATE['classes']})")
                return
            except Exception as e:
                logger.warning(f"Could not load {abs_path}: {e}")

    MODEL_STATE.update(model=None, model_name=None, classes=None, feature_version=None, model_sha256=None)
    logger.warning("No compatible local classifier found.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Detector backend...")
    load_detector_model()
    yield
    logger.info("Stopping AI Detector backend...")


app = FastAPI(
    title="AI vs Real Image Detector API",
    description="2D FFT Frequency Fingerprint Analysis and AI Image Detection",
    version="2.5.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root_index():
    return {
        "status": "online",
        "service": "The Eyes 2.0 API",
        "version": "2.5.0",
        "endpoints": {
            "predict": "POST /predict",
            "health": "GET /health",
            "documentation": "GET /docs"
        },
        "model_loaded": MODEL_STATE["model"] is not None,
    }


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model_loaded": MODEL_STATE["model"] is not None,
        "model_file": MODEL_STATE["model_name"],
        "feature_version": MODEL_STATE["feature_version"],
        "model_sha256": MODEL_STATE["model_sha256"],
        "classes": MODEL_STATE["classes"],
        "inference_mode": "local",
        "sightengine_configured": bool(os.getenv("SIGHTENGINE_API_USER") and os.getenv("SIGHTENGINE_API_SECRET")),
    }


def run_model_inference(features: np.ndarray) -> Optional[tuple[str, float]]:
    """Run prediction on the feature vector expected by the loaded model."""
    model = MODEL_STATE["model"]
    if model is None:
        return None

    features_2d = features.reshape(1, -1) if features.ndim == 1 else features

    try:
        if hasattr(model, "predict_proba"):
            probas = model.predict_proba(features_2d)[0]
            classes = MODEL_STATE.get("classes") or getattr(model, "classes_", [0, 1])

            fake_idx = 1
            for idx, c in enumerate(classes):
                if str(c).lower() in ["fake", "ai", "1", "synthetic", "generated"]:
                    fake_idx = idx
                    break

            fake_prob = float(probas[fake_idx])
            if fake_prob >= 0.50:
                return "fake", round(fake_prob, 4)
            else:
                return "real", round(1.0 - fake_prob, 4)

        elif hasattr(model, "decision_function"):
            score = float(model.decision_function(features_2d)[0])
            fake_prob = float(1.0 / (1.0 + np.exp(-score)))
            if fake_prob >= 0.50:
                return "fake", round(fake_prob, 4)
            else:
                return "real", round(1.0 - fake_prob, 4)

        else:
            pred = model.predict(features_2d)[0]
            is_fake = str(pred).lower() in ["fake", "ai", "1", "true", "synthetic"]
            return ("fake" if is_fake else "real"), 0.88

    except Exception as e:
        logger.error(f"Inference error with model: {e}")
        return None


@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    start_time = time.time()

    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail=f"File '{file.filename}' is not an image.")

    try:
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.load()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")

        # 1. 2D FFT Spectrum Image (base64 PNG)
        fft_spectrum_base64 = generate_fft_spectrum_image(image)

        # 2. Multi-Spectral Diagnostics & 1D Radial Curve
        diagnostics = compute_spectral_diagnostics(image)

        # 3. Use the same feature recipe that produced these weights.
        local_result = None
        if MODEL_STATE["model"] is not None:
            features = extract_fingerprint(image, MODEL_STATE["feature_version"])
            local_result = run_model_inference(features)

        if local_result is None:
            raise HTTPException(status_code=503, detail="The image detector is unavailable.")
        prediction, confidence = local_result

        # 6. Optional Sightengine GenAI Benchmark
        sightengine_res = await check_image_with_sightengine(image_bytes, filename=file.filename or "image.jpg")

        api_confidence = sightengine_res["confidence"] if sightengine_res else None
        api_prediction = sightengine_res["prediction"] if sightengine_res else None

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "prediction": prediction,
            "confidence": confidence,
            "ensemble": {"active_engine": "FOURIER_ONLY", "models_count": 1, "fallback_notice": None},
            "local_model": {
                "available": local_result is not None,
                "feature_version": MODEL_STATE["feature_version"],
                "model_sha256": MODEL_STATE["model_sha256"],
                "prediction": local_result[0] if local_result else None,
                "confidence": local_result[1] if local_result else None,
            },
            "fft_spectrum_image": fft_spectrum_base64,
            "diagnostics": diagnostics,
            "api_confidence": api_confidence,
            "api_prediction": api_prediction,
            "api_available": sightengine_res is not None,
            "filename": file.filename,
            "file_size_kb": round(len(image_bytes) / 1024.0, 1),
            "processing_time_ms": elapsed_ms,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction pipeline error: {str(e)}")
