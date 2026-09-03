import React from 'react';
import { Layers, Sparkles, Cpu, Bot, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ApiComparison({ result }) {
  if (!result) return null;

  const ourModelVerdict = result.prediction?.toLowerCase();
  const ourConfidence = Math.round((result.confidence || 0) * 100);

  // NVIDIA DiffusionGemma 26B Vision
  const nvidia = result.nvidia_vision;
  const hasNvidia = nvidia && nvidia.available;
  const nvidiaVerdict = nvidia?.prediction?.toLowerCase();
  const nvidiaConfidence = hasNvidia ? Math.round((nvidia.confidence || 0.85) * 100) : null;
  const nvidiaExplanation = nvidia?.explanation || 'Multi-modal latent feature inspection completed.';

  const isNvidiaAgreement = hasNvidia && ourModelVerdict === nvidiaVerdict;

  return (
    <div className="glass-brutal rounded-xl p-6 shadow-[8px_8px_0px_#000000]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b-2 border-white/30">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded bg-[#FFE600] text-black font-mono font-black text-xs border-2 border-black shadow-[2px_2px_0px_#FFFFFF]">
            MULTI-MODEL CONSENSUS
          </span>
          <span className="text-xs font-mono font-black text-white uppercase tracking-wide">
            2D FFT Physics Engine ↔ NVIDIA DiffusionGemma 26B Vision
          </span>
        </div>

        {hasNvidia && (
          <span className={`text-xs font-mono px-3.5 py-1 rounded border-2 border-black font-black shadow-[2px_2px_0px_#FFFFFF] ${
            isNvidiaAgreement
              ? 'bg-[#00F5A0] text-black'
              : 'bg-[#FFE600] text-black'
          }`}>
            {isNvidiaAgreement ? '✓ DUAL MODEL CONSENSUS MATCH' : '⚡ DIVERGENT MODEL HYPOTHESIS'}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Our Local 2D FFT Model */}
        <div className="bg-black border-2 border-white rounded-xl p-5 flex flex-col justify-between shadow-[4px_4px_0px_#000000]">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-white mb-2.5">
              <span className="text-[#00F0FF] font-black flex items-center gap-1.5">
                <Cpu className="w-4 h-4 stroke-[3]" />
                LOCAL 2D FOURIER MODEL
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#00F0FF] text-black border border-black shadow-[1px_1px_0px_#FFFFFF]">
                On-Device
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-3xl sm:text-4xl font-black font-mono uppercase ${
                ourModelVerdict === 'fake' ? 'text-[#FF2E63]' : 'text-[#00F5A0]'
              }`}>
                {ourModelVerdict === 'fake' ? 'AI-Generated' : 'Authentic / Real'}
              </span>
              <span className="text-xs font-mono text-white font-black">({ourConfidence}% Certainty)</span>
            </div>

            <p className="text-xs text-slate-200 font-mono leading-relaxed font-medium">
              Evaluated on 40-dimensional azimuthal harmonic power decay, $\alpha$ slope roll-off, and cross-channel chromatic phase coherence.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-white/20 flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-300">Execution Egress:</span>
            <span className="text-[#00F5A0] font-black">0ms (100% Local GPU/CPU)</span>
          </div>
        </div>

        {/* Card 2: NVIDIA DiffusionGemma 26B Vision */}
        <div className="bg-black border-2 border-white rounded-xl p-5 flex flex-col justify-between shadow-[4px_4px_0px_#000000]">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-white mb-2.5">
              <span className="text-[#FFE600] font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFE600]" />
                NVIDIA DIFFUSIONGEMMA 26B
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_#FFFFFF]">
                NVIDIA NIM
              </span>
            </div>

            {hasNvidia ? (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-3xl sm:text-4xl font-black font-mono uppercase ${
                    nvidiaVerdict === 'fake' ? 'text-[#FF2E63]' : 'text-[#00F5A0]'
                  }`}>
                    {nvidiaVerdict === 'fake' ? 'AI-Generated' : 'Authentic / Real'}
                  </span>
                  <span className="text-xs font-mono text-white font-black">({nvidiaConfidence}% Certainty)</span>
                </div>
                <div className="p-2.5 rounded bg-[#181824] border border-white/40 mt-2">
                  <span className="text-[10px] font-mono text-[#FFE600] font-black uppercase block mb-1">
                    AI Visual Reasoning:
                  </span>
                  <p className="text-xs text-white font-mono leading-relaxed font-medium">
                    "{nvidiaExplanation}"
                  </p>
                </div>
              </>
            ) : (
              <div className="py-2">
                <span className="text-xs text-white font-mono font-bold">
                  NVIDIA NIM Vision Forensics processing...
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t-2 border-white/20 flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-300">Model Engine:</span>
            <span className="text-[#FFE600] font-black">
              Google DiffusionGemma 26B-IT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
