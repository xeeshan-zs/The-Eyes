import React from 'react';
import { Layers, Sparkles, Info } from 'lucide-react';

export default function ApiComparison({ result }) {
  if (!result) return null;

  const ourModelVerdict = result.prediction?.toLowerCase();
  const ourConfidence = Math.round((result.confidence || 0) * 100);

  const hasApiData = result.api_available && result.api_confidence !== null;
  const apiVerdict = result.api_prediction?.toLowerCase();
  const apiConfidence = hasApiData ? Math.round((result.api_confidence || 0) * 100) : null;

  const isAgreement = hasApiData && ourModelVerdict === apiVerdict;

  return (
    <div className="glass-brutal rounded-xl p-6 shadow-[6px_6px_0px_#000000]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b-2 border-white/20">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-brutal-purple text-white font-mono font-black text-xs border border-black shadow-[2px_2px_0px_#FFFFFF]">
            BENCHMARK
          </span>
          <span className="text-xs font-mono font-black text-white uppercase tracking-wide">
            Model Consensus: Local 2D FFT vs Sightengine Cloud API
          </span>
        </div>

        {hasApiData ? (
          <span className={`text-xs font-mono px-3 py-1 rounded border-2 border-black font-black shadow-[2px_2px_0px_#FFFFFF] ${
            isAgreement
              ? 'bg-brutal-green text-black'
              : 'bg-brutal-yellow text-black'
          }`}>
            {isAgreement ? '✓ DUAL MODEL CONSENSUS' : '⚡ MODEL DIVERGENCE'}
          </span>
        ) : (
          <span className="text-xs font-mono font-bold text-white px-2.5 py-1 rounded bg-black border-2 border-white">
            COMMERCIAL API OPTIONAL
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Model */}
        <div className="bg-black border-2 border-white rounded-lg p-5 flex flex-col justify-between shadow-brutal-sm">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span className="text-brutal-cyan font-black flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brutal-cyan animate-pulse" />
                LOCAL MULTI-SPECTRAL MODEL
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-brutal-cyan text-black border border-black">
                On-Device
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-3xl font-black font-mono uppercase ${
                ourModelVerdict === 'fake' ? 'text-brutal-pink' : 'text-brutal-green'
              }`}>
                {ourModelVerdict === 'fake' ? 'AI-Generated' : 'Authentic / Real'}
              </span>
              <span className="text-xs font-mono text-white font-black">({ourConfidence}% Certainty)</span>
            </div>

            <p className="text-xs text-slate-200 font-mono leading-relaxed">
              Inferred from 40-dim 2D Fourier log-magnitude harmonic decay, $\alpha$ power slope, and chromatic phase coherence.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-white/20 flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-300">Execution Egress:</span>
            <span className="text-brutal-green font-black">0ms (100% Local)</span>
          </div>
        </div>

        {/* Sightengine API */}
        <div className="bg-black border-2 border-white rounded-lg p-5 flex flex-col justify-between shadow-brutal-sm">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span className="text-brutal-purple font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                SIGHTENGINE GENAI
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-brutal-purple text-white border border-black">
                Cloud Ensemble
              </span>
            </div>

            {hasApiData ? (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-3xl font-black font-mono uppercase ${
                    apiVerdict === 'fake' ? 'text-brutal-pink' : 'text-brutal-green'
                  }`}>
                    {apiVerdict === 'fake' ? 'AI-Generated' : 'Authentic / Real'}
                  </span>
                  <span className="text-xs font-mono text-white font-black">({apiConfidence}% Certainty)</span>
                </div>
                <p className="text-xs text-slate-200 font-mono leading-relaxed">
                  Evaluated against Sightengine's enterprise multimodal generative model detection endpoint.
                </p>
              </>
            ) : (
              <div className="py-2">
                <div className="text-xs font-black text-white flex items-center gap-2 mb-1.5 font-mono">
                  <Info className="w-4 h-4 text-brutal-yellow" />
                  Commercial Benchmark Inactive
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  Add <code className="text-brutal-yellow bg-slate-900 px-1 py-0.5 rounded border border-white/30">SIGHTENGINE_API_USER</code> &amp; <code className="text-brutal-yellow bg-slate-900 px-1 py-0.5 rounded border border-white/30">SIGHTENGINE_API_SECRET</code> to <code className="text-white">.env</code> to activate live side-by-side consensus.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t-2 border-white/20 flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-300">Commercial Score:</span>
            <span className="text-brutal-purple font-black">
              {hasApiData ? `${apiConfidence}% Certainty` : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
