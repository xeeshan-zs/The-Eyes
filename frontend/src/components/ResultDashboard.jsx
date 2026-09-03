import React, { useState } from 'react';
import { Eye, Activity, Crosshair, ArrowRightLeft, Sliders, LineChart, Download, Copy, Check, Sparkles } from 'lucide-react';
import VerdictBadge from './VerdictBadge';
import ApiComparison from './ApiComparison';
import RadialProfileChart from './RadialProfileChart';
import ImageComparisonSlider from './ImageComparisonSlider';
import ForensicMetrics from './ForensicMetrics';

export default function ResultDashboard({ result, originalImagePreview, onReset }) {
  const [activeTab, setActiveTab] = useState('slider'); // 'slider' | 'dual' | 'chart'
  const [copied, setCopied] = useState(false);
  const [showReticle, setShowReticle] = useState(true);

  if (!result) return null;

  const isFake = result.prediction?.toLowerCase() === 'fake' || result.prediction?.toLowerCase() === 'ai';

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpectrum = () => {
    if (!result.fft_spectrum_image) return;
    const link = document.createElement('a');
    link.href = result.fft_spectrum_image;
    link.download = `fft_spectrum_${result.filename || 'image'}.png`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* 1. Hero Verdict HUD */}
      <VerdictBadge result={result} />

      {/* 2. Numerical Forensic Diagnostics */}
      <ForensicMetrics result={result} />

      {/* 3. Forensic Multi-Lens Studio Viewport */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        {/* Viewport Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-space-950/80 border-b border-white/[0.08]">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-space-900/90 p-1.5 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                activeTab === 'slider'
                  ? 'bg-cyan-500 text-space-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Split Lens Wiper
            </button>

            <button
              onClick={() => setActiveTab('dual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                activeTab === 'dual'
                  ? 'bg-cyan-500 text-space-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Dual Spatial / FFT
            </button>

            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                activeTab === 'chart'
                  ? 'bg-cyan-500 text-space-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              1D Spectral Decay
            </button>
          </div>

          {/* Quick Action Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'COPIED' : 'JSON'}</span>
            </button>

            <button
              onClick={handleDownloadSpectrum}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Download FFT Spectrum PNG"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>EXPORT FFT</span>
            </button>

            <button
              onClick={onReset}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-black text-xs font-mono flex items-center gap-1.5 transition-all shadow-glow-cyan"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>ANALYZE ANOTHER</span>
            </button>
          </div>
        </div>

        {/* Studio Viewport Content */}
        <div className="p-5 sm:p-6">
          {activeTab === 'slider' && (
            <ImageComparisonSlider
              originalImage={originalImagePreview}
              fftImage={result.fft_spectrum_image}
              filename={result.filename}
            />
          )}

          {activeTab === 'dual' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Input Image */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                      Spatial Pixel Domain (RGB)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                    {result.filename || 'input_image.png'}
                  </span>
                </div>

                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-space-950 border border-white/[0.08] flex items-center justify-center">
                  <img
                    src={originalImagePreview}
                    alt="Input spatial image"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-space-950/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-300 border border-emerald-500/30 shadow-lg">
                    Spatial Matrix
                  </div>
                </div>

                <p className="mt-3.5 text-xs text-slate-400 leading-relaxed font-mono">
                  Natural human visual domain. Generative neural network deconvolution grids and VAE latent noise floors are often imperceptible to the naked eye.
                </p>
              </div>

              {/* Right: 2D FFT Frequency Spectrum */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                      2D FFT Magnitude Spectrum
                    </span>
                  </div>
                  <button
                    onClick={() => setShowReticle(!showReticle)}
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    {showReticle ? 'Reticle: ON' : 'Reticle: OFF'}
                  </button>
                </div>

                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-space-950 border border-white/[0.08] flex items-center justify-center">
                  <img
                    src={result.fft_spectrum_image}
                    alt="2D FFT Spectrum"
                    className="w-full h-full object-contain"
                  />

                  {/* Reticle Guides */}
                  {showReticle && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-full h-[1px] bg-cyan-400/25" />
                      <div className="h-full w-[1px] bg-cyan-400/25 absolute" />
                      <div className="w-1/3 h-1/3 rounded-full border border-cyan-400/25 absolute" />
                      <div className="w-2/3 h-2/3 rounded-full border border-cyan-400/20 absolute" />
                      <div className="w-[95%] h-[95%] rounded-full border border-dashed border-cyan-400/15 absolute" />
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-2.5 bg-space-950/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30 shadow-lg">
                    Inferno Spectrum log(1+|F(u,v)|)
                  </div>
                </div>

                <p className="mt-3.5 text-xs text-slate-400 leading-relaxed font-mono">
                  Centered zero frequency (DC). Latent diffusion &amp; GAN models manifest elevated energy shelves along outer radii and periodic harmonic cross-spikes.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <RadialProfileChart
              diagnostics={result.diagnostics}
              isFake={isFake}
            />
          )}
        </div>
      </div>

      {/* 4. Commercial Model Comparison Card */}
      <ApiComparison result={result} />
    </div>
  );
}
