import React, { useRef, useState, useCallback, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Terminal, FileCode, HardDrive } from 'lucide-react';

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
        className={`relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/20'
            : 'border-[#30363D] bg-[#0D1117] hover:border-[#484F58] hover:bg-[#161B22]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Loading Radar Animation */}
        {loading && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-[#070A0F]/85 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan absolute left-0" />
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="text-center">
                <span className="text-xs font-mono font-bold tracking-wider text-white">
                  ANALYZING 2D FOURIER SPECTRUM...
                </span>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Calculating Azimuthal Radial Decay &amp; Classifier Inference
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 mb-3 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/40 transition-colors">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-semibold text-slate-100 mb-1">
            Drop target image or <span className="text-cyan-400 underline underline-offset-4">browse files</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-3">
            Supports PNG, JPEG, WEBP. You can also paste directly with <kbd className="px-1.5 py-0.5 rounded bg-[#161B22] border border-[#30363D] text-slate-300 font-mono text-[10px]">Ctrl+V</kbd>
          </p>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span>2D FFT 512×512</span>
            <span>•</span>
            <span>Log-Magnitude $\log(1+|F|)$</span>
            <span>•</span>
            <span>Local Inference</span>
          </div>
        </div>
      </div>
    </div>
  );
}
