'use client';

import React, { useMemo } from 'react';
import { Languages } from 'lucide-react';
import { useHomeSidebarData } from './HomeSidebarDataProvider';

export default function SpokenLanguagesCard({ className }: { className?: string }) {
  const { spokenLanguages } = useHomeSidebarData();

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
    <div className={['rounded-2xl border border-white/10 bg-black/30', className].filter(Boolean).join(' ')}>
      <div className="js-reveal flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <Languages className="h-4 w-4 text-[var(--home-accent)]" />
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Languages</p>
      </div>
      {spokenLanguages === null ? (
        <div className="js-reveal px-5 py-4 text-sm text-[var(--home-muted)]">Loading...</div>
      ) : sortedLanguages.length === 0 ? (
        <div className="js-reveal px-5 py-4 text-sm text-[var(--home-muted)]">No languages yet.</div>
      ) : (
        <div className="grid gap-3 p-5">
          {sortedLanguages.map((language) => {
            const level = Math.max(0, Math.min(language.level, 100));
            return (
              <div key={language.id} className="js-reveal rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3 text-xs text-[var(--home-muted)]">
                  <span className="truncate text-[var(--home-ink)]">{language.name}</span>
                  <span className="shrink-0 tabular-nums">
                    {language.label} • {level}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[var(--home-accent)]" style={{ width: `${level}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

