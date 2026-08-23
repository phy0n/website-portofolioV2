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
                className="relative overflow-hidden rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] p-5 transition-all duration-300"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                  transitionDelay: mounted ? delay : '0ms'
                }}
              >
                {/* Removed red blur gradient */}
                <div className="relative z-10 flex flex-col gap-4">
                  {/* Header: Name, Label */}
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--ui-foreground)]">{language.name}</h3>
                      <span className="mt-1 block text-xs font-medium text-[var(--muted)]">{language.label}</span>
                    </div>
                    <div className="flex h-7 items-center justify-center rounded-full bg-[var(--home-soft)] px-2.5 border border-[var(--home-border)]">
                      <span className="text-xs font-bold text-[var(--ui-foreground)]">{level}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative mt-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--home-soft)] border border-[var(--home-border)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-1000 ease-out"
                        style={{ width: mounted ? `${level}%` : '0%' }}
                      />
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
