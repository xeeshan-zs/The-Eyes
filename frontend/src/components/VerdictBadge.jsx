import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Cpu, Zap, Fingerprint } from 'lucide-react';

export default function VerdictBadge({ result }) {
  if (!result) return null;

  const isFake = result.prediction?.toLowerCase() === 'fake' || result.prediction?.toLowerCase() === 'ai';
  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const realPercent = isFake ? 100 - confidencePercent : confidencePercent;
  const fakePercent = isFake ? confidencePercent : 100 - confidencePercent;

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 transition-all ${
      isFake
        ? 'bg-gradient-to-r from-[#1E1117] via-[#140E14] to-[#0D1117] border-rose-500/40'
        : 'bg-gradient-to-r from-[#0C1B17] via-[#0E1515] to-[#0D1117] border-emerald-500/40'
    }`}>
      {/* Top Tagline */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[#21262D]/80">
        <div className="flex items-center gap-2">
          <Fingerprint className={`w-4 h-4 ${isFake ? 'text-rose-400' : 'text-emerald-400'}`} />
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
            FFT SPECTRAL FINGERPRINT INFERENCE VERDICT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">DECISION BOUNDARY: 0.50</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
            isFake
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            {isFake ? 'ANOMALY DETECTED' : 'NATURAL SPECTRUM'}
          </span>
        </div>
      </div>

      {/* Main Verdict Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Large Typography Verdict */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border flex-shrink-0 ${
            isFake
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {isFake ? (
              <AlertTriangle className="w-8 h-8" />
            ) : (
              <ShieldCheck className="w-8 h-8" />
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-3">
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${
                isFake ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isFake ? 'AI-GENERATED' : 'AUTHENTIC / REAL'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {isFake
                ? 'High-frequency deconvolution grid artifacts and synthetic generator spectral peaks isolated across the 2D FFT plane.'
                : 'Continuous 1/f azimuthal power decay matching physical optical sensor exposure.'}
            </p>
          </div>
        </div>

        {/* Confidence Dual Probability Breakdown Meter */}
        <div className="w-full md:w-72 bg-[#070A0F]/80 p-3.5 rounded-lg border border-[#21262D] flex flex-col justify-between">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[11px] font-mono text-slate-400">CERTAINTY</span>
            <span className={`text-2xl font-black font-mono ${
              isFake ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {confidencePercent}%
            </span>
          </div>

          {/* Segmented Dual Bar */}
          <div className="w-full bg-[#161B22] h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-700"
              style={{ width: `${realPercent}%` }}
              title={`Real: ${realPercent}%`}
            />
            <div
              className="bg-rose-500 transition-all duration-700"
              style={{ width: `${fakePercent}%` }}
              title={`Fake: ${fakePercent}%`}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2">
            <span className="text-emerald-400">Real: {realPercent}%</span>
            <span className="text-rose-400">Synth: {fakePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
