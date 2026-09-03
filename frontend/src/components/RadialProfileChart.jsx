import React, { useState } from 'react';
import { Activity, Info, AlertTriangle } from 'lucide-react';

export default function RadialProfileChart({ diagnostics, isFake }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!diagnostics || !diagnostics.radial_profile) return null;

  const profile = diagnostics.radial_profile;
  const natural = diagnostics.natural_curve || [];
  const numPoints = profile.length;

  const width = 620;
  const height = 200;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getX = (index) => padding.left + (index / (numPoints - 1)) * graphWidth;
  const getY = (val) => padding.top + (1 - Math.max(0, Math.min(1, val))) * graphHeight;

  const profilePoints = profile.map((v, i) => `${getX(i)},${getY(v)}`).join(' L ');
  const profilePath = `M ${profilePoints}`;
  const areaPath = `M ${profilePoints} L ${getX(numPoints - 1)},${padding.top + graphHeight} L ${padding.left},${padding.top + graphHeight} Z`;

  const naturalPoints = natural.map((v, i) => `${getX(i)},${getY(v)}`).join(' L ');
  const naturalPath = `M ${naturalPoints}`;

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-2xl">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              1D Azimuthal Radial Power Spectrum
            </h4>
            <p className="text-[11px] text-slate-400">
              Spatial Harmonic Power Decay ($\log|F(r)|$) vs. Natural Camera Power Law ($1/f^\alpha$)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-3 h-1 rounded-full ${isFake ? 'bg-rose-500 shadow-[0_0_8px_#F43F5E]' : 'bg-emerald-400 shadow-[0_0_8px_#10B981]'}`} />
            <span className="text-slate-200">Sample Curve</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-500 border-b border-dashed" />
            <span className="text-slate-400">1/f² Optical Ref</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden bg-space-950/60 p-2 rounded-xl border border-white/[0.06]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradientFake" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="areaGradientReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
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
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 font-mono text-[9px]"
                >
                  {(1 - ratio).toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const x = padding.left + ratio * graphWidth;
            const labels = ['DC (0)', 'Low-Band', 'Mid-Band', 'High-Band', 'Nyquist (π)'];
            const idx = Math.round(ratio * 4);
            return (
              <g key={ratio}>
                <line
                  x1={x}
                  y1={padding.top + graphHeight}
                  x2={x}
                  y2={padding.top + graphHeight + 4}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + graphHeight + 16}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[9.5px]"
                >
                  {labels[idx]}
                </text>
              </g>
            );
          })}

          {/* Nyquist High Frequency Anomaly Zone */}
          <rect
            x={padding.left + graphWidth * 0.65}
            y={padding.top}
            width={graphWidth * 0.35}
            height={graphHeight}
            fill={isFake ? 'rgba(244, 63, 94, 0.08)' : 'rgba(16, 185, 129, 0.04)'}
            stroke={isFake ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.2)'}
            strokeDasharray="2 2"
          />
          <text
            x={padding.left + graphWidth * 0.82}
            y={padding.top + 14}
            textAnchor="middle"
            className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
              isFake ? 'fill-rose-400' : 'fill-emerald-400'
            }`}
          >
            {isFake ? '⚠ Nyquist Noise Shelf' : 'Natural Roll-off'}
          </text>

          {/* Natural 1/f reference curve */}
          <path
            d={naturalPath}
            fill="none"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Shaded Area */}
          <path
            d={areaPath}
            fill={isFake ? 'url(#areaGradientFake)' : 'url(#areaGradientReal)'}
          />

          {/* Main Empirical Line */}
          <path
            d={profilePath}
            fill="none"
            stroke={isFake ? '#F43F5E' : '#10B981'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Crosshair */}
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
                r="5"
                className={isFake ? 'fill-rose-400' : 'fill-emerald-400'}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Detector */}
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

      {/* Footer Diagnostic Insight */}
      <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {isFake
              ? 'Flattened power decay (low alpha) indicates generative upsampling artifacts.'
              : 'Smooth exponential decay strictly follows natural optical Poisson-Gaussian distribution.'}
          </span>
        </div>
        {hoverIndex !== null && (
          <div className="text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            Bin #{hoverIndex} : {(profile[hoverIndex] * 100).toFixed(1)}% Energy
          </div>
        )}
      </div>
    </div>
  );
}
