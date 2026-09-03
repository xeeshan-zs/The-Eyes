import React from 'react';
import { Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ApiComparison({ result }) {
  if (!result) return null;

  const ourModelVerdict = result.prediction?.toLowerCase();
  const ourConfidence = Math.round((result.confidence || 0) * 100);

  // NVIDIA DiffusionGemma 26B Vision
  const nvidia = result.nvidia_vision;
  const hasNvidia = nvidia && nvidia.available;
  const nvidiaVerdict = nvidia?.prediction?.toLowerCase();
  const nvidiaConfidence = hasNvidia ? Math.round((nvidia.confidence || 0.85) * 100) : null;
  const nvidiaExplanation = nvidia?.explanation || 'Multi-modal vision analysis completed.';

  const isNvidiaAgreement = hasNvidia && ourModelVerdict === nvidiaVerdict;

  return (
    <div className="glass-brutal rounded-xl p-6 shadow-[8px_8px_0px_#000000]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b-2 border-black/20 dark:border-white/30">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded bg-[#FFE600] text-black font-mono font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF]">
            MULTI-MODEL CONSENSUS
          </span>
          <span className="text-xs font-mono font-black text-black dark:text-white uppercase tracking-wide">
            2D FFT Physics Engine ↔ NVIDIA DiffusionGemma 26B Vision
          </span>
        </div>

        {hasNvidia ? (
          <span className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF] ${
            isNvidiaAgreement
              ? 'bg-[#00F5A0] text-black'
              : 'bg-[#FFE600] text-black'
          }`}>
            {isNvidiaAgreement ? '✓ DUAL MODEL CONSENSUS MATCH' : '⚡ DIVERGENT MODEL HYPOTHESIS'}
          </span>
        ) : (
          <span className="text-xs font-mono px-3 py-1 rounded bg-white dark:bg-[#181824] border-2 border-black dark:border-white text-black dark:text-white font-bold">
            CLOUD MODEL STANDBY
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Our Local 2D FFT Model */}
        <div className="bg-[#F8F9FA] dark:bg-black border-2 border-black dark:border-white rounded-xl p-5 flex flex-col justify-between shadow-[4px_4px_0px_#000000]">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-black dark:text-white mb-2.5">
              <span className="text-[#0284C7] dark:text-[#00F0FF] font-black flex items-center gap-1.5">
                <Cpu className="w-4 h-4 stroke-[3]" />
                LOCAL 2D FOURIER MODEL
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-[#00F0FF] text-black border border-black shadow-[1px_1px_0px_#000000] dark:shadow-[1px_1px_0px_#FFFFFF]">
                On-Device
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-3xl sm:text-4xl font-black font-mono uppercase ${
                ourModelVerdict === 'fake' ? 'text-[#E11D48] dark:text-[#FF2E63]' : 'text-[#059669] dark:text-[#00F5A0]'
              }`}>
                {ourModelVerdict === 'fake' ? 'AI-Generated' : 'Authentic / Real'}
              </span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-black">({ourConfidence}% Certainty)</span>
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed font-bold">
              Evaluated on 40-dimensional azimuthal harmonic power decay, α slope roll-off, and cross-channel chromatic phase coherence.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-black/10 dark:border-white/20 flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-700 dark:text-slate-300">Execution:</span>
            <span className="text-[#059669] dark:text-[#00F5A0] font-black">0ms Network Egress (Local)</span>
          </div>
        </div>

        {/* Card 2: NVIDIA DiffusionGemma 26B Vision */}
        <div className="bg-[#F8F9FA] dark:bg-black border-2 border-black dark:border-white rounded-xl p-5 flex flex-col justify-between shadow-[4px_4px_0px_#000000]">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-black dark:text-white mb-2.5">
              <span className="text-[#B45309] dark:text-[#FFE600] font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFE600] fill-[#FFE600]" />
                NVIDIA DIFFUSIONGEMMA 26B
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_#000000] dark:shadow-[1px_1px_0px_#FFFFFF]">
                NVIDIA NIM
              </span>
            </div>

            {hasNvidia ? (
              <>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-3xl sm:text-4xl font-black font-mono uppercase ${
                    nvidiaVerdict === 'fake' ? 'text-[#E11D48] dark:text-[#FF2E63]' : 'text-[#059669] dark:text-[#00F5A0]'
                  }`}>
                    {nvidiaVerdict === 'fake' ? 'AI-Generated' : 'Authentic / Real'}
                  </span>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-black">({nvidiaConfidence}% Certainty)</span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-[#14141E] border-2 border-black dark:border-white/30 mt-2 shadow-[2px_2px_0px_#000000]">
                  <span className="text-[10px] font-mono text-[#B45309] dark:text-[#FFE600] font-black uppercase tracking-wider block mb-1">
                    AI Visual Forensics Reasoning:
                  </span>
                  <p className="text-xs text-slate-900 dark:text-white font-mono leading-relaxed font-bold">
                    "{nvidiaExplanation}"
                  </p>
                </div>
              </>
            ) : (
              <div className="py-3">
                <span className="text-xs font-mono font-bold text-[#B45309] dark:text-[#FFE600] block mb-1">
                  NVIDIA NIM Key Not Detected
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-300 font-mono">
                  Set <code className="text-black dark:text-white bg-slate-200 dark:bg-[#181824] px-1 py-0.5 rounded">NVIDIA_API_KEY</code> in <code className="text-[#B45309] dark:text-[#FFE600]">backend/.env</code> to enable real-time visual reasoning.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t-2 border-black/10 dark:border-white/20 flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-700 dark:text-slate-300">Model Engine:</span>
            <span className="text-[#B45309] dark:text-[#FFE600] font-black">
              google/diffusiongemma-26b-a4b-it
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
