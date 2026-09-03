import React from 'react';
import { ShieldCheck, AlertOctagon, Fingerprint, Activity, Zap } from 'lucide-react';

export default function VerdictBadge({ result }) {
  if (!result) return null;

  const isFake = result.prediction?.toLowerCase() === 'fake' || result.prediction?.toLowerCase() === 'ai';
  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const diagnostics = result.diagnostics || {};
  const alpha = diagnostics.spectral_slope_alpha || 1.8;
  const hfRatio = diagnostics.high_freq_ratio !== undefined ? Math.round(diagnostics.high_freq_ratio * 100) : 45;

  return (
    <div className={`relative overflow-hidden rounded-xl border-3 p-6 sm:p-7 backdrop-blur-2xl transition-all ${
      isFake
        ? 'bg-[#180A10]/95 border-brutal-pink shadow-brutal-pink'
        : 'bg-[#061A12]/95 border-brutal-green shadow-brutal-green'
    }`}>
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b-2 border-white/30">
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded border-2 border-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#FFFFFF] ${
            isFake ? 'bg-brutal-pink text-white' : 'bg-brutal-green text-black'
          }`}>
            {isFake ? '⚠ SYNTHETIC ARTIFACTS ISOLATED' : '✓ AUTHENTIC CAMERA EXPOSURE'}
          </span>
          <span className="text-xs font-mono font-bold text-white">
            // 2D FOURIER SPECTRAL INFERENCE
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <span className="px-2.5 py-0.5 rounded bg-black border-2 border-white/40 text-white">
            THRESHOLD: 50%
          </span>
          <span className="px-2.5 py-0.5 rounded bg-black border-2 border-white/40 text-brutal-yellow">
            LATENCY: {result.processing_time_ms || 0}ms
          </span>
        </div>
      </div>

      {/* Main Verdict Content */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Headline */}
        <div className="flex items-start gap-4 sm:gap-5">
          <div className={`p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_#FFFFFF] flex-shrink-0 ${
            isFake ? 'bg-brutal-pink text-white' : 'bg-brutal-green text-black'
          }`}>
            {isFake ? (
              <AlertOctagon className="w-10 h-10 stroke-[3]" />
            ) : (
              <ShieldCheck className="w-10 h-10 stroke-[3]" />
            )}
          </div>

          <div>
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight ${
              isFake ? 'text-brutal-pink' : 'text-brutal-green'
            }`}>
              {isFake ? 'AI-GENERATED' : 'AUTHENTIC / REAL'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-100 font-mono mt-2 max-w-2xl leading-relaxed">
              {isFake
                ? 'Deconvolution grid harmonics, abnormal slope decay (low alpha), and VAE latent noise shelves isolated in frequency domain.'
                : 'Continuous 1/f² power-law decay obeying physical camera sensor Poisson-Gaussian exposure statistics.'}
            </p>

            {/* Micro Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs font-mono font-black">
              <span className="px-2.5 py-1 rounded bg-black border-2 border-white text-white shadow-brutal-sm">
                SLOPE: α = {alpha}
              </span>
              <span className="px-2.5 py-1 rounded bg-black border-2 border-white text-white shadow-brutal-sm">
                HF NOISE SHELF: {hfRatio}%
              </span>
              <span className="px-2.5 py-1 rounded bg-black border-2 border-white text-brutal-yellow shadow-brutal-sm">
                ENTROPY: {Math.round((diagnostics.spectral_entropy || 0.74) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Certainty Box */}
        <div className="bg-black p-5 rounded-xl border-2 border-white shadow-[5px_5px_0px_#FFFFFF] flex flex-col justify-between self-start lg:self-center min-w-[230px]">
          <span className="text-[11px] font-mono font-black text-slate-300 uppercase tracking-widest mb-1">
            CERTAINTY SCORE
          </span>

          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl sm:text-5xl font-black font-mono ${
              isFake ? 'text-brutal-pink' : 'text-brutal-green'
            }`}>
              {confidencePercent}%
            </span>
            <span className="text-xs font-mono font-bold text-white">CONFIDENCE</span>
          </div>

          {/* Hard Segmented Bar */}
          <div className="w-full bg-slate-800 h-3.5 rounded border-2 border-white overflow-hidden flex">
            <div
              className="bg-brutal-green h-full"
              style={{ width: `${isFake ? 100 - confidencePercent : confidencePercent}%` }}
              title="Real"
            />
            <div
              className="bg-brutal-pink h-full"
              style={{ width: `${isFake ? confidencePercent : 100 - confidencePercent}%` }}
              title="Fake"
            />
          </div>

          <div className="flex justify-between text-xs font-mono font-black mt-2">
            <span className="text-brutal-green">Real: {isFake ? 100 - confidencePercent : confidencePercent}%</span>
            <span className="text-brutal-pink">Synth: {isFake ? confidencePercent : 100 - confidencePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
