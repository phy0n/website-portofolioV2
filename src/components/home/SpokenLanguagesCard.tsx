'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useHomeSidebarData } from './HomeSidebarDataProvider';
import { MessageCircle, Globe2, Sparkles } from 'lucide-react';

export default function SpokenLanguagesCard({ className }: { className?: string }) {
  const { spokenLanguages } = useHomeSidebarData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sortedLanguages = useMemo(() => {
    const languages = spokenLanguages ?? [];
    if (languages.length <= 1) return languages;
    return languages.slice().sort((a, b) => {
      const orderA = typeof a.sort_order === 'number' ? a.sort_order : 0;
      const orderB = typeof b.sort_order === 'number' ? b.sort_order : 0;
      if (orderA !== orderB) return orderB - orderA;
      return a.name.localeCompare(b.name);
    });
  }, [spokenLanguages]);

  return (
    <section className={className}>
      {spokenLanguages === null ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)] animate-pulse">
          <div className="h-4 w-4 rounded-full border-2 border-[var(--muted)] border-t-transparent animate-spin"></div>
          Loading languages...
        </div>
      ) : sortedLanguages.length === 0 ? (
        <div className="mt-3 text-sm text-[var(--muted)] flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          No languages yet.
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 max-w-4xl">
          {sortedLanguages.map((language, i) => {
            const level = Math.max(0, Math.min(language.level, 100));
            // Calculate a delay for a stagger effect
            const delay = `${i * 150}ms`;

            return (
              <div 
                key={language.id} 
                className="group relative overflow-hidden rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] p-5 transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--home-soft)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                  transitionDelay: mounted ? delay : '0ms'
                }}
              >
                {/* Subtle Background Glow */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-500/10 blur-2xl transition-all duration-500 group-hover:bg-red-500/20 group-hover:scale-150" />

                <div className="relative z-10 flex flex-col gap-4">
                  {/* Header: Icon, Name, Label */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--home-soft)] border border-[var(--home-border)] text-[var(--home-ink)] transition-colors duration-300 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--home-bg)] shadow-sm">
                        <Globe2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--ui-foreground)]">{language.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Sparkles className="h-3 w-3 text-[var(--accent)]" />
                          <span className="text-xs font-medium text-[var(--muted)]">{language.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex h-7 items-center justify-center rounded-full bg-[var(--home-soft)] px-2.5 border border-[var(--home-border)]">
                      <span className="text-xs font-bold text-[var(--ui-foreground)]">{level}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative mt-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--home-soft)] border border-[var(--home-border)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] shadow-[0_0_10px_rgba(209,74,74,0.35)] transition-all duration-1000 ease-out relative"
                        style={{ width: mounted ? `${level}%` : '0%' }}
                      >
                         <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
