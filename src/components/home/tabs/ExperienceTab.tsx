'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';

type ExperienceRow = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  status: string;
};

const normalizeExperience = (value: any): ExperienceRow | null => {
  const id = String(value?.id ?? '').trim();
  const role = String(value?.role ?? '').trim();
  const company = String(value?.company ?? '').trim();
  const period = String(value?.period ?? '').trim();
  const description = String(value?.description ?? '').trim();
  const status = String(value?.status ?? '').trim();

  if (!id || !role || !company || !period || !description || !status) return null;
  return { id, role, company, period, description, status };
};

export default function ExperienceTab() {
  const [experiences, setExperiences] = useState<ExperienceRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchExperiences = async () => {
      try {
        const res = await fetch('/api/experiences');
        const data = await res.json();
        const rows = Array.isArray(data?.experiences) ? (data.experiences as any[]) : null;
        const normalized = (rows ?? [])
          .map(normalizeExperience)
          .filter((row): row is ExperienceRow => Boolean(row));

        if (!cancelled) {
          setExperiences(normalized);
        }
      } catch (err) {
        console.error('Failed to fetch experiences:', err);
        if (!cancelled) {
          setExperiences([]);
        }
      }
    };

    fetchExperiences();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Experience</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Focused on community work
        </h2>
        <p className="js-reveal max-w-4xl text-sm sm:text-base md:text-lg leading-relaxed text-[var(--home-muted)]">
          Roles that prioritize clean delivery, steady collaboration, and thoughtful outcomes.
        </p>
      </div>

      {experiences === null ? (
        <p className="js-reveal text-sm text-[var(--home-muted)]">Loading...</p>
      ) : experiences.length === 0 ? (
        <div className="js-reveal text-sm text-[var(--home-muted)]">No data available</div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp, index) => {
            const number = String(index + 1).padStart(2, '0');
            return (
              <div
                key={exp.id}
                className="js-reveal group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)]/30 backdrop-blur-sm p-6 sm:p-8 transition-all duration-500 hover:border-[var(--home-border)] hover:bg-[var(--home-card)]/80">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--home-accent)]" />
                <div className="relative z-10 flex flex-col">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-bg)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--home-accent)]">
                        {exp.status}
                      </span>
                      <h3 className="text-xl font-sans font-bold text-[var(--home-ink)] !mb-0 leading-none">{exp.role}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--home-muted)]">
                      <Briefcase className="h-4 w-4 text-[var(--home-accent)]" />
                      <span className="text-[var(--home-ink)]">{exp.company}</span>
                      <span className="opacity-50">|</span>
                      <span>{exp.period}</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[var(--home-border)] pt-4">
                    <p className="text-sm leading-relaxed text-[var(--home-muted)] group-hover:text-[var(--home-ink)]/90 transition-colors duration-300">
                      {exp.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
