import React from 'react';
import { Camera, Sparkles, Image as ImageIcon, Zap } from 'lucide-react';

// Generates lightweight synthetic test canvas bitmaps for instant 1-click live testing
function createSampleCanvasImage(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  if (type === 'real_nature') {
    // Natural continuous gradient and smooth organic curves (1/f decay)
    const grad = ctx.createRadialGradient(192, 192, 20, 192, 192, 200);
    grad.addColorStop(0, '#5A7D6A');
    grad.addColorStop(0.5, '#2C3E50');
    grad.addColorStop(1, '#1A252F');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 384, 384);

    // Add soft organic natural waves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(192 + Math.sin(i) * 60, 192 + Math.cos(i) * 60, 40 + i * 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (type === 'real_dslr') {
    // Real portrait lighting simulation
    const grad = ctx.createLinearGradient(0, 0, 384, 384);
    grad.addColorStop(0, '#E0A96D');
    grad.addColorStop(0.5, '#734046');
    grad.addColorStop(1, '#201A23');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 384, 384);

    ctx.fillStyle = 'rgba(255, 240, 220, 0.4)';
    ctx.beginPath();
    ctx.arc(160, 160, 90, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'ai_midjourney') {
    // Generative AI periodic grid upsampling artifacts
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 384, 384);

    // High frequency periodic checkerboard / deconvolution spikes
    for (let x = 0; x < 384; x += 12) {
      for (let y = 0; y < 384; y += 12) {
        const val = ((x ^ y) % 24) * 8;
        ctx.fillStyle = `rgb(${val + 40}, ${val + 10}, ${val + 80})`;
        ctx.fillRect(x, y, 6, 6);
      }
    }
    // Overlay synth subject
    const grad = ctx.createRadialGradient(192, 192, 10, 192, 192, 140);
    grad.addColorStop(0, 'rgba(244, 63, 94, 0.8)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 384, 384);
  } else if (type === 'ai_sdxl') {
    // Diffusion step residual lattice pattern
    ctx.fillStyle = '#18181B';
    ctx.fillRect(0, 0, 384, 384);

    ctx.strokeStyle = 'rgba(255, 100, 200, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 384; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(384 - i, 384);
      ctx.stroke();
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], `${type}_demo.png`, { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}

export default function SamplePresets({ onSelectSample, disabled }) {
  const PRESETS = [
    {
      id: 'real_dslr',
      label: 'DSLR Camera Portrait',
      tag: 'AUTHENTIC',
      color: 'emerald',
      icon: Camera,
    },
    {
      id: 'real_nature',
      label: 'Natural Landscape',
      tag: 'AUTHENTIC',
      color: 'emerald',
      icon: ImageIcon,
    },
    {
      id: 'ai_midjourney',
      label: 'Midjourney v6 Portrait',
      tag: 'SYNTHETIC',
      color: 'rose',
      icon: Sparkles,
    },
    {
      id: 'ai_sdxl',
      label: 'SDXL Diffusion Render',
      tag: 'SYNTHETIC',
      color: 'rose',
      icon: Zap,
    },
  ];

  const handleClick = async (presetId) => {
    if (disabled) return;
    const file = await createSampleCanvasImage(presetId);
    onSelectSample(file);
  };

  return (
    <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
          Quick-Load Preset Benchmarks
        </span>
        <span className="text-[10px] font-mono text-slate-500">1-Click Live Test Suite</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isReal = preset.color === 'emerald';
          return (
            <button
              key={preset.id}
              onClick={() => handleClick(preset.id)}
              disabled={disabled}
              className={`p-2.5 rounded-lg border text-left transition-all duration-200 group flex flex-col justify-between ${
                isReal
                  ? 'bg-[#161B22]/70 hover:bg-emerald-950/20 border-[#30363D] hover:border-emerald-500/40'
                  : 'bg-[#161B22]/70 hover:bg-rose-950/20 border-[#30363D] hover:border-rose-500/40'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${isReal ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  isReal
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {preset.tag}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
