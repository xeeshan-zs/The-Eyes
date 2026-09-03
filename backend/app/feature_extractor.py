"""Feature extraction, 2D FFT spectrum generation, and spectral diagnostics module.

Provides:
1. `generate_fft_spectrum_image`: High-res 2D FFT shifted log-magnitude spectrum (base64 PNG).
2. `extract_fingerprint`: 1D feature vector for model inference (SVM / Random Forest).
3. `compute_spectral_diagnostics`: Radial frequency decay profile, theoretical natural 1/f curve,
   spectral entropy, and high-frequency energy metrics for forensic charts.
"""

import io
import base64
import numpy as np
from PIL import Image
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt


def generate_fft_spectrum_image(image: Image.Image, target_size: tuple[int, int] = (512, 512)) -> str:
    """Computes the 2D FFT log-magnitude spectrum and returns an inferno colormapped base64 PNG."""
    gray_img = image.convert("L").resize(target_size, Image.Resampling.BILINEAR)
    img_array = np.asarray(gray_img, dtype=np.float32) / 255.0

    # 2D Fast Fourier Transform with zero-frequency centered
    fft_2d = np.fft.fft2(img_array)
    fft_shift = np.fft.fftshift(fft_2d)

    # Log magnitude spectrum: log(1 + |F(u, v)|)
    magnitude = np.abs(fft_shift)
    log_magnitude = np.log1p(magnitude)

    # Normalize to [0, 1]
    min_val, max_val = np.min(log_magnitude), np.max(log_magnitude)
    norm_spectrum = (log_magnitude - min_val) / (max_val - min_val + 1e-8)

    # Create dark-themed high-contrast rendering
    fig, ax = plt.subplots(figsize=(6, 6), dpi=120)
    fig.patch.set_facecolor("#070A0F")
    ax.set_facecolor("#070A0F")
    ax.imshow(norm_spectrum, cmap="inferno", interpolation="nearest")
    ax.axis("off")
    plt.tight_layout(pad=0)

    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", pad_inches=0, facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)

    base64_str = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{base64_str}"


def extract_fingerprint(image: Image.Image) -> np.ndarray:
    """Extracts frequency-domain fingerprint features for model classification.
    
    You can paste your custom feature extractor here.
    """
    target_dim = 256
    gray_img = image.convert("L").resize((target_dim, target_dim), Image.Resampling.BILINEAR)
    img_array = np.asarray(gray_img, dtype=np.float32) / 255.0

    fft_2d = np.fft.fft2(img_array)
    fft_shift = np.fft.fftshift(fft_2d)
    magnitude = np.log1p(np.abs(fft_shift))

    center_y, center_x = target_dim // 2, target_dim // 2
    y, x = np.ogrid[:target_dim, :target_dim]
    r = np.hypot(x - center_x, y - center_y).astype(int)

    max_radius = target_dim // 2
    radial_profile = np.zeros(max_radius, dtype=np.float32)
    for radius in range(max_radius):
        mask = (r == radius)
        if np.any(mask):
            radial_profile[radius] = np.mean(magnitude[mask])

    if np.max(radial_profile) > np.min(radial_profile):
        radial_profile = (radial_profile - np.min(radial_profile)) / (
            np.max(radial_profile) - np.min(radial_profile) + 1e-8
        )

    return radial_profile


def compute_spectral_diagnostics(image: Image.Image, num_bins: int = 48) -> dict:
    """Computes forensic frequency analytics and radial decay curve for charting."""
    w, h = image.size
    target_dim = 256
    gray_img = image.convert("L").resize((target_dim, target_dim), Image.Resampling.BILINEAR)
    img_array = np.asarray(gray_img, dtype=np.float32) / 255.0

    fft_2d = np.fft.fft2(img_array)
    fft_shift = np.fft.fftshift(fft_2d)
    magnitude = np.abs(fft_shift)
    log_mag = np.log1p(magnitude)

    center_y, center_x = target_dim // 2, target_dim // 2
    y, x = np.ogrid[:target_dim, :target_dim]
    r = np.hypot(x - center_x, y - center_y)
    max_radius = target_dim / 2.0

    # Downsample radial distribution into discrete bins
    bin_edges = np.linspace(0, max_radius, num_bins + 1)
    radial_values = []
    natural_1f_curve = []

    for i in range(num_bins):
        mask = (r >= bin_edges[i]) & (r < bin_edges[i + 1])
        if np.any(mask):
            mean_val = float(np.mean(log_mag[mask]))
        else:
            mean_val = 0.0
        radial_values.append(mean_val)

        # Theoretical natural 1/f^alpha optical decay
        norm_r = (i + 1) / float(num_bins)
        natural_1f_curve.append(float(1.0 / (1.0 + 4.0 * (norm_r ** 1.8))))

    # Normalize radial curve for comparative overlay
    max_rad = max(radial_values) if radial_values else 1.0
    min_rad = min(radial_values) if radial_values else 0.0
    norm_radial = [round((val - min_rad) / (max_rad - min_rad + 1e-8), 4) for val in radial_values]
    norm_natural = [round(val, 4) for val in natural_1f_curve]

    # Calculate high-frequency energy ratio in upper 30% band
    high_freq_slice = norm_radial[int(num_bins * 0.7):]
    hf_energy_ratio = round(float(np.mean(high_freq_slice)), 4) if high_freq_slice else 0.0

    # Spectral entropy calculation
    prob_dist = magnitude.flatten() / (np.sum(magnitude) + 1e-12)
    prob_dist = prob_dist[prob_dist > 0]
    entropy_val = float(-np.sum(prob_dist * np.log2(prob_dist)))
    norm_entropy = round(min(1.0, max(0.0, entropy_val / 16.0)), 4)

    return {
        "dimensions": [w, h],
        "radial_profile": norm_radial,
        "natural_curve": norm_natural,
        "high_freq_ratio": hf_energy_ratio,
        "spectral_entropy": norm_entropy,
        "nyquist_bins": num_bins,
    }
