import React, { useState } from 'react';
import { Eye, Activity, Crosshair, ArrowRightLeft, Sliders, LineChart, Download, Copy, Check } from 'lucide-react';
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
      {/* 1. Hero Verdict Badge */}
      <VerdictBadge result={result} />

      {/* 2. Forensic Metrics */}
      <ForensicMetrics result={result} />

      {/* 3. Studio Multi-Lens Container */}
      <div className="glass-brutal rounded-xl overflow-hidden shadow-brutal">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-black/90 border-b-2 border-brutal-border">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-black border-2 border-black transition-all ${
                activeTab === 'slider'
                  ? 'bg-brutal-yellow text-black shadow-brutal-sm translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-brutal-surface text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.5]" />
              SPLIT LENS
            </button>

            <button
              onClick={() => setActiveTab('dual')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-black border-2 border-black transition-all ${
                activeTab === 'dual'
                  ? 'bg-brutal-yellow text-black shadow-brutal-sm translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-brutal-surface text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.5]" />
              DUAL GRID
            </button>

            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-black border-2 border-black transition-all ${
                activeTab === 'chart'
                  ? 'bg-brutal-yellow text-black shadow-brutal-sm translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-brutal-surface text-slate-300 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.5]" />
              1D DECAY
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="btn-brutal px-3 py-1 rounded bg-brutal-surface text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brutal-green" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'COPIED' : 'JSON'}</span>
            </button>

            <button
              onClick={handleDownloadSpectrum}
              className="btn-brutal px-3 py-1 rounded bg-brutal-surface text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5"
              title="Download FFT PNG"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>EXPORT FFT</span>
            </button>

            <button
              onClick={onReset}
              className="btn-brutal px-3 py-1 rounded bg-brutal-yellow text-black text-xs font-mono font-black flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>NEW IMAGE</span>
            </button>
          </div>
        </div>

        {/* Viewport Content */}
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
              <div className="glass-brutal-card rounded-xl p-5 flex flex-col justify-between shadow-brutal">
                <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-brutal-border">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-brutal-green text-black font-mono font-black text-xs border border-black shadow-brutal-sm">
                      SPATIAL
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                      Pixel Domain (RGB)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                    {result.filename || 'image.png'}
                  </span>
                </div>

                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black border-2 border-black flex items-center justify-center">
                  <img
                    src={originalImagePreview}
                    alt="Input"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/90 px-2.5 py-1 rounded text-[10px] font-mono font-bold text-brutal-green border-2 border-black shadow-brutal-sm">
                    RGB Matrix
                  </div>
                </div>

                <p className="mt-3.5 text-xs text-slate-400 font-mono leading-relaxed">
                  Natural human visual domain. High-frequency neural upsampling and latent noise are often imperceptible to the naked eye.
                </p>
              </div>

              {/* Right: FFT Spectrum */}
              <div className="glass-brutal-card rounded-xl p-5 flex flex-col justify-between shadow-brutal">
                <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-brutal-border">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-brutal-cyan text-black font-mono font-black text-xs border border-black shadow-brutal-sm">
                      SPECTRAL
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                      2D FFT Magnitude Spectrum
                    </span>
                  </div>
                  <button
                    onClick={() => setShowReticle(!showReticle)}
                    className="text-[11px] font-mono font-bold text-brutal-cyan hover:underline flex items-center gap-1"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    {showReticle ? 'Reticle: ON' : 'Reticle: OFF'}
                  </button>
                </div>

                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black border-2 border-black flex items-center justify-center">
                  <img
                    src={result.fft_spectrum_image}
                    alt="FFT Spectrum"
                    className="w-full h-full object-contain"
                  />

                  {/* Reticle Guides */}
                  {showReticle && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-full h-[1.5px] bg-brutal-cyan/35" />
                      <div className="h-full w-[1.5px] bg-brutal-cyan/35 absolute" />
                      <div className="w-1/3 h-1/3 rounded-full border border-brutal-cyan/35 absolute" />
                      <div className="w-2/3 h-2/3 rounded-full border border-brutal-cyan/25 absolute" />
                      <div className="w-[95%] h-[95%] rounded-full border border-dashed border-brutal-cyan/20 absolute" />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 bg-black/90 px-2.5 py-1 rounded text-[10px] font-mono font-bold text-brutal-cyan border-2 border-black shadow-brutal-sm">
                    Inferno Spectrum log(1+|F(u,v)|)
                  </div>
                </div>

                <p className="mt-3.5 text-xs text-slate-400 font-mono leading-relaxed">
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

      {/* 4. Commercial Consensus */}
      <ApiComparison result={result} />
    </div>
  );
}
