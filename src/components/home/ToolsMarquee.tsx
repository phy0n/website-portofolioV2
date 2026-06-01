import Image from 'next/image';
import React from 'react';

const LANYARD_TEXTS = ['TOOLS & TECH', 'EXPERTISE', 'SKILLS', 'LANGUAGES', 'DEV', 'WORKFLOW'];

export default function ToolsMarquee({ tools }: { tools: string[] }) {
  const duplicatedTools = [...tools, ...tools, ...tools];

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-6 sm:py-10">
      
      {/* Lanyard Background Ribbon */}
      <div className="absolute inset-x-0 top-1/2 h-12 w-full -translate-y-1/2 bg-[var(--home-soft)] sm:h-16" />
      
      {/* Top horizontal lines */}
      <div className="absolute inset-x-0 top-1/2 h-12 w-full -translate-y-1/2 border-t-2 border-black/20 dark:border-white/60 sm:h-16" />
      <div className="absolute inset-x-0 top-1/2 mt-1.5 h-12 w-full -translate-y-1/2 border-t border-black/10 dark:border-white/20 sm:h-16 sm:mt-2" />

      {/* Bottom horizontal lines */}
      <div className="absolute inset-x-0 top-1/2 h-12 w-full -translate-y-1/2 border-b-2 border-black/20 dark:border-white/60 sm:h-16" />
      <div className="absolute inset-x-0 top-1/2 mb-1.5 h-12 w-full -translate-y-1/2 border-b border-black/10 dark:border-white/20 sm:h-16 sm:mb-2" />

      {/* Edge Fades */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[var(--home-bg)] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[var(--home-bg)] to-transparent" />

      {/* Marquee Track */}
      <div className="relative flex w-max animate-marquee items-center gap-10 sm:gap-14">
        {duplicatedTools.map((tool, idx) => {
          const name = tool.replace(/^[0-9]+/, '').replace('.png', '');
          const text = LANYARD_TEXTS[idx % LANYARD_TEXTS.length];
          const isWhiteText = idx % 2 === 0;

          return (
            <React.Fragment key={`${tool}-${idx}`}>
              <div
                title={name}
                className="group relative flex h-16 w-16 items-center justify-center transition-all duration-300 sm:h-24 sm:w-24">
                <Image
                  src={`/image/tools_languange/${tool}`}
                  alt={name}
                  width={96}
                  height={96}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-125"
                  style={{ filter: 'var(--lanyard-shadow)' }}
                />
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.3em] sm:text-sm ${
                  isWhiteText ? 'text-[var(--home-ink)]' : 'text-[var(--home-muted)] opacity-80'
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
