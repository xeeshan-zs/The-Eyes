import React from 'react';
import { ShieldCheck, AlertTriangle, Fingerprint, Activity, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function VerdictBadge({ result }) {
  if (!result) return null;

  const isFake = result.prediction?.toLowerCase() === 'fake' || result.prediction?.toLowerCase() === 'ai';
  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const diagnostics = result.diagnostics || {};
  const alpha = diagnostics.spectral_slope_alpha || 1.8;
  const hfRatio = diagnostics.high_freq_ratio !== undefined ? Math.round(diagnostics.high_freq_ratio * 100) : 45;

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidencePercent / 100) * circumference;

  return (
    <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl p-6 sm:p-7 transition-all duration-500 ${
      isFake
        ? 'bg-gradient-to-br from-rose-950/40 via-space-900/90 to-space-950 border-rose-500/40 shadow-glow-rose'
        : 'bg-gradient-to-br from-emerald-950/40 via-space-900/90 to-space-950 border-emerald-500/40 shadow-glow-emerald'
    }`}>
      {/* Ambient background light bloom */}
      <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none ${
        isFake ? 'bg-rose-500' : 'bg-emerald-400'
      }`} />

      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Fingerprint className={`w-4 h-4 ${isFake ? 'text-rose-400' : 'text-emerald-400'}`} />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-300">
            2D FOURIER SPECTRAL INFERENCE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            CONFIDENCE THRESHOLD: 50%
          </span>
          <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
            isFake
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            {isFake ? '⚠ ANOMALY ISOLATED' : '✓ NATURAL POWER LAW'}
          </span>
        </div>
      </div>

      {/* Main Verdict Content & Gauge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Verdict Headline */}
        <div className="flex items-start gap-4 sm:gap-5">
          <div className={`p-3.5 rounded-2xl border flex-shrink-0 backdrop-blur-md ${
            isFake
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-glow-rose'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-glow-emerald'
          }`}>
            {isFake ? (
              <AlertTriangle className="w-9 h-9 animate-pulse" />
            ) : (
              <ShieldCheck className="w-9 h-9" />
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono ${
                isFake ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isFake ? 'AI-GENERATED' : 'AUTHENTIC / REAL'}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              {isFake
                ? 'High-frequency deconvolution grid spikes, flattened spectral slope, and synthetic latent VAE decoding signatures detected.'
                : 'Smooth exponential 1/f² azimuthal frequency decay characteristic of physical camera sensor exposure.'}
            </p>

            {/* Micro Forensic Tag Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-300">
                Slope: α = {alpha}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-300">
                HF Energy: {hfRatio}%
              </span>
              <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-300">
                Latency: {result.processing_time_ms || 0}ms
              </span>
            </div>
          </div>
        </div>

        {/* Right Circular Gauge HUD */}
        <div className="flex items-center gap-5 bg-space-950/70 p-4 rounded-xl border border-white/[0.08] backdrop-blur-md self-start lg:self-center">
          {/* Circular SVG Progress */}
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-space-800"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`transition-all duration-1000 ease-out ${
                  isFake ? 'stroke-rose-500' : 'stroke-emerald-400'
                }`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black font-mono text-white">
                {confidencePercent}%
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                CERTAINTY
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Authentic:</span>
              <span className="text-emerald-400 font-bold">{isFake ? 100 - confidencePercent : confidencePercent}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Synthetic:</span>
              <span className="text-rose-400 font-bold">{isFake ? confidencePercent : 100 - confidencePercent}%</span>
            </div>
            <div className="w-28 bg-space-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full ${isFake ? 'bg-rose-500' : 'bg-emerald-400'}`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
