import React from 'react';
import { Eye, Shield, Activity, Cpu, Sparkles, Terminal, Radio, Github, RefreshCw } from 'lucide-react';

export default function Header({ backendHealth, onReset, hasResult }) {
  const isOnline = backendHealth?.status === 'online';
  const modelName = backendHealth?.model_file || 'ExtraTrees Multi-Spectral';
  const sightengineActive = backendHealth?.sightengine_configured;

  return (
    <header className="border-b-2 border-brutal-border bg-brutal-bg/85 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Block */}
        <div className="flex items-center gap-3">
          <div
            onClick={onReset}
            className="cursor-pointer px-3 py-1.5 rounded-lg bg-brutal-yellow border-2 border-black shadow-brutal-sm font-mono font-black text-black text-sm tracking-wider flex items-center gap-2 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
          >
            <Eye className="w-4 h-4 stroke-[2.5]" />
            <span>THE EYES</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black text-white rounded">2.0</span>
          </div>

          <span className="hidden md:inline-block text-xs font-mono text-slate-400 font-bold border-l-2 border-brutal-border pl-3">
            2D FOURIER SPECTRAL FORENSICS
          </span>
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          {/* Server Status Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 border-black shadow-brutal-sm font-bold ${
            isOnline
              ? 'bg-brutal-green text-black'
              : 'bg-brutal-pink text-white'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-black' : 'bg-white'} animate-pulse`} />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* Model Pipeline Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brutal-surface border-2 border-brutal-border text-slate-200 font-bold shadow-brutal-sm">
            <Cpu className="w-3.5 h-3.5 text-brutal-cyan stroke-[2.5]" />
            <span className="truncate max-w-[140px]" title={modelName}>
              {modelName}
            </span>
          </div>

          {/* Sightengine Status */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 border-black font-bold shadow-brutal-sm ${
            sightengineActive
              ? 'bg-brutal-purple text-white'
              : 'bg-brutal-surface border-brutal-border text-slate-400'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>CLOUD: {sightengineActive ? 'SYNCED' : 'OFF'}</span>
          </div>

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/xeeshan-zs/The-Eyes"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md bg-brutal-surface border-2 border-black shadow-brutal-sm text-slate-200 hover:text-brutal-yellow hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Reset Button */}
          {hasResult && (
            <button
              onClick={onReset}
              className="btn-brutal px-3 py-1 rounded-md bg-brutal-yellow text-black font-black text-xs font-mono flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>RESET</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
