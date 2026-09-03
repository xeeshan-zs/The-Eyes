import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import SamplePresets from './components/SamplePresets';
import ResultDashboard from './components/ResultDashboard';
import { AlertCircle, Terminal, HardDrive, Cpu, Radio, Sparkles, Layers, Shield } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendHealth(data);
      } else {
        setBackendHealth({ status: 'offline' });
      }
    } catch {
      setBackendHealth({ status: 'offline' });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelected = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    const previewUrl = URL.createObjectURL(selectedFile);
    setImagePreview(previewUrl);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${response.status}: Analysis failed.`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Inference error:', err);
      setError(
        err.message || 'Unable to connect to backend server. Verify FastAPI is active on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-brutal-bg text-slate-100 flex flex-col relative selection:bg-brutal-yellow selection:text-black">
      {/* Background Dot Matrix */}
      <div className="fixed inset-0 bg-brutal-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <Header backendHealth={backendHealth} onReset={handleReset} hasResult={!!result} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 z-10">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-brutal-pink text-white border-2 border-black flex items-start justify-between gap-3 text-xs font-mono font-bold shadow-brutal">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="bg-black text-white px-2 py-0.5 rounded border border-white hover:bg-white hover:text-black transition-colors"
            >
              DISMISS
            </button>
          </div>
        )}

        {!result ? (
          <div className="max-w-4xl mx-auto space-y-6 pt-2">
            {/* Mission Hero Banner */}
            <div className="glass-brutal rounded-xl p-7 sm:p-8 relative overflow-hidden shadow-brutal">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded bg-brutal-yellow text-black font-mono font-black text-xs border border-black shadow-brutal-sm">
                      AI IMAGE FORENSICS
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      RFC 2D-FFT SPECIFICATION
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white leading-tight">
                    Frequency Domain <span className="text-brutal-yellow underline underline-offset-4 decoration-4">AI Detector</span>
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 font-mono mt-3 max-w-xl leading-relaxed">
                    Computes 2D Fourier log-magnitude harmonic decay ($\log(1+|F(u,v)|)$) to detect generative latent diffusion VAE upsampling artifacts across Midjourney, ChatGPT (DALL-E 3), Gemini (Imagen 3), and SDXL.
                  </p>
                </div>

                <div className="hidden md:flex flex-col items-end text-right font-mono text-xs text-slate-400 border-l-2 border-brutal-border pl-6 space-y-1.5">
                  <span className="px-2 py-1 rounded bg-black border border-brutal-border text-white font-bold">
                    Multi-Spectral Pipeline
                  </span>
                  <span className="px-2 py-1 rounded bg-black border border-brutal-border text-slate-300">
                    40-Dim FFT Harmonics
                  </span>
                  <span className="px-2 py-1 rounded bg-brutal-green text-black font-black border border-black shadow-brutal-sm">
                    0ms Cloud Latency
                  </span>
                </div>
              </div>
            </div>

            {/* Dropzone */}
            <Dropzone
              onFileSelected={handleFileSelected}
              loading={loading}
              currentPreview={imagePreview}
            />

            {/* Benchmark Presets */}
            <SamplePresets
              onSelectSample={handleFileSelected}
              disabled={loading}
            />

            {/* Explainer 3-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="glass-brutal-card rounded-lg p-4">
                <div className="text-xs font-mono font-black text-brutal-cyan uppercase mb-1 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 stroke-[2.5]" />
                  01. 2D Fourier Matrix
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  Translates spatial RGB pixels into continuous 2D frequency harmonics.
                </p>
              </div>

              <div className="glass-brutal-card rounded-lg p-4">
                <div className="text-xs font-mono font-black text-brutal-green uppercase mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 stroke-[2.5]" />
                  02. Azimuthal Decay
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  Isolates abnormal high-frequency shelves characteristic of neural latent decoders.
                </p>
              </div>

              <div className="glass-brutal-card rounded-lg p-4">
                <div className="text-xs font-mono font-black text-brutal-purple uppercase mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  03. Cloud Consensus
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  Side-by-side consensus validation with Sightengine GenAI enterprise endpoint.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ResultDashboard
            result={result}
            originalImagePreview={imagePreview}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-brutal-border bg-black/90 py-4 text-center text-xs text-slate-400 font-mono z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-white">THE EYES 2.0 • MINIMALIST NEO-BRUTALISM + GLASSMORPHISM</span>
          <span>FastAPI • Scikit-Learn • React • Vite • Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}
