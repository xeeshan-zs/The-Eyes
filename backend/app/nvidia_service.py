"""NVIDIA NIM Multi-Modal Vision Forensics Service.

Uses `google/diffusiongemma-26b-a4b-it` via the NVIDIA API Catalog
to perform deep visual & semantic forensic analysis on uploaded images.
"""

import os
import io
import json
import base64
import logging
import urllib.request
import urllib.error
from typing import Optional, Dict, Any
from PIL import Image

logger = logging.getLogger("ai_detector.nvidia")

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_MODEL = "google/diffusiongemma-26b-a4b-it"


def check_image_with_nvidia_vision(image_bytes: bytes) -> Optional[Dict[str, Any]]:
    """Analyzes an image using NVIDIA DiffusionGemma 26B vision-language forensic inspection."""
    if not NVIDIA_API_KEY:
        return None

    try:
        # Resize image to reasonable dimensions for fast transmission (max 768px)
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img.thumbnail((768, 768), Image.Resampling.BILINEAR)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
        data_uri = f"data:image/jpeg;base64,{b64_str}"

        prompt = (
            "Analyze this image carefully for visual forensics. "
            "Is this image an authentic real photograph or an AI-generated/synthetic image "
            "(e.g. Midjourney, DALL-E, Gemini, Stable Diffusion)?\n"
            "You MUST format your response as valid JSON with three keys:\n"
            '{"prediction": "fake" | "real", "confidence": 0.85, "explanation": "1-2 sentence forensic explanation"}'
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
            "max_tokens": 512,
            "stream": False,
            "temperature": 0.1,
            "top_p": 0.95
        }

        headers = {
            "Authorization": f"Bearer {NVIDIA_API_KEY}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        req = urllib.request.Request(
            NVIDIA_INVOKE_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=20) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            content = res_data["choices"][0]["message"]["content"].strip()

            # Clean JSON markdown fences if present
            clean_content = content
            if "```json" in clean_content:
                clean_content = clean_content.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_content:
                clean_content = clean_content.split("```")[1].split("```")[0].strip()

            try:
                parsed = json.loads(clean_content)
                pred = str(parsed.get("prediction", "real")).lower()
                is_fake = "fake" in pred or "ai" in pred or "synth" in pred
                conf = float(parsed.get("confidence", 0.85))
                expl = str(parsed.get("explanation", content))

                return {
                    "available": True,
                    "model": "DiffusionGemma 26B",
                    "prediction": "fake" if is_fake else "real",
                    "confidence": round(conf, 2),
                    "explanation": expl,
                }
            except Exception:
                # Text fallback parsing
                is_fake = "ai-generated" in content.lower() or "fake" in content.lower() or "synthetic" in content.lower()
                return {
                    "available": True,
                    "model": "DiffusionGemma 26B",
                    "prediction": "fake" if is_fake else "real",
                    "confidence": 0.88,
                    "explanation": content.replace("\n", " ").strip(),
                }

    except urllib.error.HTTPError as e:
        logger.warning(f"NVIDIA API HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        logger.warning(f"NVIDIA Vision inference error: {e}")
        return None
