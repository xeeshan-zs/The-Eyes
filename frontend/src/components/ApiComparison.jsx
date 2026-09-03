import React from 'react';
import { Layers, Sparkles, CheckCircle2, AlertCircle, Info, ShieldCheck, Zap } from 'lucide-react';

export default function ApiComparison({ result }) {
  if (!result) return null;

  const ourModelVerdict = result.prediction?.toLowerCase();
  const ourConfidence = Math.round((result.confidence || 0) * 100);

  const hasApiData = result.api_available && result.api_confidence !== null;
  const apiVerdict = result.api_prediction?.toLowerCase();
  const apiConfidence = hasApiData ? Math.round((result.api_confidence || 0) * 100) : null;

  const isAgreement = hasApiData && ourModelVerdict === apiVerdict;

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              Model Consensus &amp; Commercial Validation
            </h4>
            <p className="text-[11px] text-slate-400">
              Cross-evaluating local 2D Fourier model against Sightengine GenAI enterprise cloud detector
            </p>
          </div>
        </div>

        {hasApiData ? (
          <span className={`text-[11px] font-mono px-3 py-1 rounded-full border font-bold ${
            isAgreement
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-glow-emerald'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]'
          }`}>
            {isAgreement ? '✓ DUAL MODEL CONSENSUS' : '⚡ MODEL DIVERGENCE'}
          </span>
        ) : (
          <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
            COMMERCIAL API OPTIONAL
          </span>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Our Model */}
        <div className="bg-space-950/70 border border-white/[0.08] rounded-xl p-4.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
              <span className="flex items-center gap-2 text-cyan-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                OUR MULTI-SPECTRAL MODEL
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                Local ExtraTrees Pipeline
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1.5">
              <span className={`text-2xl font-black font-mono uppercase ${
                ourModelVerdict === 'fake' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {ourModelVerdict === 'fake' ? 'AI-Generated' : 'Authentic / Real'}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">({ourConfidence}% certainty)</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Inferred from 40-dim multi-spectral 2D Fourier harmonics, spectral decay slope, and chromatic phase coherence.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Execution Egress:</span>
            <span className="text-cyan-300 font-bold">0ms (100% On-Device)</span>
          </div>
        </div>

        {/* Card 2: Sightengine Commercial API */}
        <div className="bg-space-950/70 border border-white/[0.08] rounded-xl p-4.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
              <span className="flex items-center gap-2 text-purple-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                SIGHTENGINE GENAI
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                Commercial Cloud API
              </span>
            </div>

            {hasApiData ? (
              <>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className={`text-2xl font-black font-mono uppercase ${
                    apiVerdict === 'fake' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {apiVerdict === 'fake' ? 'AI-Generated' : 'Authentic / Real'}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">({apiConfidence}% certainty)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Evaluated against Sightengine's enterprise multimodal generative model detection ensemble.
                </p>
              </>
            ) : (
              <div className="py-2">
                <div className="text-xs font-medium text-slate-300 flex items-center gap-2 mb-1.5 font-mono">
                  <Info className="w-4 h-4 text-purple-400" />
                  Commercial Benchmark Inactive
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  Add <code className="text-purple-300 bg-space-850 px-1 py-0.5 rounded">SIGHTENGINE_API_USER</code> &amp; <code className="text-purple-300 bg-space-850 px-1 py-0.5 rounded">SIGHTENGINE_API_SECRET</code> to your <code className="text-cyan-300">.env</code> to activate live side-by-side consensus validation.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Commercial Score:</span>
            <span className="text-purple-300 font-bold">
              {hasApiData ? `${apiConfidence}% Certainty` : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
