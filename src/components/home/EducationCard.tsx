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
    <section id={id} className={['scroll-mt-24', className].filter(Boolean).join(' ')}>
      <div className="flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-[var(--accent)]" />
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--muted)]">Education</p>
      </div>

      {education === null ? (
        <div className="mt-3 text-sm text-[var(--muted)]">Loading...</div>
      ) : sortedEducation.length === 0 ? (
        <div className="mt-3 text-sm text-[var(--muted)]">No education yet.</div>
      ) : (
        <div className="mt-3 space-y-4">
          {sortedEducation.map((row) => {
            const meta = [row.institution, row.location].filter(Boolean).join(' • ');
            return (
              <div key={row.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--ui-foreground)]">{row.degree}</p>
                  <span className="text-xs text-[var(--muted)]">{row.period}</span>
                </div>
                {row.field ? <p className="text-sm text-[var(--muted)]">{row.field}</p> : null}
                {meta ? <p className="text-xs text-[var(--muted)]">{meta}</p> : null}
                {row.description ? <p className="text-sm text-[var(--muted)]">{row.description}</p> : null}
                {row.highlights.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {row.highlights.slice(0, 3).map((highlight) => (
                      <span key={highlight} className="text-xs text-[var(--muted)]">{highlight}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
