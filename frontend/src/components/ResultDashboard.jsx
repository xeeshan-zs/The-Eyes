import React, { useState } from 'react';
import { Eye, Activity, Crosshair, ArrowRightLeft, Sliders, LineChart, Layers, Download, Copy, Check, Terminal } from 'lucide-react';
import VerdictBadge from './VerdictBadge';
import ApiComparison from './ApiComparison';
import RadialProfileChart from './RadialProfileChart';
import ImageComparisonSlider from './ImageComparisonSlider';
import ForensicMetrics from './ForensicMetrics';

export default function ResultDashboard({ result, originalImagePreview, onReset }) {
  const [activeTab, setActiveTab] = useState('dual'); // 'dual' | 'slider' | 'chart'
  const [copied, setCopied] = useState(false);
  const [showGridOverlay, setShowGridOverlay] = useState(true);

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
    <div className="space-y-4">
      {/* 1. Main Classification Verdict Banner */}
      <VerdictBadge result={result} />

      {/* 2. Numerical Forensic Telemetry Cards */}
      <ForensicMetrics result={result} />

      {/* 3. Diagnostic Workspace & View Mode Selector */}
      <div className="bg-[#0D1117] border border-[#21262D] rounded-xl overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#161B22]/70 border-b border-[#21262D]">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
            <button
              onClick={() => setActiveTab('dual')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'dual'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Dual Spatial / Spectrum
            </button>
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'slider'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Split Wiper
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'chart'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              1D Azimuthal Radial Decay
            </button>
          </div>

          {/* Quick Action Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="px-2.5 py-1 rounded-md bg-[#0D1117] border border-[#30363D] hover:border-[#484F58] text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'COPIED' : 'JSON'}</span>
            </button>

            <button
              onClick={handleDownloadSpectrum}
              className="px-2.5 py-1 rounded-md bg-[#0D1117] border border-[#30363D] hover:border-[#484F58] text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Download FFT Spectrum PNG"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>EXPORT FFT</span>
            </button>

            <button
              onClick={onReset}
              className="px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>NEW IMAGE</span>
            </button>
          </div>
        </div>

        {/* Tab View Content */}
        <div className="p-4 sm:p-5">
          {activeTab === 'dual' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Input Image */}
              <div className="bg-[#070A0F] border border-[#21262D] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#21262D]">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                      Spatial Domain (RGB Matrix)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                    {result.filename || 'input_image.png'}
                  </span>
                </div>

                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#0D1117] border border-[#30363D] flex items-center justify-center">
                  <img
                    src={originalImagePreview}
                    alt="Input spatial image"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#070A0F]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 border border-[#30363D]">
                    Spatial Pixel Domain
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
                  Natural visual representation. High-frequency GAN or diffusion checkerboard artifacts are typically imperceptible in the spatial RGB domain.
                </p>
              </div>

              {/* Right: 2D FFT Frequency Spectrum */}
              <div className="bg-[#070A0F] border border-[#21262D] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#21262D]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                      2D FFT Magnitude Spectrum
                    </span>
                  </div>
                  <button
                    onClick={() => setShowGridOverlay(!showGridOverlay)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <Crosshair className="w-3 h-3" />
                    {showGridOverlay ? 'Grid: ON' : 'Grid: OFF'}
                  </button>
                </div>

                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#070A0F] border border-[#30363D] flex items-center justify-center">
                  <img
                    src={result.fft_spectrum_image}
                    alt="2D FFT Spectrum"
                    className="w-full h-full object-contain"
                  />

                  {/* Frequency Polar Reticle Overlay */}
                  {showGridOverlay && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-full h-[1px] bg-cyan-400/20" />
                      <div className="h-full w-[1px] bg-cyan-400/20 absolute" />
                      <div className="w-1/3 h-1/3 rounded-full border border-cyan-400/20 absolute" />
                      <div className="w-2/3 h-2/3 rounded-full border border-cyan-400/15 absolute" />
                      <div className="w-[95%] h-[95%] rounded-full border border-dashed border-cyan-400/10 absolute" />
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 bg-[#070A0F]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-[#30363D]">
                    Inferno Spectrum $\log(1+|F(u,v)|)$
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
                  Zero frequency DC is centered. Synthetic images exhibit periodic harmonic cross-spikes or high-frequency energy shelves along outer radial bands.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'slider' && (
            <ImageComparisonSlider
              originalImage={originalImagePreview}
              fftImage={result.fft_spectrum_image}
              filename={result.filename}
            />
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
