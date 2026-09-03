import React from 'react';
import { Camera, Sparkles, Image as ImageIcon, Zap, Bot, Layers } from 'lucide-react';

function createSampleCanvasImage(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  if (type === 'real_nature') {
    // Natural continuous gradient with multi-scale optical textures
    const grad = ctx.createRadialGradient(192, 192, 10, 192, 192, 220);
    grad.addColorStop(0, '#5C7E6C');
    grad.addColorStop(0.4, '#2F4858');
    grad.addColorStop(1, '#1A2634');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 384, 384);

    // Natural organic wave curves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc(192 + Math.sin(i * 0.4) * 70, 192 + Math.cos(i * 0.4) * 70, 30 + i * 7, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (type === 'real_dslr') {
    // Real portrait studio exposure
    const grad = ctx.createLinearGradient(0, 0, 384, 384);
    grad.addColorStop(0, '#DE9B72');
    grad.addColorStop(0.5, '#723B44');
    grad.addColorStop(1, '#1C1520');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 384, 384);

    ctx.fillStyle = 'rgba(255, 235, 210, 0.35)';
    ctx.beginPath();
    ctx.arc(160, 160, 95, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'ai_dalle3') {
    // DALL-E 3 / ChatGPT latent diffusion lattice pattern
    ctx.fillStyle = '#0B132B';
    ctx.fillRect(0, 0, 384, 384);

    // Periodic high-frequency deconvolution grid artifacts
    for (let x = 0; x < 384; x += 12) {
      for (let y = 0; y < 384; y += 12) {
        const val = ((x ^ y) % 20) * 9;
        ctx.fillStyle = `rgb(${val + 50}, ${val + 15}, ${val + 90})`;
        ctx.fillRect(x, y, 6, 6);
      }
    }
    const grad = ctx.createRadialGradient(192, 192, 10, 192, 192, 150);
    grad.addColorStop(0, 'rgba(244, 63, 94, 0.7)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 384, 384);
  } else if (type === 'ai_gemini') {
    // Gemini Imagen 3 VAE latent grid pattern
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 384, 384);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 384; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(384 - i, 384);
      ctx.stroke();
    }
    const grad = ctx.createRadialGradient(192, 192, 10, 192, 192, 130);
    grad.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
    grad.addColorStop(1, 'rgba(244, 63, 94, 0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 384, 384);
  } else if (type === 'ai_midjourney') {
    // Midjourney v6 high-contrast synth render
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 384, 384);

    for (let x = 0; x < 384; x += 8) {
      for (let y = 0; y < 384; y += 8) {
        if ((x + y) % 16 === 0) {
          ctx.fillStyle = 'rgba(255, 100, 150, 0.4)';
          ctx.fillRect(x, y, 4, 4);
        }
      }
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
      label: 'DSLR RAW Studio',
      provider: 'Canon EOS R5',
      tag: 'AUTHENTIC',
      color: 'emerald',
      icon: Camera,
    },
    {
      id: 'real_nature',
      label: 'Natural Landscape',
      provider: 'Optical Sensor',
      tag: 'AUTHENTIC',
      color: 'emerald',
      icon: ImageIcon,
    },
    {
      id: 'ai_dalle3',
      label: 'ChatGPT DALL-E 3',
      provider: 'OpenAI LDM',
      tag: 'SYNTHETIC',
      color: 'rose',
      icon: Bot,
    },
    {
      id: 'ai_gemini',
      label: 'Gemini Imagen 3',
      provider: 'Google DeepMind',
      tag: 'SYNTHETIC',
      color: 'rose',
      icon: Sparkles,
    },
    {
      id: 'ai_midjourney',
      label: 'Midjourney v6',
      provider: 'Diffusion Latent',
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
    <div className="glass-panel rounded-2xl p-4.5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            1-Click Benchmark Presets
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
          INSTANT TEST SUITE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isReal = preset.color === 'emerald';
          return (
            <button
              key={preset.id}
              onClick={() => handleClick(preset.id)}
              disabled={disabled}
              className={`p-3 rounded-xl border text-left transition-all duration-200 group flex flex-col justify-between ${
                isReal
                  ? 'bg-space-950/60 hover:bg-emerald-950/20 border-white/[0.08] hover:border-emerald-500/40 hover:shadow-glow-emerald'
                  : 'bg-space-950/60 hover:bg-rose-950/20 border-white/[0.08] hover:border-rose-500/40 hover:shadow-glow-rose'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${isReal ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  isReal
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {preset.tag}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 block truncate">
                  {preset.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block truncate mt-0.5">
                  {preset.provider}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
