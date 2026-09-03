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
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Tech Ambient Grid & Radial Glows */}
      <div className="fixed inset-0 bg-tech-grid opacity-25 pointer-events-none" />
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 right-10 w-[500px] h-[400px] bg-gradient-to-t from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Futuristic Command Header */}
      <Header backendHealth={backendHealth} onReset={handleReset} hasResult={!!result} />

      {/* Main Studio Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 z-10">
        {/* Error Notification Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 flex items-start justify-between gap-3 text-xs font-mono backdrop-blur-md shadow-glow-rose">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-white underline cursor-pointer font-bold"
            >
              DISMISS
            </button>
          </div>
        )}

        {!result ? (
          <div className="max-w-4xl mx-auto space-y-6 pt-2 sm:pt-4">
            {/* Mission Hero Card */}
            <div className="glass-panel rounded-2xl p-7 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full shadow-glow-cyan">
                      FORENSIC SPECTRAL STUDIO
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      RFC 2D-FFT SPECIFICATION
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white leading-tight">
                    Frequency Domain <span className="text-cyan-400">AI Detector</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                    Computes 2D Fourier log-magnitude harmonic decay ($\log(1+|F(u,v)|)$) to detect generative latent diffusion VAE upsampling artifacts across Midjourney, ChatGPT (DALL-E 3), Gemini (Imagen 3), and SDXL.
                  </p>
                </div>

                <div className="hidden md:flex flex-col items-end text-right font-mono text-xs text-slate-400 border-l border-white/[0.1] pl-6 space-y-1">
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Multi-Spectral Pipeline
                  </span>
                  <span>40-Dim FFT Harmonics</span>
                  <span className="text-cyan-400 font-bold">0ms Cloud Latency</span>
                </div>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <Dropzone
              onFileSelected={handleFileSelected}
              loading={loading}
              currentPreview={imagePreview}
            />

            {/* 1-Click Instant Benchmark Presets */}
            <SamplePresets
              onSelectSample={handleFileSelected}
              disabled={loading}
            />

            {/* Architecture Explainer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="glass-panel glass-panel-hover rounded-xl p-4">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  01. 2D Fourier Matrix
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  Translates spatial RGB pixels into continuous 2D frequency harmonics.
                </p>
              </div>

              <div className="glass-panel glass-panel-hover rounded-xl p-4">
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  02. Azimuthal Decay
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  Isolates abnormal high-frequency shelves characteristic of neural latent decoders.
                </p>
              </div>

              <div className="glass-panel glass-panel-hover rounded-xl p-4">
                <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
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

      {/* Cyber Footer */}
      <footer className="border-t border-white/[0.08] bg-space-950/90 py-4 text-center text-xs text-slate-500 font-mono z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>THE EYES STUDIO • FORENSIC 2D FFT AI CLASSIFIER</span>
          <span className="text-slate-400">FastAPI • Scikit-Learn • React • Vite • Tailwind</span>
        </div>
      </footer>
    </div>
  );
}
