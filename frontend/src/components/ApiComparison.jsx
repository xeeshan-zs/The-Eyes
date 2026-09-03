import React from 'react';
import { Layers, Sparkles, CheckCircle2, AlertCircle, Info, ArrowRight, Shield } from 'lucide-react';

export default function ApiComparison({ result }) {
  if (!result) return null;

  const ourModelVerdict = result.prediction?.toLowerCase();
  const ourConfidence = Math.round((result.confidence || 0) * 100);

  const hasApiData = result.api_available && result.api_confidence !== null;
  const apiVerdict = result.api_prediction?.toLowerCase();
  const apiConfidence = hasApiData ? Math.round((result.api_confidence || 0) * 100) : null;

  const isAgreement = hasApiData && ourModelVerdict === apiVerdict;

  return (
    <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-4.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            Model Benchmarking &amp; Commercial Validation
          </h4>
        </div>
        {hasApiData ? (
          <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded border font-semibold ${
            isAgreement
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {isAgreement ? '✓ DUAL MODEL CONSENSUS' : '⚡ CLASSIFIER DIVERGENCE'}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-400">
            COMMERCIAL API OPTIONAL
          </span>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Our Model */}
        <div className="bg-[#161B22]/70 border border-[#30363D] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                OUR FFT FINGERPRINT CLASSIFIER
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#21262D] text-slate-300">
                Local Scikit-Learn
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-xl font-bold font-mono uppercase ${
                ourModelVerdict === 'fake' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {ourModelVerdict === 'fake' ? 'AI-Generated' : 'Authentic / Real'}
              </span>
              <span className="text-xs font-mono text-slate-400">({ourConfidence}% conf)</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Calculated purely from radial harmonic power distribution in the frequency domain with 0ms cloud egress.
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-[#21262D] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Inference Mode:</span>
            <span className="text-slate-200">Local Vector Machine</span>
          </div>
        </div>

        {/* Right: Commercial API */}
        <div className="bg-[#161B22]/70 border border-[#30363D] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                SIGHTENGINE GENAI
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#21262D] text-purple-300">
                Cloud Commercial API
              </span>
            </div>

            {hasApiData ? (
              <>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-xl font-bold font-mono uppercase ${
                    apiVerdict === 'fake' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {apiVerdict === 'fake' ? 'AI-Generated' : 'Authentic / Real'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">({apiConfidence}% conf)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Evaluated with Sightengine's multimodal enterprise detector ensemble.
                </p>
              </>
            ) : (
              <div className="py-1">
                <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  API Credentials Not Configured
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Provide <code className="text-purple-300 bg-[#21262D] px-1 py-0.5 rounded">SIGHTENGINE_API_USER</code> in your <code className="text-cyan-300">.env</code> to activate live side-by-side commercial comparison.
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-[#21262D] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Commercial Score:</span>
            <span className="text-purple-300 font-bold">
              {hasApiData ? `${apiConfidence}%` : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
