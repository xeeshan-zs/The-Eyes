import React from 'react';
import { Eye, Shield, Activity, Cpu, Sparkles, Terminal, Radio } from 'lucide-react';

export default function Header({ backendHealth, onReset, hasResult }) {
  const isOnline = backendHealth?.status === 'online';
  const modelName = backendHealth?.model_file || 'FFT SVM Classifier';
  const sightengineActive = backendHealth?.sightengine_configured;

  return (
    <header className="border-b border-[#21262D] bg-[#0D1117]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand & System Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono tracking-tight text-white">
                THE EYES <span className="text-cyan-400">//</span> FORENSIC FFT
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#161B22] border border-[#30363D] text-slate-400 font-mono">
                v2.4
              </span>
            </div>
          </div>
        </div>

        {/* System Telemetry Chips */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          {/* Server Connection Status */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
            isOnline
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span>{isOnline ? 'SERVER: 200 OK' : 'OFFLINE'}</span>
          </div>

          {/* Model Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161B22] border border-[#30363D] text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[130px] sm:max-w-[180px]" title={modelName}>
              {modelName}
            </span>
          </div>

          {/* Sightengine Benchmark Badge */}
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
            sightengineActive
              ? 'bg-purple-500/10 border-purple-500/25 text-purple-300'
              : 'bg-[#161B22] border-[#30363D] text-slate-400'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>SIGHTENGINE {sightengineActive ? 'SYNCED' : 'UNSET'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
