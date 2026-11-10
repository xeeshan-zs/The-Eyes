import React, { useState } from 'react';
import { Eye, Cpu, Sparkles, Github, RefreshCw, Sun, Moon, Info, Key, Check } from 'lucide-react';

export default function Header({ 
  onReset, 
  hasResult, 
  theme, 
  onToggleTheme,
  currentView,
  onNavigate
}) {
  return (
    <>
      <header className="border-b-2 border-black dark:border-white bg-[#FFFFFF]/95 dark:bg-[#050508]/95 backdrop-blur-xl sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-[3.75rem] py-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Block */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <a
              href="/"
              aria-label="The Eyes home"
              className="cursor-pointer px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF] font-mono font-black text-black text-xs sm:text-sm tracking-wider flex items-center gap-1.5 sm:gap-2 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform select-none"
            >
              <Eye className="w-4 h-4 stroke-[3]" />
              <span>THE EYES</span>
              <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 bg-black text-[#FFE600] font-black rounded">2.0</span>
            </a>

            <span className="hidden lg:inline-block text-xs font-mono text-black dark:text-white font-black border-l-2 border-black/30 dark:border-white/40 pl-3">
              2D FOURIER SPECTRAL FORENSICS
            </span>
          </div>

          {/* Center / Right Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs font-mono">
            {/* Navigation View Toggle */}
            <button
              onClick={() => onNavigate(currentView === 'about' ? 'detector' : 'about')}
              className={`px-2 sm:px-3 py-1.5 rounded-md border-2 border-black font-mono font-black flex items-center gap-1 sm:gap-1.5 transition-all shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF] ${
                currentView === 'about'
                  ? 'bg-[#00F0FF] text-black'
                  : 'bg-white dark:bg-[#181824] text-black dark:text-white hover:bg-[#FFE600] hover:text-black'
              }`}
              title="Project Dossier & About"
            >
              <Info className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden xs:inline sm:inline">{currentView === 'about' ? 'DETECTOR' : 'ABOUT'}</span>
            </button>


            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-md bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF] font-mono font-black flex items-center gap-1 sm:gap-1.5 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
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
              <Github className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
            </a>

            {/* Reset Button */}
            {hasResult && currentView === 'detector' && (
              <button
                onClick={onReset}
                className="btn-brutal-yellow px-2 sm:px-3 py-1 rounded-md text-xs font-mono font-black flex items-center gap-1 sm:gap-1.5"
                title="Analyze Another Image"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">NEW IMAGE</span>
              </button>
            )}
          </div>
        </div>
      </header>

    </>
  );
}
