"""Catch mismatches between saved weights and the actual upload pipeline."""

import io
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, patch

import httpx
import numpy as np
from PIL import Image

from backend.app import main
from backend.app.feature_extractor import extract_fingerprint


class LocalModelUploadTest(IsolatedAsyncioTestCase):
    async def test_upload_uses_saved_classifier_and_is_repeatable(self):
        pixels = np.random.default_rng(27).integers(0, 256, (97, 123, 3), dtype=np.uint8)
        image = Image.fromarray(pixels)
        encoded = io.BytesIO()
        image.save(encoded, format="PNG")
        transport = httpx.ASGITransport(app=main.app)
        with (
            patch.object(main, "check_image_with_nvidia_vision", AsyncMock(return_value=None)),
            patch.object(main, "check_image_with_sightengine", AsyncMock(return_value=None)),
        ):
            async with main.app.router.lifespan_context(main.app), httpx.AsyncClient(
                transport=transport, base_url="http://test"
            ) as client:
                health = (await client.get("/health")).json()
                self.assertTrue(health["model_loaded"])
                model = main.MODEL_STATE["model"]
                features = extract_fingerprint(image, health["feature_version"])
                score = model.predict_proba(features[None, :])[0, list(model.classes_).index(1)]
                for filename in ("first.png", "renamed.png"):
                    response = await client.post("/predict", files={"file": (filename, encoded.getvalue(), "image/png")})
                    response.raise_for_status()
                    result = response.json()
                    self.assertTrue(result["local_model"]["available"])
                    self.assertEqual(result["local_model"]["model_sha256"], health["model_sha256"])
                    self.assertEqual(result["ensemble"]["active_engine"], "FOURIER_ONLY")
                    self.assertEqual(result["prediction"], "fake" if score >= 0.5 else "real")
                    self.assertAlmostEqual(result["confidence"], max(score, 1 - score), places=4)
