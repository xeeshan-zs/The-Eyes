import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import SamplePresets from './components/SamplePresets';
import ResultDashboard from './components/ResultDashboard';
import AboutPage from './components/AboutPage';
import InstallInvite from './components/InstallInvite';
import { AlertCircle, Radio, Sparkles, Shield, Github, Zap } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [currentView, setCurrentView] = useState('detector'); // 'detector' | 'about'
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
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

  const [status, setStatus] = useState('Checking');
  const revision = React.useRef(0);
  const lastCheck = React.useRef(0);
  const report = React.useCallback(value => {
    revision.current++;
    lastCheck.current = Date.now();
    setStatus(navigator.onLine ? value : 'Offline');
  }, []);
  useEffect(() => {
    let pending;
    async function check() {
      if (document.hidden || pending) return;
      if (!navigator.onLine) return report('Offline');
      const ticket = revision.current;
      const controller = pending = new AbortController();
      const timer = setTimeout(() => controller.abort(), 90000);
      try {
        const response = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store', signal: controller.signal });
        const ready = response.ok && (await response.json()).model_loaded;
        if (ticket === revision.current) report(ready ? 'Ready' : 'Unavailable');
      } catch {
        if (ticket === revision.current) report('Unreachable');
      } finally {
        clearTimeout(timer);
        if (pending === controller) pending = null;
      }
    }
    const offline = () => { report('Offline'); pending?.abort(); pending = null; };
    const online = () => { report('Checking'); check(); };
    const resume = () => { if (Date.now() - lastCheck.current > 60000 || lastCheck.current === 0) check(); };
    check();
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    document.addEventListener('visibilitychange', resume);
    return () => {
      revision.current++;
      pending?.abort();
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [report]);

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
        if (response.status >= 500) report('Unavailable');
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${response.status}: Server analysis failed.`);
      }

      const data = await response.json();
      report('Ready');
      setResult(data);
      setCurrentView('detector');
    } catch (backendErr) {
      if (backendErr instanceof TypeError || backendErr.name === 'AbortError') report('Unreachable');
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
        status={status}
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
            <header className="pt-3 sm:pt-5">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">AI image detector</h1>
              <p className="mt-2 text-sm sm:text-base">Choose an image to see whether its patterns suggest a photograph or AI generation.</p>
            </header>

            {/* Dropzone */}
            <Dropzone
              onFileSelected={handleFileSelected}
              loading={loading}
              loadingMessage={loadingMessage}
              currentPreview={imagePreview}
            />

            {/* Benchmark Presets */}
            <details className="rounded-lg border-2 border-black dark:border-white bg-white dark:bg-[#14141E] p-3 sm:p-4">
              <summary className="cursor-pointer font-bold">Try a sample image</summary>
              <div className="mt-3">
            <SamplePresets
              onSelectSample={handleFileSelected}
              disabled={loading}
            />

              </div>
            </details>

            {/* Explainer 3-Column Grid */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-4">
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
        <div className="mx-auto mt-6 max-w-4xl"><InstallInvite /></div>
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
