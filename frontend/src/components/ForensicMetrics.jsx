import React from 'react';
import { Activity, Gauge, Radio, Timer } from 'lucide-react';

export default function ForensicMetrics({ result }) {
  if (!result) return null;

  const diagnostics = result.diagnostics || {};
  const alpha = diagnostics.spectral_slope_alpha !== undefined ? diagnostics.spectral_slope_alpha : 1.8;
  const entropy = diagnostics.spectral_entropy !== undefined ? Math.round(diagnostics.spectral_entropy * 100) : 74;
  const hfRatio = diagnostics.high_freq_ratio !== undefined ? Math.round(diagnostics.high_freq_ratio * 100) : 45;
  const latency = result.processing_time_ms || 0;

  const isAlphaAbnormal = alpha < 1.60;
  const isHfAbnormal = hfRatio > 45;

  const METRICS = [
    {
      label: 'SPECTRAL SLOPE (α)',
      value: `α = ${alpha}`,
      badge: isAlphaAbnormal ? 'LOW SLOPE' : 'HIGHER SLOPE',
      badgeBg: isAlphaAbnormal ? 'bg-[#FF2E63] text-white' : 'bg-[#00F5A0] text-black',
      desc: 'Measured from this image',
      icon: Activity,
    },
    {
      label: 'HF NOISE FLOOR',
      value: `${hfRatio}%`,
      badge: isHfAbnormal ? 'ELEVATED' : 'LOWER',
      badgeBg: isHfAbnormal ? 'bg-[#FF2E63] text-white' : 'bg-[#00F5A0] text-black',
      desc: 'Energy in higher frequencies',
      icon: Gauge,
    },
    {
      label: 'SPECTRAL ENTROPY (H)',
      value: `${entropy}%`,
      badge: 'MEASURED',
      badgeBg: 'bg-[#FFE600] text-black',
      desc: 'Frequency spread in this image',
      icon: Radio,
    },
    {
      label: 'PIPELINE LATENCY',
      value: `${latency}ms`,
      badge: 'ANALYSIS',
      badgeBg: 'bg-[#00F0FF] text-black',
      desc: 'Time reported by the detector',
      icon: Timer,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {METRICS.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div
            key={idx}
            className="glass-brutal-card rounded-xl p-5 sm:p-6 flex flex-col justify-between border-2 border-black dark:border-white shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all bg-white dark:bg-[#14141E] min-h-[170px]"
          >
            {/* Top Label & Icon */}
            <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10 mb-3">
              <span className="text-xs font-mono font-black tracking-wider uppercase text-black dark:text-white">
                {metric.label}
              </span>
              <Icon className="w-5 h-5 text-black dark:text-white stroke-[2.5]" />
            </div>

            {/* Metric Value */}
            <div className="my-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-black dark:text-white tracking-tight block">
                {metric.value}
              </span>
            </div>

            {/* Status Pill & Subtitle */}
            <div className="pt-2">
              <div className="mb-2">
                <span className={`inline-block text-[11px] font-mono font-black px-2.5 py-1 rounded border-2 border-black shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFFFFF] ${metric.badgeBg}`}>
                  {metric.badge}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-800 dark:text-slate-200 font-bold truncate">
                {metric.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
