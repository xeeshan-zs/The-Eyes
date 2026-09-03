import React, { useState } from 'react';
import { LineChart, Activity, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RadialProfileChart({ diagnostics, isFake }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!diagnostics || !diagnostics.radial_profile) return null;

  const profile = diagnostics.radial_profile;
  const natural = diagnostics.natural_curve || [];
  const numPoints = profile.length;

  // SVG dimensions
  const width = 580;
  const height = 180;
  const padding = { top: 20, right: 25, bottom: 35, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Coordinate mappers
  const getX = (index) => padding.left + (index / (numPoints - 1)) * graphWidth;
  const getY = (val) => padding.top + (1 - Math.max(0, Math.min(1, val))) * graphHeight;

  // Generate SVG path for empirical radial decay
  const profilePoints = profile.map((v, i) => `${getX(i)},${getY(v)}`).join(' L ');
  const profilePath = `M ${profilePoints}`;

  // Area under curve
  const areaPath = `M ${profilePoints} L ${getX(numPoints - 1)},${padding.top + graphHeight} L ${padding.left},${padding.top + graphHeight} Z`;

  // Natural 1/f curve path
  const naturalPoints = natural.map((v, i) => `${getX(i)},${getY(v)}`).join(' L ');
  const naturalPath = `M ${naturalPoints}`;

  return (
    <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-4.5 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              1D Azimuthal Radial Power Spectrum
            </h4>
            <p className="text-[11px] text-slate-400">
              Spatial Frequency Decay ($\log|F(r)|$) vs. Theoretical Natural Optical Curve ($1/f^\alpha$)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-3 h-0.5 rounded-full ${isFake ? 'bg-rose-400' : 'bg-emerald-400'}`} />
            <span className="text-slate-300">Empirical Sample</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-slate-500 border-b border-dashed" />
            <span className="text-slate-500">Natural $1/f^2$ Ref</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradientFake" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="areaGradientReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + ratio * graphHeight;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#21262D"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-600 font-mono text-[9px]"
                >
                  {(1 - ratio).toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* X Axis Ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const x = padding.left + ratio * graphWidth;
            const labels = ['DC (0)', 'Low-Freq', 'Mid-Band', 'High-Band', 'Nyquist (π)'];
            const idx = Math.round(ratio * 4);
            return (
              <g key={ratio}>
                <line
                  x1={x}
                  y1={padding.top + graphHeight}
                  x2={x}
                  y2={padding.top + graphHeight + 4}
                  stroke="#30363D"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + graphHeight + 16}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[9px]"
                >
                  {labels[idx]}
                </text>
              </g>
            );
          })}

          {/* High Frequency Anomaly Zone highlight (top 30%) */}
          <rect
            x={padding.left + graphWidth * 0.7}
            y={padding.top}
            width={graphWidth * 0.3}
            height={graphHeight}
            fill={isFake ? 'rgba(244, 63, 94, 0.06)' : 'rgba(16, 185, 129, 0.04)'}
            stroke={isFake ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.15)'}
            strokeDasharray="2 2"
          />
          <text
            x={padding.left + graphWidth * 0.85}
            y={padding.top + 14}
            textAnchor="middle"
            className={`font-mono text-[8.5px] uppercase tracking-wider ${
              isFake ? 'fill-rose-400/80 font-bold' : 'fill-slate-500'
            }`}
          >
            {isFake ? '⚠ Artifact Zone' : 'Nyquist Shelf'}
          </text>

          {/* Natural reference curve */}
          <path
            d={naturalPath}
            fill="none"
            stroke="#484F58"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Empirical Area under curve */}
          <path
            d={areaPath}
            fill={isFake ? 'url(#areaGradientFake)' : 'url(#areaGradientReal)'}
          />

          {/* Empirical Profile Line */}
          <path
            d={profilePath}
            fill="none"
            stroke={isFake ? '#F43F5E' : '#10B981'}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Point */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + graphHeight}
                stroke="#00F0FF"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(profile[hoverIndex])}
                r="4.5"
                className={isFake ? 'fill-rose-400' : 'fill-emerald-400'}
                stroke="#070A0F"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Overlay Detector */}
        <div
          className="absolute inset-0 cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            const index = Math.round(relX * (numPoints - 1));
            if (index >= 0 && index < numPoints) {
              setHoverIndex(index);
            }
          }}
          onMouseLeave={() => setHoverIndex(null)}
        />
      </div>

      {/* Footer Insight Banner */}
      <div className="mt-2 pt-2 border-t border-[#21262D] flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {isFake
              ? 'High-frequency plateau indicates deconvolution upsampling artifacts (GAN / Diffusion).'
              : 'Smooth asymptotic power decay obeys standard natural scene optical distribution.'}
          </span>
        </div>
        {hoverIndex !== null && (
          <div className="text-cyan-300 font-bold">
            Bin #{hoverIndex} : {(profile[hoverIndex] * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
