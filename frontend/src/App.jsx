import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import SamplePresets from './components/SamplePresets';
import ResultDashboard from './components/ResultDashboard';
import { AlertCircle, Radio, Sparkles, Shield } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);

  // Theme Management (Default to Dark, toggleable to Light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('the_eyes_theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('the_eyes_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#050508] text-slate-900 dark:text-white flex flex-col relative selection:bg-[#FFE600] selection:text-black transition-colors duration-200">
      {/* Background Dot Matrix */}
      <div className="fixed inset-0 bg-brutal-grid opacity-35 pointer-events-none" />

      {/* Header */}
      <Header
        backendHealth={backendHealth}
        onReset={handleReset}
        hasResult={!!result}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 z-10">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FF2E63] text-white border-2 border-black flex items-start justify-between gap-3 text-xs font-mono font-black shadow-[4px_4px_0px_#000000]">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 stroke-[3]" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="bg-black text-white px-2.5 py-1 rounded border-2 border-white hover:bg-white hover:text-black transition-colors"
            >
              DISMISS
            </button>
          </div>
        )}

        {!result ? (
          <div className="max-w-4xl mx-auto space-y-6 pt-2">
            {/* Mission Hero Banner */}
            <div className="glass-brutal rounded-xl p-7 sm:p-8 relative overflow-hidden shadow-[8px_8px_0px_#000000]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded bg-[#FFE600] text-black font-mono font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF]">
                      AI IMAGE FORENSICS
                    </span>
                    <span className="px-3 py-1 rounded bg-white dark:bg-[#181824] text-black dark:text-white font-mono font-black text-xs border-2 border-black dark:border-white shadow-[2px_2px_0px_#000000]">
                      RFC 2D-FFT SPECIFICATION
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-black dark:text-white leading-tight">
                    Frequency Domain <span className="underline underline-offset-4 decoration-4 text-black dark:text-[#FFE600]">AI Detector</span>
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-mono mt-3 max-w-xl leading-relaxed font-bold">
                    Computes 2D Fourier log-magnitude harmonic decay to isolate generative latent diffusion VAE upsampling artifacts across Midjourney, ChatGPT (DALL-E 3), Gemini (Imagen 3), and SDXL.
                  </p>
                </div>

                <div className="hidden md:flex flex-col items-end text-right font-mono text-xs text-black dark:text-white border-l-2 border-black/30 dark:border-white/40 pl-6 space-y-2">
                  <span className="px-3 py-1.5 rounded bg-white dark:bg-[#181824] border-2 border-black dark:border-white font-black shadow-brutal-sm text-black dark:text-white">
                    Multi-Spectral Pipeline
                  </span>
                  <span className="px-3 py-1.5 rounded bg-white dark:bg-[#181824] border-2 border-black dark:border-white text-black dark:text-white font-bold shadow-brutal-sm">
                    40-Dim FFT Harmonics
                  </span>
                  <span className="px-3 py-1.5 rounded bg-[#00F5A0] text-black font-black border-2 border-black shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF]">
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
              <div className="glass-brutal-card rounded-xl p-4.5 border-2 border-black dark:border-[#00F0FF] bg-[#F0F9FF] dark:bg-[#0A141A]">
                <div className="text-xs font-mono font-black text-[#0369A1] dark:text-[#00F0FF] uppercase mb-1.5 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 stroke-[3]" />
                  01. 2D Fourier Matrix
                </div>
                <p className="text-xs text-slate-800 dark:text-white font-mono leading-relaxed font-bold">
                  Translates spatial RGB pixels into continuous 2D frequency harmonics.
                </p>
              </div>

              <div className="glass-brutal-card rounded-xl p-4.5 border-2 border-black dark:border-[#00F5A0] bg-[#ECFDF5] dark:bg-[#0A1A14]">
                <div className="text-xs font-mono font-black text-[#047857] dark:text-[#00F5A0] uppercase mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 stroke-[3]" />
                  02. Azimuthal Decay
                </div>
                <p className="text-xs text-slate-800 dark:text-white font-mono leading-relaxed font-bold">
                  Isolates abnormal high-frequency shelves characteristic of neural latent decoders.
                </p>
              </div>

              <div className="glass-brutal-card rounded-xl p-4.5 border-2 border-black dark:border-[#B066FF] bg-[#FAF5FF] dark:bg-[#140A1A]">
                <div className="text-xs font-mono font-black text-[#6D28D9] dark:text-[#B066FF] uppercase mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 stroke-[3]" />
                  03. Cloud Consensus
                </div>
                <p className="text-xs text-slate-800 dark:text-white font-mono leading-relaxed font-bold">
                  Side-by-side consensus validation with NVIDIA DiffusionGemma 26B Vision AI.
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
      <footer className="border-t-2 border-black dark:border-white bg-white dark:bg-black py-4 text-center text-xs text-black dark:text-white font-mono font-black z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-black tracking-wide">THE EYES 2.0 • HIGH-CONTRAST NEO-BRUTALISM + GLASSMORPHISM</span>
          <span className="text-[#B45309] dark:text-[#FFE600]">FastAPI • Scikit-Learn • React • Vite • Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}
