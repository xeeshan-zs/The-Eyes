"""Pixel features shared by the training job and the upload endpoint."""

import numpy as np
from PIL import Image
from scipy.fft import dctn, rfft2


FEATURE_VERSION = "spectral-texture-v2"
SCALES = (128, 256)
WINDOWS = {
    size: np.outer(np.hanning(size), np.hanning(size)).astype(np.float32)
    for size in SCALES
}


def _spectrum(luma, size):
    # Pool the two-dimensional spectrum without discarding its orientation.
    power = np.log1p(np.abs(rfft2((luma - luma.mean()) * WINDOWS[size])))
    half = size // 2
    folded = (power[1:half + 1, 1:] + power[-1:-half - 1:-1, 1:]) * 0.5
    grid = folded.reshape(8, half // 8, 8, half // 8).mean(axis=(1, 3))
    # Periodic grid peaks are much narrower than the pooled frequency bands.
    bins = np.array([size // 16, size // 8, size // 4, half - 1])
    peaks = []
    for axis in (power[0], power[:half + 1, 0], power.diagonal()):
        peaks.append(axis[bins] - (axis[bins - 1] + axis[bins + 1]) * 0.5)
    return [grid.ravel(), *peaks]


def _block_frequencies(luma, size):
    side = size // 8
    blocks = luma.reshape(side, 8, side, 8).transpose(0, 2, 1, 3)
    coefficients = np.abs(dctn(blocks, axes=(2, 3), norm="ortho"))
    # Relative texture in the middle and surrounding regions can survive
    # recompression even when the absolute energy of both regions changes.
    whole = coefficients.mean(axis=(0, 1))
    mid = slice(side // 4, 3 * side // 4)
    center = coefficients[mid, mid].mean(axis=(0, 1))
    return [np.log1p(whole).ravel()[1:], np.log1p(center[1:5, 1:5] / (whole[1:5, 1:5] + 0.1)).ravel()]


def _texture(channel):
    core = channel[1:-1, 1:-1]
    residual = (4 * core - channel[:-2, 1:-1] - channel[2:, 1:-1]
                - channel[1:-1, :-2] - channel[1:-1, 2:])
    magnitude = np.abs(residual)
    # Pool local noise energy over a 4 x 4 grid, then record adjacent signed
    # residuals to distinguish smooth regions from repeating pixel patterns.
    side = channel.shape[0] // 4 - 1
    grid = magnitude[1:-1, 1:-1].reshape(4, side, 4, side).mean(axis=(1, 3))
    levels = np.clip(np.rint(residual / 4), -2, 2).astype(np.int32) + 2
    pairs = 5 * levels[:, :-1] + levels[:, 1:]
    counts = np.bincount(pairs.ravel(), minlength=25) / pairs.size
    return [np.log1p(grid).ravel(), counts]


def extract_image_features(image: Image.Image) -> np.ndarray:
    rgb = image.convert("RGB")
    features = []
    for size in SCALES:
        scaled = rgb.resize((size, size), Image.Resampling.LANCZOS)
        channels = np.asarray(scaled.convert("YCbCr"), dtype=np.float32)
        luma = channels[:, :, 0]
        features.extend(_spectrum(luma, size))
        features.extend(_block_frequencies(luma, size))
        features.extend(_texture(luma))
        if size == SCALES[0]:
            for c in (1, 2):
                features.extend(_texture(channels[:, :, c]))
    return np.concatenate(features).astype(np.float32)
