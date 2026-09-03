import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import SamplePresets from './components/SamplePresets';
import ResultDashboard from './components/ResultDashboard';
import { AlertCircle, Terminal, HardDrive, Cpu, Radio } from 'lucide-react';

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
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Precision Forensic Header */}
      <Header backendHealth={backendHealth} onReset={handleReset} hasResult={!!result} />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Notification Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-start justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 underline cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        )}

        {!result ? (
          <div className="max-w-4xl mx-auto space-y-5 pt-2 sm:pt-6">
            {/* Mission Hero Header */}
            <div className="border border-[#21262D] bg-[#0D1117] rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
                      SPECTRAL FORENSICS ENGINE
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      RFC 2D-FFT SPEC
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                    Frequency Domain AI Fingerprint Classifier
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Evaluates 2D Fourier log-magnitude harmonic decay ($\log(1+|F(u,v)|)$) to detect synthetic GAN and diffusion generative grid deconvolution artifacts.
                  </p>
                </div>

                <div className="hidden sm:flex flex-col items-end text-right font-mono text-[11px] text-slate-400 border-l border-[#21262D] pl-4">
                  <span className="text-slate-300 font-bold">2D FFT + SVM / RF</span>
                  <span>Azimuthal Radial Bins</span>
                  <span className="text-cyan-400">0ms Cloud Egress</span>
                </div>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <Dropzone
              onFileSelected={handleFileSelected}
              loading={loading}
              currentPreview={imagePreview}
            />

            {/* 1-Click Preset Benchmark Test Suite */}
            <SamplePresets
              onSelectSample={handleFileSelected}
              disabled={loading}
            />

            {/* Architecture Overview Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#0D1117] border border-[#21262D] rounded-lg p-3 text-left">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1 font-bold">
                  01. Fourier Transform
                </div>
                <p className="text-xs text-slate-400">
                  Translates spatial pixel matrix into 2D continuous frequency spectra.
                </p>
              </div>

              <div className="bg-[#0D1117] border border-[#21262D] rounded-lg p-3 text-left">
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1 font-bold">
                  02. Azimuthal Radial Decay
                </div>
                <p className="text-xs text-slate-400">
                  Isolates abnormal high-frequency shelves characteristic of neural upsamplers.
                </p>
              </div>

              <div className="bg-[#0D1117] border border-[#21262D] rounded-lg p-3 text-left">
                <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-1 font-bold">
                  03. Ensemble Consensus
                </div>
                <p className="text-xs text-slate-400">
                  Side-by-side validation with Sightengine GenAI enterprise endpoint.
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

      {/* Forensic Footer */}
      <footer className="border-t border-[#21262D] bg-[#070A0F] py-3 text-center text-[11px] text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>THE EYES FORENSICS • 2D FFT FREQUENCY CLASSIFIER</span>
          <span>FastAPI • Scikit-Learn • React • Vite • Tailwind</span>
        </div>
      </footer>
    </div>
  );
}
