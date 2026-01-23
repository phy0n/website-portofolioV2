'use client';

import React from 'react';
import { Briefcase } from 'lucide-react';

import type { Experience } from '../types';

const EXPERIENCES: Experience[] = [
  {
    role: 'Website Developer',
    company: 'Kh1ev Community',
    period: '2024 - now',
    description:
      'Working on the official website for Kh1ev Community, focusing on frontend development and user experience design.',
    status: 'Current',
  },
];

export default function ExperienceTab() {
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

      <div className="relative border-l border-white/10 pl-6">
        {EXPERIENCES.map((exp, index) => (
          <div key={index} className="js-reveal relative pb-8">
            <span className="absolute -left-3 top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--home-accent)]" />
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-sans font-semibold text-[var(--home-ink)]">{exp.role}</h3>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[var(--home-muted)]">
                {exp.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--home-muted)]">
              <Briefcase className="h-4 w-4" />
              <span>{exp.company}</span>
              <span>|</span>
              <span>{exp.period}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--home-muted)]">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
