"""NVIDIA NIM Multi-Modal Vision Forensics Service.

Uses `google/diffusiongemma-26b-a4b-it` via the NVIDIA API Catalog
to perform deep visual & semantic forensic analysis on uploaded images.
"""

import os
import io
import json
import base64
import logging
import math
import asyncio
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional, Dict, Any
from PIL import Image
from dotenv import load_dotenv

logger = logging.getLogger("ai_detector.nvidia")

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

NVIDIA_INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_MODEL = "google/diffusiongemma-26b-a4b-it"


NVIDIA_TIMEOUT_SECONDS = 180


def unavailable(reason: str) -> Dict[str, Any]:
    logger.warning("DiffusionGemma unavailable: %s", reason)
    return {"available": False, "reason": reason}


def _sync_call_nvidia(image_bytes: bytes) -> Optional[Dict[str, Any]]:
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        return unavailable("The server has no NVIDIA API key configured.")

    try:
        # Resize to max 640px for rapid upload and inference
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img.thumbnail((640, 640), Image.Resampling.BILINEAR)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=82)
        b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
        data_uri = f"data:image/jpeg;base64,{b64_str}"

        prompt = (
            "You are an elite digital forensics expert. Analyze this image to determine "
            "if it is an authentic real-world photograph or a synthetic AI-generated image "
            "(e.g. Midjourney, DALL-E 3, Flux, Stable Diffusion, Imagen).\n\n"
            "IMPORTANT FORENSIC CALIBRATION:\n"
            "1. Real-world smartphone cameras (such as Google Pixel HDR+, Apple iPhone Deep Fusion, Samsung AI ISP) "
            "apply computational denoising, multi-frame stacking, edge sharpening, and local tone-mapping. "
            "These are AUTHENTIC REAL PHOTOGRAPHS, not AI generated images.\n"
            "2. AI images (Midjourney, DALL-E, SDXL) have distinctive generative synthetic markers: unnatural skin micro-textures, "
            "anomalous light reflections, incoherent background geometry, warped fine details (hair, teeth, hands, text), "
            "and synthetic diffusion blur.\n\n"
            "Respond strictly in valid JSON with this exact schema:\n"
            '{"prediction": "fake" | "real", "confidence": 0.90, "explanation": "Brief 1-2 sentence forensic reasoning clearly stating evidence"}'
        )

        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_uri}}
                    ]
                }
            ],
            "model": NVIDIA_MODEL,
            "max_tokens": 1024,
            "stream": False,
            "temperature": 0.5,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "seed": 0,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        req = urllib.request.Request(
            NVIDIA_INVOKE_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=NVIDIA_TIMEOUT_SECONDS) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            content = res_data["choices"][0]["message"]["content"].strip()

            # Clean JSON markdown if present
            clean_content = content
            if "```json" in clean_content:
                clean_content = clean_content.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_content:
                clean_content = clean_content.split("```")[1].split("```")[0].strip()

            clean_content = clean_content.rsplit("<channel|>", 1)[-1].strip()
            parsed = json.loads(clean_content)
            prediction = parsed["prediction"].strip().lower()
            confidence = float(parsed["confidence"])
            if prediction not in {"real", "fake"} or not math.isfinite(confidence) or not 0 <= confidence <= 1:
                raise ValueError("Invalid NVIDIA verdict")
            return {
                "available": True,
                "model": "DiffusionGemma 26B",
                "prediction": prediction,
                "confidence": round(confidence, 2),
                "explanation": str(parsed.get("explanation", "")),
            }

    except urllib.error.HTTPError as error:
        return unavailable(f"NVIDIA returned HTTP {error.code}.")
    except TimeoutError:
        return unavailable(f"NVIDIA did not respond within {NVIDIA_TIMEOUT_SECONDS} seconds.")
    except urllib.error.URLError:
        return unavailable("The server could not reach NVIDIA.")
    except (ValueError, KeyError, IndexError, TypeError, AttributeError):
        return unavailable("NVIDIA returned no usable verdict.")
    except Exception:
        return unavailable("The NVIDIA request could not be completed.")


async def check_image_with_nvidia_vision(image_bytes: bytes) -> Optional[Dict[str, Any]]:
    """Asynchronously calls the NVIDIA NIM vision forensic inspection in a worker thread."""
    return await asyncio.to_thread(_sync_call_nvidia, image_bytes)
