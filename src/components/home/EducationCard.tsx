'use client';

import React, { useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import { useHomeSidebarData } from './HomeSidebarDataProvider';

export default function EducationCard({ className, id }: { className?: string; id?: string }) {
  const { education } = useHomeSidebarData();

  const sortedEducation = useMemo(() => {
    const rows = education ?? [];
    if (rows.length <= 1) return rows;
    return rows.slice().sort((a, b) => {
      const orderA = typeof a.sort_order === 'number' ? a.sort_order : 0;
      const orderB = typeof b.sort_order === 'number' ? b.sort_order : 0;
      if (orderA !== orderB) return orderB - orderA;
      return a.period.localeCompare(b.period);
    });
  }, [education]);

  return (
    <div
      id={id}
      className={['scroll-mt-24 rounded-2xl border border-white/10 bg-black/30', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="js-reveal flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <GraduationCap className="h-4 w-4 text-[var(--home-accent)]" />
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Education</p>
      </div>
      {education === null ? (
        <div className="js-reveal px-5 py-4 text-sm text-[var(--home-muted)]">Loading...</div>
      ) : sortedEducation.length === 0 ? (
        <div className="js-reveal px-5 py-4 text-sm text-[var(--home-muted)]">No education yet.</div>
      ) : (
        <div className="divide-y divide-white/10">
          {sortedEducation.map((row) => {
            const meta = [row.institution, row.location].filter(Boolean).join(' • ');
            return (
              <div key={row.id} className="js-reveal space-y-2 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--home-ink)]">{row.degree}</p>
                  <span className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">
                    {row.period}
                  </span>
                </div>
                {row.field ? <p className="text-sm text-[var(--home-muted)]">{row.field}</p> : null}
                {meta ? <p className="text-xs text-white/60">{meta}</p> : null}
                {row.description ? <p className="text-sm text-[var(--home-muted)]">{row.description}</p> : null}
                {row.highlights.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {row.highlights.slice(0, 3).map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
