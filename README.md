<div align="center">

# 👁️ THE EYES
### Forensic 2D FFT Frequency Fingerprint Classifier for AI-Generated Images

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>An image detector that estimates whether a picture is AI-generated using a trained spectral and texture classifier on the backend.</b>
</p>

</div>

---

## 🔬 Scientific Core: How It Works

The local classifier measures directional frequency energy, block cosine coefficients and neighboring pixel differences at two image sizes. It learns which combinations occur in labeled training images. Photos and generated images can share these patterns, and resizing or recompression can change the score.

```
                        ┌──────────────────────────────┐
                        │   Spatial RGB Input Image    │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                 ┌───────────────────────────────────────────┐
                 │    2D Fast Fourier Transform (FFT-2D)     │
                 │      F(u,v) = ∬ f(x,y) e^{-j2π(ux+vy)}    │
                 └─────────────────────┬─────────────────────┘
                                       │
                                       ▼
                 ┌───────────────────────────────────────────┐
                 │     Centered Log-Magnitude Spectrum       │
                 │         S(u,v) = log(1 + |F(u,v)|)        │
                 └─────────────────────┬─────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
     ┌─────────────────────────────┐       ┌─────────────────────────────┐
     │   Directional FFT, block    │       │   Inferno Visual Spectrum   │
     │   DCT and pixel texture     │       │    PNG Data URI Generator   │
     └──────────────┬──────────────┘       └─────────────────────────────┘
                    │
                    ▼
     ┌─────────────────────────────┐
     │  Scikit-Learn Classifier    │
     │   Spectral + Texture Model  │
     └──────────────┬──────────────┘
                    │
                    ▼
     ┌─────────────────────────────┐
     │   Forensic Classification   │
     │   AUTHENTIC  vs.  SYNTHETIC │
     └─────────────────────────────┘
```

1. **2D Continuous Fourier Transform**: The grayscale spatial representation $f(x, y)$ is transformed into the frequency plane $F(u, v)$ with the zero-frequency DC component shifted to the center.
2. **Log-Magnitude Spectrum**: Computes $S(u, v) = \log(1 + |F(u, v)|)$ and maps it to a normalized dynamic range with an `inferno` colormap.
3. **1D Azimuthal Radial Integration**: Averages circular frequency bands from radius $r=0$ (DC component) to $r=r_{\max}$ (Nyquist frequency $\pi$), generating a 1D spectral energy profile.
4. **Local classification** uses 474 measurements from the image pixels. The radial plot provides a visual diagnostic alongside the classifier score.

---

## Using The Eyes

