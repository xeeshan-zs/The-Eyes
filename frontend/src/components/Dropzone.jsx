import React, { useRef, useState, useCallback, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Terminal, HardDrive, Cpu } from 'lucide-react';

export default function Dropzone({ onFileSelected, loading, currentPreview }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelected(file);
      }
    }
  }, [onFileSelected]);

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) onFileSelected(blob);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFileSelected]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelected(file);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/30 shadow-glow-cyan scale-[1.008]'
            : 'border-white/[0.12] bg-space-950/60 hover:border-cyan-500/50 hover:bg-space-900/80 shadow-glass'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Loading Radar Scanner Animation */}
        {loading && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-space-950/85 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-radar absolute left-0 shadow-[0_0_15px_#00F0FF]" />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center shadow-glow-cyan">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div className="text-center">
                <span className="text-sm font-mono font-bold tracking-wider text-white block">
                  RUNNING 2D FOURIER SPECTRAL ANALYSIS...
                </span>
                <span className="text-xs font-mono text-slate-400 mt-1 block">
                  Extracting Multi-Spectral Harmonics &amp; Model Inference
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-10 sm:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:shadow-glow-cyan transition-all duration-300">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1.5 font-mono">
            Drop image file here, or <span className="text-cyan-400 underline underline-offset-4">browse</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-4">
            Supports PNG, JPEG, WEBP. Paste anywhere with <kbd className="px-2 py-0.5 rounded bg-space-850 border border-white/[0.1] text-cyan-300 font-mono text-[11px] font-bold">Ctrl+V</kbd>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
              2D FFT Centered Matrix
            </span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
              Multi-Spectral Features
            </span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
              Local Privacy (0ms Cloud)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
