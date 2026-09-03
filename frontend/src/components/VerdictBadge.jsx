import React from 'react';
import { ShieldCheck, AlertTriangle, Fingerprint, Activity, Zap, Check, AlertOctagon } from 'lucide-react';

export default function VerdictBadge({ result }) {
  if (!result) return null;

  const isFake = result.prediction?.toLowerCase() === 'fake' || result.prediction?.toLowerCase() === 'ai';
  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const diagnostics = result.diagnostics || {};
  const alpha = diagnostics.spectral_slope_alpha || 1.8;
  const hfRatio = diagnostics.high_freq_ratio !== undefined ? Math.round(diagnostics.high_freq_ratio * 100) : 45;

  return (
    <div className={`relative overflow-hidden rounded-xl border-3 p-6 sm:p-7 backdrop-blur-xl transition-all ${
      isFake
        ? 'bg-[#180A10]/85 border-brutal-pink shadow-brutal-pink'
        : 'bg-[#081812]/85 border-brutal-green shadow-brutal-green'
    }`}>
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b-2 border-brutal-border">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded border-2 border-black font-mono font-black text-xs uppercase shadow-brutal-sm ${
            isFake ? 'bg-brutal-pink text-white' : 'bg-brutal-green text-black'
          }`}>
            {isFake ? '⚠ CLASSIFICATION: SYNTHETIC' : '✓ CLASSIFICATION: AUTHENTIC'}
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">
            // 2D FOURIER SPECTRAL ENGINE
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2 py-0.5 rounded bg-black/50 border border-brutal-border text-slate-300">
            BOUNDARY: 50%
          </span>
          <span className="px-2 py-0.5 rounded bg-black/50 border border-brutal-border text-slate-300">
            LATENCY: {result.processing_time_ms || 0}ms
          </span>
        </div>
      </div>

      {/* Main Verdict Content */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Headline */}
        <div className="flex items-start gap-4 sm:gap-5">
          <div className={`p-4 rounded-xl border-2 border-black shadow-brutal flex-shrink-0 ${
            isFake ? 'bg-brutal-pink text-white' : 'bg-brutal-green text-black'
          }`}>
            {isFake ? (
              <AlertOctagon className="w-9 h-9 stroke-[2.5]" />
            ) : (
              <ShieldCheck className="w-9 h-9 stroke-[2.5]" />
            )}
          </div>

          <div>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight ${
              isFake ? 'text-brutal-pink' : 'text-brutal-green'
            }`}>
              {isFake ? 'AI-GENERATED' : 'AUTHENTIC / REAL'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-mono mt-2 max-w-2xl leading-relaxed">
              {isFake
                ? 'High-frequency deconvolution grid spikes, flattened power slope, and latent diffusion VAE upsampling artifacts detected.'
                : 'Continuous 1/f² power-law decay obeying physical camera sensor Poisson-Gaussian distribution.'}
            </p>

            {/* Micro Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono font-bold">
              <span className="px-2.5 py-1 rounded bg-black border-2 border-brutal-border text-slate-200">
                SLOPE: α = {alpha}
              </span>
              <span className="px-2.5 py-1 rounded bg-black border-2 border-brutal-border text-slate-200">
                HF NOISE SHELF: {hfRatio}%
              </span>
              <span className="px-2.5 py-1 rounded bg-black border-2 border-brutal-border text-slate-200">
                ENTROPY: {Math.round((diagnostics.spectral_entropy || 0.74) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Certainty Box */}
        <div className="bg-black/90 p-5 rounded-xl border-2 border-black shadow-brutal flex flex-col justify-between self-start lg:self-center min-w-[220px]">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
            CERTAINTY SCORE
          </span>

          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl font-black font-mono ${
              isFake ? 'text-brutal-pink' : 'text-brutal-green'
            }`}>
              {confidencePercent}%
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">PROBABILITY</span>
          </div>

          {/* Hard Segmented Bar */}
          <div className="w-full bg-brutal-surface h-3 rounded border border-black overflow-hidden flex">
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

          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 mt-2">
            <span className="text-brutal-green">Real: {isFake ? 100 - confidencePercent : confidencePercent}%</span>
            <span className="text-brutal-pink">Synth: {isFake ? confidencePercent : 100 - confidencePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
