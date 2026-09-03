import React from 'react';
import { Cpu, Gauge, Radio, Layers, HardDrive, Timer } from 'lucide-react';

export default function ForensicMetrics({ result }) {
  if (!result) return null;

  const diagnostics = result.diagnostics || {};
  const dims = diagnostics.dimensions || [512, 512];
  const hfRatio = diagnostics.high_freq_ratio !== undefined ? Math.round(diagnostics.high_freq_ratio * 100) : 48;
  const entropy = diagnostics.spectral_entropy !== undefined ? Math.round(diagnostics.spectral_entropy * 100) : 72;
  const latency = result.processing_time_ms || 0;
  const fileSize = result.file_size_kb || 0;

  const METRICS = [
    {
      label: 'HF RESIDUAL ENERGY',
      value: `${hfRatio}%`,
      subtext: hfRatio > 45 ? 'Elevated (AI Signature)' : 'Nominal (Natural Decay)',
      status: hfRatio > 45 ? 'warning' : 'ok',
      icon: Gauge,
    },
    {
      label: 'SPECTRAL ENTROPY (H)',
      value: `${entropy}%`,
      subtext: 'Azimuthal Frequency Spread',
      status: 'neutral',
      icon: Radio,
    },
    {
      label: 'SPATIAL RESOLUTION',
      value: `${dims[0]} × ${dims[1]}`,
      subtext: `${fileSize} KB • Matrix`,
      status: 'neutral',
      icon: HardDrive,
    },
    {
      label: 'PIPELINE LATENCY',
      value: `${latency}ms`,
      subtext: 'FFT + Extraction + Inference',
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
