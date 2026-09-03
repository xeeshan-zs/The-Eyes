import React from 'react';
import { Eye, Shield, Activity, Cpu, Sparkles, Terminal, Radio, Github, RefreshCw } from 'lucide-react';

export default function Header({ backendHealth, onReset, hasResult }) {
  const isOnline = backendHealth?.status === 'online';
  const modelName = backendHealth?.model_file || 'ExtraTrees Multi-Spectral';
  const sightengineActive = backendHealth?.sightengine_configured;

  return (
    <header className="border-b border-white/[0.08] bg-space-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & System Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer" onClick={onReset}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan transition-all group-hover:scale-105">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-space-950 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black font-mono tracking-tight text-white flex items-center gap-1.5">
                THE EYES <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-medium">STUDIO</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              2D Fourier Frequency Forensics • Synthetic AI Detector
            </p>
          </div>
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          {/* Server Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-colors ${
            isOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="hidden md:inline">{isOnline ? 'ENGINE: CONNECTED' : 'ENGINE: OFFLINE'}</span>
          </div>

          {/* Model Pipeline Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[150px]" title={modelName}>
              {modelName}
            </span>
          </div>

          {/* Sightengine Cloud Status */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
            sightengineActive
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]'
              : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>CLOUD: {sightengineActive ? 'SYNCED' : 'OPTIONAL'}</span>
          </div>

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/xeeshan-zs/The-Eyes"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Reset Action */}
          {hasResult && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold font-mono transition-all flex items-center gap-1.5 shadow-glow-cyan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">NEW IMAGE</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
