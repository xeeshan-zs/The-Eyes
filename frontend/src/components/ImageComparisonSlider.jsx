import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sliders, Maximize2, Crosshair, Sparkles } from 'lucide-react';

export default function ImageComparisonSlider({ originalImage, fftImage, filename }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [coords, setCoords] = useState({ u: 0, v: 0 });
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !e.touches[0]) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setCoords({
      u: Math.round(relX * 256),
      v: Math.round(relY * 256),
    });

    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-4.5 flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              Interactive Spatial ↔ Spectral Split Wiper
            </h4>
            <p className="text-[11px] text-slate-400">
              Slide across to inspect direct frequency mapping against spatial coordinates
            </p>
          </div>
        </div>

        {/* Live Coordinate Telemetry */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] bg-[#161B22] px-2.5 py-1 rounded-md border border-[#30363D] text-slate-300">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>FREQ: u={coords.u >= 0 ? `+${coords.u}` : coords.u}, v={coords.v >= 0 ? `+${coords.v}` : coords.v}</span>
        </div>
      </div>

      {/* Slider Container */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#070A0F] border border-[#30363D] cursor-ew-resize select-none"
      >
        {/* Under Layer: 2D FFT Spectrum */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#070A0F]">
          <img
            src={fftImage}
            alt="2D FFT Spectrum"
            className="w-full h-full object-contain pointer-events-none"
          />
          <div className="absolute top-3 right-3 bg-[#070A0F]/80 backdrop-blur-md px-2 py-1 rounded border border-[#30363D] text-[10px] font-mono text-cyan-300">
            2D FFT Spectrum log(1+|F|)
          </div>
        </div>

        {/* Top Layer: Original Spatial Image clipped to sliderPosition */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-[#070A0F]">
            <img
              src={originalImage}
              alt="Original Input"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
          <div className="absolute top-3 left-3 bg-[#070A0F]/80 backdrop-blur-md px-2 py-1 rounded border border-[#30363D] text-[10px] font-mono text-emerald-300">
            Spatial Domain (Original)
          </div>
        </div>

        {/* Vertical Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_12px_#00F0FF] z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#0D1117] border-2 border-cyan-400 shadow-lg flex items-center justify-center text-cyan-300 text-[10px] font-mono">
            ↔
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="mt-2 pt-2 border-t border-[#21262D] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Drag anywhere across image to wipe</span>
        <span>Split: {Math.round(sliderPosition)}% / {100 - Math.round(sliderPosition)}%</span>
      </div>
    </div>
  );
}
