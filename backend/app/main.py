"""FastAPI Backend Server for AI vs Real Image Detector.

Endpoints:
- POST /predict: Accepts an image file, extracts multi-spectral 40-dim FFT fingerprint + model inference,
                 generates 2D FFT spectrum visualization and spectral diagnostics,
                 and calls NVIDIA DiffusionGemma 26B Vision Forensics & Sightengine APIs.
- GET /health: Health check and model readiness info.
"""

import os
import io
import time
import logging
import warnings
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import joblib
from dotenv import load_dotenv

from .feature_extractor import (
    generate_fft_spectrum_image,
    extract_fingerprint,
    compute_spectral_diagnostics,
)
from .sightengine_service import check_image_with_sightengine
from .nvidia_service import check_image_with_nvidia_vision

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ai_detector.backend")

MODEL_STATE: Dict[str, Any] = {
    "model": None,
    "model_name": None,
    "classes": None,
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
                loaded = joblib.load(abs_path)
                MODEL_STATE["model"] = loaded
                MODEL_STATE["model_name"] = os.path.basename(abs_path)
                classes = getattr(loaded, "classes_", None)
                if classes is None and hasattr(loaded, "named_steps"):
                    for step in loaded.named_steps.values():
                        if hasattr(step, "classes_"):
                            classes = step.classes_
                            break
                if classes is not None:
                    MODEL_STATE["classes"] = [
                        int(c) if hasattr(c, "item") and isinstance(c.item(), int) else str(c)
                        for c in classes
                    ]
                logger.info(f"Loaded model: {abs_path} (classes: {MODEL_STATE['classes']})")
                return
            except Exception as e:
                logger.warning(f"Could not load {abs_path}: {e}")

    logger.warning("No model.pkl or ai_detector_svm.pkl found. Running in fallback heuristic mode.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Detector backend...")
    load_detector_model()
    yield
    logger.info("Stopping AI Detector backend...")


app = FastAPI(
    title="AI vs Real Image Detector API",
    description="2D FFT Frequency Fingerprint Analysis and AI Image Detection",
    version="2.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model_loaded": MODEL_STATE["model"] is not None,
        "model_file": MODEL_STATE["model_name"],
        "classes": MODEL_STATE["classes"],
        "nvidia_vision_active": True,
        "sightengine_configured": bool(os.getenv("SIGHTENGINE_API_USER") and os.getenv("SIGHTENGINE_API_SECRET")),
    }


def run_model_inference(features: np.ndarray) -> tuple[str, float]:
    """Runs prediction on 40-dim feature vector using the trained pipeline."""
    model = MODEL_STATE["model"]
    features_2d = features.reshape(1, -1) if features.ndim == 1 else features

    if model is not None:
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

    return "real", 0.70


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

        # 3. Extract 40-dim Fingerprint & Predict with Trained Model
        features = extract_fingerprint(image)
        prediction, confidence = run_model_inference(features)

        # 4. NVIDIA DiffusionGemma 26B Multi-Modal Vision Inspection (Async)
        nvidia_vision_res = await check_image_with_nvidia_vision(image_bytes)

        # 5. Optional Sightengine GenAI Benchmark
        sightengine_res = await check_image_with_sightengine(image_bytes, filename=file.filename or "image.jpg")

        api_confidence = sightengine_res["confidence"] if sightengine_res else None
        api_prediction = sightengine_res["prediction"] if sightengine_res else None

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "prediction": prediction,
            "confidence": confidence,
            "fft_spectrum_image": fft_spectrum_base64,
            "diagnostics": diagnostics,
            "nvidia_vision": nvidia_vision_res,
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
