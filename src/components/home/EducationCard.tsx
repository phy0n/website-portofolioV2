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
      {education === null ? (
        <div className="mt-3 text-sm text-[var(--muted)]">Loading...</div>
      ) : sortedEducation.length === 0 ? (
        <div className="mt-3 text-sm text-[var(--muted)]">No education yet.</div>
      ) : (
        <div className="mt-2 space-y-10">
          {sortedEducation.map((row, index) => {
            const meta = [row.institution, row.location].filter(Boolean).join(' • ');
            const number = String(index + 1).padStart(2, '0');
            return (
              <div key={row.id} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0 md:grid-cols-[auto_14px_1fr]">
                <div className="row-span-4 pt-1.5 text-xs uppercase tracking-[0.35em] text-[var(--muted)] opacity-70">
                  {number}
                </div>
                
                <div className="relative hidden items-center justify-center md:flex">
                  <span className="absolute inset-y-0 w-px bg-[var(--home-soft)]" />
                  <span className="relative z-10 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <span className="md:hidden h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  <h3 className="text-lg font-sans font-semibold text-[var(--ui-foreground)] !mb-0 leading-none">{row.degree}</h3>
                  <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-1 text-xs text-[var(--muted)]">
                    {row.period}
                  </span>
                </div>

                <div className="relative hidden items-center justify-center md:flex">
                  <span className="absolute inset-y-0 w-px bg-[var(--home-soft)]" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                  <GraduationCap className="h-4 w-4" />
                  <span>{meta}</span>
                  {row.field ? (
                    <>
                      <span>|</span>
                      <span>{row.field}</span>
                    </>
                  ) : null}
                </div>

                <div className="relative hidden items-center justify-center md:flex">
                  <span className="absolute inset-y-0 w-px bg-[var(--home-soft)]" />
                </div>
                {row.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{row.description}</p>
                ) : <div />}

                {row.highlights.length > 0 ? (
                  <>
                    <div className="relative hidden items-center justify-center md:flex">
                      <span className="absolute inset-y-0 w-px bg-[var(--home-soft)]" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {row.highlights.map((highlight) => (
                        <span key={highlight} className="rounded-md bg-[var(--home-soft)] px-2 py-1 text-xs text-[var(--muted)] ring-1 ring-white/5">{highlight}</span>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
