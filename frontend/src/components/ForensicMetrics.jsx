import React from 'react';
import { Cpu, Gauge, Radio, Layers, HardDrive, Timer, Activity, Sparkles } from 'lucide-react';

export default function ForensicMetrics({ result }) {
  if (!result) return null;

  const diagnostics = result.diagnostics || {};
  const diffMeta = diagnostics.diffusion_analysis || {};
  const dims = diagnostics.dimensions || [512, 512];
  
  const alphaSlope = diffMeta.spectral_slope_alpha !== undefined ? diffMeta.spectral_slope_alpha : 1.8;
  const chromaticCoh = diffMeta.chromatic_coherence !== undefined ? Math.round(diffMeta.chromatic_coherence * 100) : 60;
  const hfRatio = diagnostics.high_freq_ratio !== undefined ? Math.round(diagnostics.high_freq_ratio * 100) : 48;
  const latency = result.processing_time_ms || 0;

  const METRICS = [
    {
      label: 'SPECTRAL DECAY (α SLOPE)',
      value: `α = ${alphaSlope}`,
      subtext: alphaSlope < 1.55 ? 'Flattend (Diffusion/Gemini/DALL-E)' : '1/f² Natural Exponential',
      status: alphaSlope < 1.55 ? 'warning' : 'ok',
      icon: Activity,
    },
    {
      label: 'CHROMATIC COHERENCE',
      value: `${chromaticCoh}%`,
      subtext: chromaticCoh > 85 ? 'Elevated (Latent VAE Decoder)' : 'Bayer CFA Demosaic Nominal',
      status: chromaticCoh > 85 ? 'warning' : 'ok',
      icon: Sparkles,
    },
    {
      label: 'HF NOISE FLOOR ENERGY',
      value: `${hfRatio}%`,
      subtext: hfRatio > 45 ? 'Elevated Outer Frequency Shelf' : 'Natural Sensor Roll-off',
      status: hfRatio > 45 ? 'warning' : 'ok',
      icon: Gauge,
    },
    {
      label: 'PIPELINE LATENCY',
      value: `${latency}ms`,
      subtext: 'FFT + Multi-Spectral + Ensemble',
      status: 'ok',
      icon: Timer,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {METRICS.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div
            key={idx}
            className="bg-[#0D1117] border border-[#21262D] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#30363D] transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                {metric.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div>
              <div className="text-xl font-bold font-mono text-slate-100 tracking-tight">
                {metric.value}
              </div>
              <div className={`text-[11px] font-mono mt-0.5 ${
                metric.status === 'warning' ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {metric.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
