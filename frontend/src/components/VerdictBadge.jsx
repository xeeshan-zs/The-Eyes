import React from 'react';
import { ShieldCheck, AlertOctagon } from 'lucide-react';

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
        ? 'bg-[#180A10] border-[#FF2E63] shadow-[8px_8px_0px_#FF2E63]'
        : 'bg-[#061A12] border-[#00F5A0] shadow-[8px_8px_0px_#00F5A0]'
    }`}>
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b-2 border-white/40">
        <div className="flex items-center gap-2.5">
          <span className={`px-3.5 py-1.5 rounded-lg border-2 border-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#FFFFFF] ${
            isFake ? 'bg-[#FF2E63] text-white' : 'bg-[#00F5A0] text-black'
          }`}>
            {isFake ? '⚠ SYNTHETIC ARTIFACTS ISOLATED' : '✓ AUTHENTIC CAMERA EXPOSURE'}
          </span>
          <span className="text-xs font-mono font-black text-white">
            // 2D FOURIER SPECTRAL INFERENCE
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <span className="px-3 py-1 rounded bg-black border-2 border-white text-white font-black">
            THRESHOLD: 50%
          </span>
          <span className="px-3 py-1 rounded bg-black border-2 border-white text-[#FFE600] font-black">
            LATENCY: {result.processing_time_ms || 0}ms
          </span>
        </div>
      </div>

      {/* Main Verdict Content */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Headline */}
        <div className="flex items-start gap-4 sm:gap-5">
          <div className={`p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_#FFFFFF] flex-shrink-0 ${
            isFake ? 'bg-[#FF2E63] text-white' : 'bg-[#00F5A0] text-black'
          }`}>
            {isFake ? (
              <AlertOctagon className="w-10 h-10 stroke-[3]" />
            ) : (
              <ShieldCheck className="w-10 h-10 stroke-[3]" />
            )}
          </div>

          <div>
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight ${
              isFake ? 'text-[#FF2E63]' : 'text-[#00F5A0]'
            }`}>
              {isFake ? 'AI-GENERATED' : 'AUTHENTIC / REAL'}
            </h2>

            <p className="text-xs sm:text-sm text-white font-mono mt-2.5 max-w-2xl leading-relaxed font-bold">
              {isFake
                ? 'Deconvolution grid harmonics, abnormal slope decay (low alpha), and VAE latent noise shelves isolated in frequency domain.'
                : 'Continuous 1/f² power-law decay obeying physical camera sensor Poisson-Gaussian exposure statistics.'}
            </p>

            {/* Micro Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-mono font-black">
              <span className="px-3 py-1 rounded bg-[#181824] border-2 border-white text-white shadow-[2px_2px_0px_#000000]">
                SLOPE: α = {alpha}
              </span>
              <span className="px-3 py-1 rounded bg-[#181824] border-2 border-white text-white shadow-[2px_2px_0px_#000000]">
                HF NOISE SHELF: {hfRatio}%
              </span>
              <span className="px-3 py-1 rounded bg-[#181824] border-2 border-white text-[#FFE600] shadow-[2px_2px_0px_#000000]">
                ENTROPY: {Math.round((diagnostics.spectral_entropy || 0.74) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Certainty Box */}
        <div className="bg-black p-5 rounded-xl border-2 border-white shadow-[5px_5px_0px_#FFFFFF] flex flex-col justify-between self-start lg:self-center min-w-[230px]">
          <span className="text-xs font-mono font-black text-white uppercase tracking-widest mb-1">
            CERTAINTY SCORE
          </span>

          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl sm:text-5xl font-black font-mono ${
              isFake ? 'text-[#FF2E63]' : 'text-[#00F5A0]'
            }`}>
              {confidencePercent}%
            </span>
            <span className="text-xs font-mono font-bold text-white">CONFIDENCE</span>
          </div>

          {/* Hard Segmented Bar */}
          <div className="w-full bg-slate-800 h-3.5 rounded border-2 border-white overflow-hidden flex">
            <div
              className="bg-[#00F5A0] h-full"
              style={{ width: `${isFake ? 100 - confidencePercent : confidencePercent}%` }}
              title="Real"
            />
            <div
              className="bg-[#FF2E63] h-full"
              style={{ width: `${isFake ? confidencePercent : 100 - confidencePercent}%` }}
              title="Fake"
            />
          </div>

          <div className="flex justify-between text-xs font-mono font-black mt-2">
            <span className="text-[#00F5A0]">Real: {isFake ? 100 - confidencePercent : confidencePercent}%</span>
            <span className="text-[#FF2E63]">Synth: {isFake ? confidencePercent : 100 - confidencePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
