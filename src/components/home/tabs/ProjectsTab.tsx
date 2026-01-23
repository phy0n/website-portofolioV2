'use client';

import React from 'react';
import { Monitor } from 'lucide-react';

import type { Project } from '../types';

const PROJECTS: Project[] = [
  {
    title: 'Kh1ev Project',
    description: 'This is my kh1ev community website',
    tags: ['React', 'TailwindCSS', 'TypeScript'],
    link: 'https://kh1ev.my.id/',
    status: 'Live',
    icon: <Monitor className="h-4 w-4" />,
  },
];

export default function ProjectsTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Projects</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">Personal Project</h2>
        <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
          A focused set of projects with clean UI and stable delivery.
        </p>
      </div>

      <div className="divide-y divide-white/10 border-y border-white/10">
        {PROJECTS.map((project, index) => {
          const number = String(index + 1).padStart(2, '0');
          return (
            <a
              key={index}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="js-reveal group grid gap-4 py-6 md:grid-cols-[auto_1fr_auto]"
            >
              <div className="text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">{number}</div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--home-accent)]">{project.icon}</span>
                  <h3 className="text-lg font-sans font-semibold text-[var(--home-ink)]">{project.title}</h3>
                </div>
                <p className="text-sm text-[var(--home-muted)]">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[var(--home-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs uppercase tracking-[0.35em] text-[var(--home-muted)] transition group-hover:text-[var(--home-accent)]">
                {project.status}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
