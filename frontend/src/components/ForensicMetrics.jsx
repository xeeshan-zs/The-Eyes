import React from 'react';
import { Activity, Sparkles, Gauge, Radio, HardDrive, Timer } from 'lucide-react';

export default function ForensicMetrics({ result }) {
  if (!result) return null;

  const diagnostics = result.diagnostics || {};
  const dims = diagnostics.dimensions || [512, 512];
  const alpha = diagnostics.spectral_slope_alpha !== undefined ? diagnostics.spectral_slope_alpha : 1.8;
  const entropy = diagnostics.spectral_entropy !== undefined ? Math.round(diagnostics.spectral_entropy * 100) : 74;
  const hfRatio = diagnostics.high_freq_ratio !== undefined ? Math.round(diagnostics.high_freq_ratio * 100) : 48;
  const latency = result.processing_time_ms || 0;

  const isAlphaAbnormal = alpha < 1.60;
  const isHfAbnormal = hfRatio > 45;

  const METRICS = [
    {
      label: 'SPECTRAL SLOPE (α DECAY)',
      value: `α = ${alpha}`,
      badge: isAlphaAbnormal ? 'FLATTENED' : 'NOMINAL 1/f²',
      subtext: isAlphaAbnormal ? 'Diffusion noise flattening' : 'Continuous optical decay',
      status: isAlphaAbnormal ? 'warning' : 'ok',
      icon: Activity,
    },
    {
      label: 'HF NOISE FLOOR ENERGY',
      value: `${hfRatio}%`,
      badge: isHfAbnormal ? 'ELEVATED' : 'NATURAL',
      subtext: isHfAbnormal ? 'Outer frequency shelf' : 'Sensor grain roll-off',
      status: isHfAbnormal ? 'warning' : 'ok',
      icon: Gauge,
    },
    {
      label: 'SPECTRAL ENTROPY (H)',
      value: `${entropy}%`,
      badge: 'AZIMUTHAL',
      subtext: 'Frequency energy dispersion',
      status: 'neutral',
      icon: Radio,
    },
    {
      label: 'PIPELINE LATENCY',
      value: `${latency}ms`,
      badge: '0ms EGRESS',
      subtext: 'Local 2D FFT + Inference',
      status: 'ok',
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
            className="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                {metric.label}
              </span>
              <Icon className="w-4 h-4 text-cyan-400" />
            </div>

            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {metric.value}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  metric.status === 'warning'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                }`}>
                  {metric.badge}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                {metric.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
