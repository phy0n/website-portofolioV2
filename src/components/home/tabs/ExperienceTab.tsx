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
        <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
          Roles that prioritize clean frontend execution, steady collaboration, and thoughtful user experience.
        </p>
      </div>

      {experiences === null ? (
        <p className="js-reveal text-sm text-[var(--home-muted)]">Memuat...</p>
      ) : experiences.length === 0 ? (
        <div className="js-reveal text-sm text-[var(--home-muted)]">Tidak Ada Data</div>
      ) : (
        <div className="space-y-10">
          {experiences.map((exp, index) => {
            const number = String(index + 1).padStart(2, '0');
            return (
              <div key={exp.id} className="js-reveal grid gap-x-4 gap-y-0 md:grid-cols-[auto_14px_1fr]">
                <div className="row-span-3 pt-1 text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">
                  {number}
                </div>

                <div className="relative flex items-center justify-center">
                  <span className="absolute inset-y-0 w-px bg-white/10" />
                  <span className="relative z-10 h-2.5 w-2.5 rounded-full bg-[var(--home-accent)]" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-sans font-semibold text-[var(--home-ink)]">{exp.role}</h3>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[var(--home-muted)]">
                    {exp.status}
                  </span>
                </div>

                <div className="relative flex items-center justify-center">
                  <span className="absolute inset-y-0 w-px bg-white/10" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--home-muted)]">
                  <Briefcase className="h-4 w-4" />
                  <span>{exp.company}</span>
                  <span>|</span>
                  <span>{exp.period}</span>
                </div>

                <div className="relative flex items-center justify-center">
                  <span className="absolute inset-y-0 w-px bg-white/10" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--home-muted)]">{exp.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
