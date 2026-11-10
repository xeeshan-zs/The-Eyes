import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import SamplePresets from './components/SamplePresets';
import ResultDashboard from './components/ResultDashboard';
import AboutPage from './components/AboutPage';
import { AlertCircle, Radio, Sparkles, Shield, Github, Zap } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [currentView, setCurrentView] = useState('detector'); // 'detector' | 'about'
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const predictionVersion = React.useRef(0);
  const healthFailures = React.useRef(0);

  // Theme Management (Light theme default)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('the_eyes_theme') || 'light';
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

  const [loadingMessage, setLoadingMessage] = useState('Extracting 2D Fourier Harmonics...');

  useEffect(() => {
    let stopped = false;
    let timer;
    let controller;

    async function checkHealth() {
      if (document.hidden || controller) return;
      const version = predictionVersion.current;
      controller = new AbortController();
      const deadline = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(`${API_BASE_URL}/health?t=${Date.now()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok || (await response.json()).status !== 'online') {
          throw new Error('Health check unsuccessful');
        }
        if (!stopped) {
          healthFailures.current = 0;
          setBackendStatus('online');
        }
      } catch {
        if (!stopped && version === predictionVersion.current) {
          healthFailures.current += 1;
          if (healthFailures.current >= 2) setBackendStatus('offline');
        }
      } finally {
        clearTimeout(deadline);
        controller = null;
        if (!stopped && !document.hidden) {
          timer = setTimeout(checkHealth, healthFailures.current ? 5000 : 60000);
        }
      }
    }

    function onVisibilityChange() {
      clearTimeout(timer);
      if (!document.hidden) checkHealth();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    checkHealth();
    return () => {
      stopped = true;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const handleFileSelected = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    const previewUrl = URL.createObjectURL(selectedFile);
    setImagePreview(previewUrl);

    setLoading(true);
    setLoadingMessage('Analyzing image texture and frequencies...');

    const msgTimer1 = setTimeout(() => {
      setLoadingMessage('Waiting for the detector...');
    }, 3500);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${response.status}: Server analysis failed.`);
      }

      const data = await response.json();
      predictionVersion.current += 1;
      healthFailures.current = 0;
      setBackendStatus('online');
      setResult(data);
      setCurrentView('detector');
    } catch (backendErr) {
      setError(backendErr.name === 'AbortError' ? 'The detector took too long. Please try again.' : backendErr.message);
    } finally {
      clearTimeout(msgTimer1);
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const picker = React.useRef(null);
  const chooseImage = () => picker.current?.click();
  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  return (
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#050508] text-slate-900 dark:text-white flex flex-col relative selection:bg-[#FFE600] selection:text-black transition-colors duration-200">
      {/* Background Dot Matrix */}
      <div className="fixed inset-0 bg-brutal-grid opacity-35 pointer-events-none" />

      {/* Header */}
      <Header
        backendStatus={backendStatus}
        onReset={chooseImage}
        hasResult={!!result}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      <input ref={picker} type="file" accept="image/*" hidden onChange={event => {
        const next = event.target.files?.[0];
        event.target.value = '';
        if (next) handleFileSelected(next);
      }} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-7 z-10">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-[#FF2E63] text-white border-2 border-black flex items-start justify-between gap-2.5 sm:gap-3 text-xs font-mono font-black shadow-[4px_4px_0px_#000000]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 stroke-[3]" />
              <span className="leading-snug">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="bg-black text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border-2 border-white hover:bg-white hover:text-black transition-colors flex-shrink-0 cursor-pointer text-[10px] sm:text-xs"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* View Routing */}
        {currentView === 'about' ? (
          <AboutPage onBackToDetector={() => setCurrentView('detector')} />
        ) : !result ? (
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pt-1 sm:pt-2">
            {/* Mission Hero Banner */}
            <div className="glass-brutal rounded-xl p-4 sm:p-8 relative overflow-hidden shadow-[6px_6px_0px_#000000] sm:shadow-[8px_8px_0px_#000000]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <span className="px-2.5 sm:px-3 py-1 rounded bg-[#FFE600] text-black font-mono font-black text-[11px] sm:text-xs border-2 border-black shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF]">
                      AI FORENSICS
                    </span>
                    <span className="px-2.5 sm:px-3 py-1 rounded bg-white dark:bg-[#181824] text-black dark:text-white font-mono font-black text-[11px] sm:text-xs border-2 border-black dark:border-white shadow-[2px_2px_0px_#000000]">
                      2D-FFT SPEC
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-black dark:text-white leading-tight">
                    Frequency Domain <span className="underline underline-offset-4 decoration-4 text-black dark:text-[#FFE600]">AI Detector</span>
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-mono mt-2 sm:mt-3 max-w-xl leading-relaxed font-bold">
                    Computes 2D Fourier log-magnitude harmonic decay to isolate generative latent diffusion VAE upsampling artifacts across Midjourney, ChatGPT (DALL-E 3), Gemini (Imagen 3), and SDXL.
                  </p>
                </div>

                <div className="hidden md:flex flex-col items-end text-right font-mono text-xs text-black dark:text-white border-l-2 border-black/30 dark:border-white/40 pl-6 space-y-2">
                  <span className="px-3 py-1.5 rounded bg-white dark:bg-[#181824] border-2 border-black dark:border-white font-black shadow-brutal-sm text-black dark:text-white">
                    Multi-Spectral Pipeline
                  </span>
                  <span className="px-3 py-1.5 rounded bg-white dark:bg-[#181824] border-2 border-black dark:border-white text-black dark:text-white font-bold shadow-brutal-sm">
                    Spectral and Texture Analysis
                  </span>
                </div>
              </div>
            </div>

            {/* Dropzone */}
            <Dropzone
              onFileSelected={handleFileSelected}
              loading={loading}
              loadingMessage={loadingMessage}
              currentPreview={imagePreview}
            />

            {/* Benchmark Presets */}
            <SamplePresets
              onSelectSample={handleFileSelected}
              disabled={loading}
            />

            {/* Explainer 3-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-brutal-card rounded-xl p-5 sm:p-6 border-2 border-black dark:border-[#00F0FF] bg-[#F0F9FF] dark:bg-[#0A141A] flex flex-col justify-between min-h-[140px]">
                <div className="text-xs font-mono font-black text-[#0369A1] dark:text-[#00F0FF] uppercase mb-2.5 flex items-center gap-2">
                  <Radio className="w-4 h-4 stroke-[3]" />
                  01. 2D Fourier Matrix
                </div>
                <p className="text-xs text-slate-800 dark:text-white font-mono leading-relaxed font-bold">
                  Translates spatial RGB pixels into continuous 2D frequency harmonics.
                </p>
              </div>

              <div className="glass-brutal-card rounded-xl p-5 sm:p-6 border-2 border-black dark:border-[#00F5A0] bg-[#ECFDF5] dark:bg-[#0A1A14] flex flex-col justify-between min-h-[140px]">
                <div className="text-xs font-mono font-black text-[#047857] dark:text-[#00F5A0] uppercase mb-2.5 flex items-center gap-2">
                  <Shield className="w-4 h-4 stroke-[3]" />
                  02. Azimuthal Decay
                </div>
                <p className="text-xs text-slate-800 dark:text-white font-mono leading-relaxed font-bold">
                  Isolates abnormal high-frequency shelves characteristic of neural latent decoders.
                </p>
              </div>

              <div className="glass-brutal-card rounded-xl p-5 sm:p-6 border-2 border-black dark:border-[#B066FF] bg-[#FAF5FF] dark:bg-[#140A1A] flex flex-col justify-between min-h-[140px]">
                <div className="text-xs font-mono font-black text-[#6D28D9] dark:text-[#B066FF] uppercase mb-2.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 stroke-[3]" />
                  03. Texture analysis
                </div>
                <p className="text-xs text-slate-800 dark:text-white font-mono leading-relaxed font-bold">
                  The classifier combines texture and frequency patterns to score the image.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ResultDashboard
            result={result}
            originalImagePreview={imagePreview}
            onNewImage={chooseImage}
            onTestAgain={() => handleFileSelected(file)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black dark:border-white bg-white dark:bg-black py-4 text-center text-xs text-black dark:text-white font-mono font-black z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-black tracking-wide">THE EYES 2.0 • BUILT BY ZEESHAN SARFRAZ</span>
            <button
              onClick={() => setCurrentView('about')}
              className="text-[#0284C7] dark:text-[#00F0FF] underline underline-offset-4 decoration-2 hover:text-black dark:hover:text-white transition-colors cursor-pointer font-black"
            >
              [ABOUT PROJECT]
            </button>
          </div>
          <a
            href="https://github.com/xeeshan-zs/The-Eyes"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded bg-[#FFE600] text-black border-2 border-black font-mono font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            <Github className="w-3.5 h-3.5" />
            <span>github.com/xeeshan-zs/The-Eyes ↗</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
