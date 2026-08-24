import Image from 'next/image';
import React from 'react';

const PROFESSIONAL_TEXTS = [
  'SOFTWARE ENGINEERING',
  'SYSTEM ARCHITECTURE',
  'FULL-STACK DEVELOPMENT',
  'CLOUD INFRASTRUCTURE',
  'API DESIGN',
  'DATABASE OPTIMIZATION',
  'SECURITY RESEARCH',
  'PERFORMANCE TUNING'
];

export default function ToolsMarquee({ tools }: { tools: string[] }) {
  const duplicatedTools = [...tools, ...tools, ...tools, ...tools];

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[var(--home-bg)] to-transparent sm:w-40" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[var(--home-bg)] to-transparent sm:w-40" />
      <div
        className="relative flex w-max animate-marquee items-center gap-12 sm:gap-20 pr-12 sm:pr-20 gpu-accelerated will-change-transform"
        style={{ animationDuration: '180s' }}>
        {duplicatedTools.map((tool, idx) => {
          const name = tool.replace(/^[0-9]+/, '').replace('.png', '');
          const text = PROFESSIONAL_TEXTS[idx % PROFESSIONAL_TEXTS.length];
          const isHighlight = idx % 2 === 0;

          return (
            <React.Fragment key={`${tool}-${idx}`}>
              <div
                suppressHydrationWarning
                title={name}
                className="group relative flex h-20 w-20 items-center justify-center transition-all duration-300 sm:h-28 sm:w-28">
                <Image
                  src={`/image/tools_languange/${tool}`}
                  alt={name}
                  width={112}
                  height={112}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-125"
                />
              </div>
              <span
                className={`flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] sm:text-xs ${isHighlight ? 'text-[var(--home-ink)]' : 'text-[var(--home-muted)]'
                  }`}>
                {text}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
