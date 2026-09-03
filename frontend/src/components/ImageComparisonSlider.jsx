import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sliders, Crosshair, Sparkles, Eye, Activity } from 'lucide-react';

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
    <div className="glass-panel rounded-2xl p-5 flex flex-col shadow-2xl">
      {/* Control Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              Spatial ↔ Spectral Split Lens
            </h4>
            <p className="text-[11px] text-slate-400">
              Drag across the canvas to cross-inspect RGB pixels against 2D Fourier harmonics
            </p>
          </div>
        </div>

        {/* Live Coordinate Telemetry */}
        <div className="flex items-center gap-2 font-mono text-[11px] bg-space-950/80 px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-300">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>FREQ: u={coords.u >= 0 ? `+${coords.u}` : coords.u}, v={coords.v >= 0 ? `+${coords.v}` : coords.v}</span>
        </div>
      </div>

      {/* Slider Viewport */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-xl overflow-hidden bg-space-950 border border-white/[0.1] cursor-ew-resize select-none group"
      >
        {/* Under Layer: 2D FFT Spectrum */}
        <div className="absolute inset-0 flex items-center justify-center bg-space-950">
          <img
            src={fftImage}
            alt="2D FFT Spectrum"
            className="w-full h-full object-contain pointer-events-none"
          />
          <div className="absolute top-3.5 right-3.5 bg-space-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 shadow-lg">
            2D FFT Log-Magnitude log(1+|F|)
          </div>
        </div>

        {/* Top Layer: Spatial Original Image */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-space-950">
            <img
              src={originalImage}
              alt="Original Input"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
          <div className="absolute top-3.5 left-3.5 bg-space-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-500/30 text-[10px] font-mono text-emerald-300 shadow-lg">
            Spatial Pixel Domain (RGB)
          </div>
        </div>

        {/* Cyan Laser Divider Beam */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400 via-white to-cyan-400 shadow-[0_0_15px_#00F0FF] z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Futuristic Splitter Knob */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-space-900 border-2 border-cyan-400 shadow-glow-cyan flex items-center justify-center text-cyan-300 text-xs font-mono font-bold">
            ↔
          </div>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Slide horizontally to reveal frequency artifacts</span>
        <span className="text-cyan-400 font-bold">Wiper Position: {Math.round(sliderPosition)}%</span>
      </div>
    </div>
  );
}