Open the [live detector](https://z-eyes.web.app/) and choose an image, drop a file, or paste one from the clipboard. The result shows the classifier score alongside the Fourier spectrum, radial profile, and texture diagnostics. **Test again** analyzes the same file. **New image** opens the file picker. The eye logo returns to the upload screen.

The demo presets draw canvas patterns so visitors can explore the interface. The accuracy results below come from labeled image files.

### Install the web app

On the first visit, choose **Install The Eyes**. Browsers that support an install prompt show their confirmation dialog. On iPhone or iPad, open the site in Safari and use **Share → Add to Home Screen**. **Not now** dismisses the invitation on that browser, and the smaller install link remains available.

The installed app opens in its own window. Image analysis requires a connection to the Render backend. When an installed app launches offline, it offers a retry link.

## 📁 Repository Structure

```
the eyes/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI backend, CORS, /predict endpoint
│   │   ├── feature_extractor.py    # extract_fingerprint, FFT spectrum & diagnostics
│   │   ├── image_features.py       # Spectral and texture features shared with training
│   │   └── sightengine_service.py  # Sightengine GenAI API client
│   ├── .env.example                # Sample environment variables
│   ├── requirements.txt            # Python dependencies
│   └── model.pkl                   # (Optional location for trained model)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                # System status bar with live telemetry
│   │   │   ├── Dropzone.jsx              # Drag-and-drop / paste image zone
│   │   │   ├── SamplePresets.jsx         # 1-click test benchmark suite
│   │   │   ├── VerdictBadge.jsx          # Hero REAL vs AI-GENERATED verdict
│   │   │   ├── ForensicMetrics.jsx       # Diagnostic numerical readouts
│   │   │   ├── RadialProfileChart.jsx    # 1D Azimuthal radial decay chart
│   │   │   ├── ImageComparisonSlider.jsx # Interactive split wiper slider
│   │   │   ├── InstallInvite.jsx         # Browser installation prompt and guidance
│   │   │   └── ResultDashboard.jsx       # Unified multi-mode workspace
│   │   ├── App.jsx                       # Application state & routing
│   │   ├── main.jsx                      # React entrypoint
│   │   └── index.css                     # Tailwind CSS & animations
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── ai_detector_svm.pkl             # Fallback copy of the local classifier
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv

# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
# source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# (Optional) Setup Sightengine API credentials
cp .env.example .env

# Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- Backend API: `http://localhost:8000`
- API Health Status: `http://localhost:8000/health`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

In a separate terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## Training and evaluating the local classifier

The saved local detector combines gradient-boosted trees with a neural network. Training used 94,170 portrait originals and 4,515 public scene originals, plus 49,353 edited views. It gave the portrait and scene sources 70% and 30% of the training weight respectively, balancing real and generated examples within each source. Validation selected the average of the two classifiers at a fixed AI-score cutoff of 0.5. On the same 482 public validation scenes, the portrait-only run scored 47.3% and the mixed run scored 78.4%.

| Held-out test images | Previous accuracy | Retrained accuracy | Real images flagged as AI, previous → retrained |
| --- | ---: | ---: | ---: |
| Original audit, 2,000 portraits | 53.75% | 71.60% | 574 → 323 of 1,000 |
| Another 2,000 test portraits | 54.85% | 72.20% | 563 → 317 of 1,000 |
| Publisher's 1,000 test scenes | 43.10% | 84.00% | 378 → 87 of 500 |

On 200 reference portraits, JPEG recompression changed 41 retrained verdicts (previously 64), and halving the resolution changed 60 (previously 102). Exporting every public scene at 256 × 256 JPEG quality 80 reduced the retrained accuracy to 70.1%. The retrained model flagged 34 of 100 photographs from the independent [Berkeley BSDS300 test set](https://www2.eecs.berkeley.edu/Research/Projects/CS/vision/bsds/), down from 71. These measurements cover local inference using dataset labels. See the [full comparison and weight hashes](training/results.json).

From the repository root, install `backend/requirements.txt` and place the portrait archive at `data-set/archive.zip`. To reproduce the run with additional scenes, prepare the [public scene dataset](https://huggingface.co/datasets/julienlucas/midjourney-dalle-sd-dataset) and train a candidate.

```sh
python -m pip install pyarrow
python training/fetch_public_data.py
python training/prepare_public_data.py
python train_model.py --with-public-scenes --output data-set/candidate.pkl
```

The trainer reserves the test and validation splits before sampling. It excludes exact file matches and screens for near-identical decoded images across splits using a perceptual hash and thumbnail distance. It trains on original, resized and recompressed images and selects the classifier using validation data. Run `python train_model.py` for portrait-only training. Without `--output`, the trainer writes both application weight files.

To repeat the comparison, supply the original radial model (`backend/model.pkl` at Git revision `3bb3fba`) as `--previous`. The reference cohort uses the same 2,000 images as the first audit. A second cohort samples 2,000 different test portraits. The public test split measures performance on other scenes. The optional `--photo-test data-set/BSDS300-images.tgz` argument includes the Berkeley check.

```sh
python -m training.evaluate --previous data-set/baseline-radial.pkl --candidate data-set/candidate.pkl --with-public-scenes
```

The backend reads the feature version stored in the weights. New models use the shared extractor in `backend/app/image_features.py`. Older 40-feature weights use the original radial extractor. Restart the backend after replacing the weights.

For custom features, update the shared extractor and its `FEATURE_VERSION` before retraining. The health endpoint and each local prediction include the SHA-256 of the loaded weights.

---

## 🌐 Sightengine GenAI API Setup (Optional)

To include an optional external benchmark in the API response:
1. Create a free account at [Sightengine](https://sightengine.com/).
2. In `backend/.env`, set:
   ```env
   SIGHTENGINE_API_USER=your_user_id
   SIGHTENGINE_API_SECRET=your_secret_key
   ```
3. Restart the backend server. When configured, the backend sends the uploaded image to Sightengine and returns its benchmark separately from the detector verdict.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
