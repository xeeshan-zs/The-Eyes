import React from 'react';
import { Eye, Cpu, Sparkles, Github, RefreshCw, Sun, Moon, Info } from 'lucide-react';

export default function Header({ 
  backendHealth, 
  onReset, 
  hasResult, 
  theme, 
  onToggleTheme,
  currentView,
  onNavigate
}) {
  const isOnline = backendHealth?.status === 'online';
  const modelName = backendHealth?.model_file || 'ExtraTrees Multi-Spectral';

  return (
    <header className="border-b-2 border-black dark:border-white bg-[#FFFFFF]/90 dark:bg-[#050508]/90 backdrop-blur-xl sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Block */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigate('detector')}
            className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#FFFFFF] font-mono font-black text-black text-sm tracking-wider flex items-center gap-2 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
          >
            <Eye className="w-4 h-4 stroke-[3]" />
            <span>THE EYES</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black text-[#FFE600] font-black rounded">2.0</span>
          </div>

          <span className="hidden md:inline-block text-xs font-mono text-black dark:text-white font-black border-l-2 border-black/30 dark:border-white/40 pl-3">
            2D FOURIER SPECTRAL FORENSICS
          </span>
        </div>

        {/* Center / Right Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 text-xs font-mono">
          {/* Navigation View Toggle */}
          <button
            onClick={() => onNavigate(currentView === 'about' ? 'detector' : 'about')}
            className={`px-3 py-1.5 rounded-md border-2 border-black font-mono font-black flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF] ${
              currentView === 'about'
                ? 'bg-[#00F0FF] text-black'
                : 'bg-white dark:bg-[#181824] text-black dark:text-white hover:bg-[#FFE600] hover:text-black'
            }`}
          >
            <Info className="w-3.5 h-3.5 stroke-[3]" />
            <span>{currentView === 'about' ? 'DETECTOR' : 'ABOUT'}</span>
          </button>

          {/* Server Status Pill */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF] font-black ${
            isOnline
              ? 'bg-[#00F5A0] text-black'
              : 'bg-[#FF2E63] text-white'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-black' : 'bg-white'} animate-pulse`} />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="px-2.5 py-1 rounded-md bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF] font-mono font-black flex items-center gap-1.5 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 stroke-[3] text-black" />
                <span className="hidden sm:inline">LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 stroke-[3] text-black" />
                <span className="hidden sm:inline">DARK</span>
              </>
            )}
          </button>

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/xeeshan-zs/The-Eyes"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md bg-white dark:bg-[#181824] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000000] text-black dark:text-white hover:bg-[#FFE600] hover:text-black hover:border-black transition-all"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4 stroke-[2.5]" />
          </a>

          {/* Reset Button */}
          {hasResult && currentView === 'detector' && (
            <button
              onClick={onReset}
              className="btn-brutal-yellow px-3 py-1 rounded-md text-xs font-mono font-black flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">NEW IMAGE</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
