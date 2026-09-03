import React from 'react';
import { Activity, Gauge, Radio, Timer } from 'lucide-react';

export default function ForensicMetrics({ result }) {
  if (!result) return null;

  const diagnostics = result.diagnostics || {};
  const alpha = diagnostics.spectral_slope_alpha !== undefined ? diagnostics.spectral_slope_alpha : 1.8;
  const entropy = diagnostics.spectral_entropy !== undefined ? Math.round(diagnostics.spectral_entropy * 100) : 74;
  const hfRatio = diagnostics.high_freq_ratio !== undefined ? Math.round(diagnostics.high_freq_ratio * 100) : 48;
  const latency = result.processing_time_ms || 0;

  const isAlphaAbnormal = alpha < 1.60;
  const isHfAbnormal = hfRatio > 45;

  const METRICS = [
    {
      label: 'SPECTRAL SLOPE (α)',
      value: `α = ${alpha}`,
      badge: isAlphaAbnormal ? 'FLAT SLOPE' : 'NOMINAL 1/f²',
      color: isAlphaAbnormal ? 'bg-brutal-pink text-white' : 'bg-brutal-green text-black',
      desc: isAlphaAbnormal ? 'Diffusion noise flattening' : 'Continuous optical decay',
      icon: Activity,
    },
    {
      label: 'HF NOISE FLOOR',
      value: `${hfRatio}%`,
      badge: isHfAbnormal ? 'ELEVATED' : 'NATURAL',
      color: isHfAbnormal ? 'bg-brutal-pink text-white' : 'bg-brutal-green text-black',
      desc: isHfAbnormal ? 'Outer frequency shelf' : 'Sensor grain roll-off',
      icon: Gauge,
    },
    {
      label: 'SPECTRAL ENTROPY (H)',
      value: `${entropy}%`,
      badge: 'DISPERSION',
      color: 'bg-brutal-yellow text-black',
      desc: 'Azimuthal harmonic entropy',
      icon: Radio,
    },
    {
      label: 'PIPELINE LATENCY',
      value: `${latency}ms`,
      badge: '0ms EGRESS',
      color: 'bg-brutal-cyan text-black',
      desc: 'Local FFT + classifier execution',
      icon: Timer,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {METRICS.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div
            key={idx}
            className="glass-brutal-card rounded-xl p-4 flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-black tracking-wider uppercase text-slate-400">
                {metric.label}
              </span>
              <Icon className="w-4 h-4 text-slate-300 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {metric.value}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border border-black shadow-brutal-sm ${metric.color}`}>
                  {metric.badge}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                {metric.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
