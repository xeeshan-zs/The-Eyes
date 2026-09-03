import React, { useRef, useState, useCallback, useEffect } from 'react';
import { UploadCloud, Sparkles } from 'lucide-react';

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
        className={`relative group cursor-pointer rounded-xl border-3 border-dashed transition-all duration-200 overflow-hidden ${
          isDragOver
            ? 'border-brutal-yellow bg-brutal-surface shadow-brutal-yellow translate-x-[-2px] translate-y-[-2px]'
            : 'border-brutal-border bg-brutal-surface/80 hover:border-brutal-yellow hover:bg-brutal-surface shadow-brutal'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-brutal-yellow border-2 border-black shadow-brutal flex items-center justify-center animate-bounce mb-3">
              <Sparkles className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <span className="text-sm font-mono font-black tracking-wider text-white">
              EXTRACTING 2D FOURIER HARMONICS...
            </span>
            <span className="text-xs font-mono text-slate-400 mt-1">
              Evaluating Multi-Spectral Classifier Pipeline
            </span>
          </div>
        )}

        <div className="p-10 sm:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mb-4 rounded-xl bg-brutal-yellow border-2 border-black shadow-brutal flex items-center justify-center text-black group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
            <UploadCloud className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h3 className="text-xl font-black text-white mb-2 font-mono">
            DROP IMAGE HERE OR <span className="text-brutal-yellow underline underline-offset-4 decoration-2">BROWSE DISK</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono max-w-md mb-4">
            Supports PNG, JPEG, WEBP. Paste from clipboard anywhere with <kbd className="px-2 py-0.5 rounded bg-black border border-brutal-border text-brutal-yellow font-bold">CTRL+V</kbd>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-bold text-slate-300">
            <span className="px-2 py-0.5 rounded bg-black border border-brutal-border">
              2D FFT Spectrum
            </span>
            <span className="px-2 py-0.5 rounded bg-black border border-brutal-border">
              Multi-Spectral Features
            </span>
            <span className="px-2 py-0.5 rounded bg-black border border-brutal-border text-brutal-green">
              0ms Cloud Egress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
