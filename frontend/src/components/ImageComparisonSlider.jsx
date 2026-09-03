import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sliders, Crosshair } from 'lucide-react';

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
    <div className="glass-brutal rounded-xl p-5 flex flex-col shadow-[6px_6px_0px_#000000]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-white/20">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-brutal-yellow text-black font-mono font-black text-xs border border-black shadow-[2px_2px_0px_#FFFFFF]">
            SPLIT LENS
          </span>
          <span className="text-xs font-mono font-black text-white uppercase tracking-wide">
            Spatial Pixel Domain ↔ 2D FFT Harmonics
          </span>
        </div>

        {/* Live Coordinate Badge */}
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-black px-3 py-1 rounded border-2 border-white text-white shadow-brutal-sm">
          <Crosshair className="w-4 h-4 text-brutal-yellow stroke-[3]" />
          <span>FREQ: u={coords.u >= 0 ? `+${coords.u}` : coords.u}, v={coords.v >= 0 ? `+${coords.v}` : coords.v}</span>
        </div>
      </div>

      {/* Viewport */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-lg overflow-hidden bg-black border-2 border-white cursor-ew-resize select-none shadow-brutal"
      >
        {/* Under Layer: FFT Spectrum */}
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <img
            src={fftImage}
            alt="2D FFT Spectrum"
            className="w-full h-full object-contain pointer-events-none"
          />
          <div className="absolute top-3 right-3 bg-black/95 backdrop-blur-md px-3 py-1.5 rounded border-2 border-white text-xs font-mono font-black text-brutal-cyan shadow-brutal-sm">
            2D FFT log(1+|F(u,v)|)
          </div>
        </div>

        {/* Top Layer: Spatial Image */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <img
              src={originalImage}
              alt="Original"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
          <div className="absolute top-3 left-3 bg-black/95 backdrop-blur-md px-3 py-1.5 rounded border-2 border-white text-xs font-mono font-black text-brutal-green shadow-brutal-sm">
            Spatial Domain (RGB)
          </div>
        </div>

        {/* Divider Beam & Handle */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-brutal-yellow shadow-[0_0_15px_#FFE600] z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-md bg-brutal-yellow border-2 border-black shadow-[3px_3px_0px_#FFFFFF] flex items-center justify-center text-black font-mono font-black text-sm">
            ↔
          </div>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="mt-3 pt-3 border-t-2 border-white/20 flex items-center justify-between text-xs font-mono text-slate-300">
        <span>Click &amp; drag horizontally across canvas</span>
        <span className="font-black text-brutal-yellow">Position: {Math.round(sliderPosition)}%</span>
      </div>
    </div>
  );
}
