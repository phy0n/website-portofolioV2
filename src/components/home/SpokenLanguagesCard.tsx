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
    <section className={className}>
      <div className="flex items-center gap-2">
        <Languages className="h-4 w-4 text-[var(--accent)]" />
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--muted)]">Languages</p>
      </div>

      {spokenLanguages === null ? (
        <div className="mt-3 text-sm text-[var(--muted)]">Loading...</div>
      ) : sortedLanguages.length === 0 ? (
        <div className="mt-3 text-sm text-[var(--muted)]">No languages yet.</div>
      ) : (
        <div className="mt-3 space-y-3">
          {sortedLanguages.map((language) => {
            const level = Math.max(0, Math.min(language.level, 100));
            return (
              <div key={language.id} className="text-sm">
                <div className="flex items-start justify-between gap-3 text-xs text-[var(--muted)]">
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-[var(--ui-foreground)]">{language.name}</span>
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
                      role="progressbar"
                      aria-label={`${language.name} proficiency`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={level}
                    >
                      <div
                        className="h-full rounded-full bg-[var(--accent)] shadow-[0_0_10px_rgba(209,74,74,0.35)]"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 tabular-nums">{language.label} • {level}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
