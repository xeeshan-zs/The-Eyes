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
        className={`relative group cursor-pointer rounded-xl border-3 border-dashed transition-all duration-150 overflow-hidden ${
          isDragOver
            ? 'border-brutal-yellow bg-black shadow-[6px_6px_0px_#FFE600] translate-x-[-2px] translate-y-[-2px]'
            : 'border-white bg-[#0E0E14]/90 hover:border-brutal-yellow hover:bg-black shadow-[6px_6px_0px_#000000]'
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
          <div className="absolute inset-0 z-30 pointer-events-none bg-black/95 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-xl bg-brutal-yellow border-2 border-black shadow-[4px_4px_0px_#FFFFFF] flex items-center justify-center animate-bounce mb-3">
              <Sparkles className="w-7 h-7 text-black stroke-[3]" />
            </div>
            <span className="text-base font-mono font-black tracking-wider text-white">
              EXTRACTING 2D FOURIER HARMONICS...
            </span>
            <span className="text-xs font-mono font-bold text-brutal-yellow mt-1">
              Evaluating Multi-Spectral Classifier Pipeline
            </span>
          </div>
        )}

        <div className="p-10 sm:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mb-4 rounded-xl bg-brutal-yellow border-2 border-black shadow-[4px_4px_0px_#FFFFFF] flex items-center justify-center text-black group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
            <UploadCloud className="w-8 h-8 stroke-[3]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white mb-2 font-mono">
            DROP IMAGE FILE HERE OR <span className="text-brutal-yellow underline underline-offset-4 decoration-4">BROWSE DISK</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 font-mono max-w-md mb-5">
            Supports PNG, JPEG, WEBP. Paste anywhere with <kbd className="px-2 py-0.5 rounded bg-black border-2 border-white text-brutal-yellow font-black">CTRL+V</kbd>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono font-black text-white">
            <span className="px-3 py-1 rounded bg-black border-2 border-white shadow-brutal-sm">
              2D FFT Spectrum
            </span>
            <span className="px-3 py-1 rounded bg-black border-2 border-white shadow-brutal-sm">
              Multi-Spectral Features
            </span>
            <span className="px-3 py-1 rounded bg-brutal-green text-black border-2 border-black shadow-brutal-sm">
              0ms Cloud Egress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
