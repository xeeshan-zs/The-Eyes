import React, { useRef, useState, useCallback, useEffect } from 'react';
import { UploadCloud, Sparkles } from 'lucide-react';

export default function Dropzone({ onFileSelected, loading, currentPreview, loadingMessage }) {
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
    if (!loading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelected(file);
      }
    }
  }, [onFileSelected, loading]);

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob && !loading) onFileSelected(blob);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFileSelected, loading]);

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
            ? 'border-black dark:border-[#FFE600] bg-[#FFFBEB] dark:bg-black shadow-[6px_6px_0px_#FFE600] translate-x-[-2px] translate-y-[-2px]'
            : 'border-black dark:border-white bg-white dark:bg-[#0E0E14] hover:bg-[#FFFBEB] dark:hover:bg-black shadow-[6px_6px_0px_#000000]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          onClick={event => event.stopPropagation()}
          className="hidden"
        />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-white/95 dark:bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#FFE600] border-2 border-black shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#FFFFFF] flex items-center justify-center animate-bounce mb-3">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-black stroke-[3]" />
            </div>
            <span className="text-sm sm:text-lg font-mono font-black tracking-wider text-black dark:text-white max-w-sm">
              {loadingMessage || 'EXTRACTING 2D FOURIER HARMONICS...'}
            </span>
            <span className="text-[11px] sm:text-xs font-mono font-black text-[#059669] dark:text-[#FFE600] mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-ping" />
              Evaluating Multi-Spectral Classifier Pipeline
            </span>
          </div>
        )}

        <div className="p-6 sm:p-12 flex flex-col items-center justify-center text-center">
          <button type="button" disabled={loading}
            onClick={event => { event.stopPropagation(); fileInputRef.current?.click(); }}
            className="flex min-h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-lg border-2 border-black bg-[#FFE600] px-8 py-4 text-lg font-black text-black shadow-[4px_4px_0px_#000] focus-visible:outline-blue-600">
            <UploadCloud aria-hidden="true" className="h-6 w-6" /> Upload image
          </button>
          <p className="mt-4 text-sm text-slate-700 dark:text-slate-200">
            <span className="sm:hidden">Choose a photo from your device.</span>
            <span className="hidden sm:inline">You can also drop an image here or paste it from your clipboard.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
