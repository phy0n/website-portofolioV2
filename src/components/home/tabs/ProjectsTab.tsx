'use client';

import React, { useEffect, useState } from 'react';
import { Code, Cpu, Database, Globe, Monitor, Server, Smartphone } from 'lucide-react';

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  status: string;
  icon?: string | null;
};

const normalizeProject = (value: any): ProjectRow | null => {
  const id = String(value?.id ?? '').trim();
  const title = String(value?.title ?? '').trim();
  const description = String(value?.description ?? '').trim();
  const link = String(value?.link ?? '').trim();
  const status = String(value?.status ?? '').trim();
  const iconRaw = typeof value?.icon === 'string' ? value.icon : '';
  const icon = iconRaw.trim() ? iconRaw.trim() : null;
  const tags = Array.isArray(value?.tags) ? (value.tags as unknown[]).map((t) => String(t)) : [];

  if (!id || !title || !description || !link || !status) return null;
  return { id, title, description, tags, link, status, icon };
};

const renderProjectIcon = (icon?: string | null) => {
  switch (icon) {
    case 'Globe':
      return <Globe className="h-4 w-4" />;
    case 'Smartphone':
      return <Smartphone className="h-4 w-4" />;
    case 'Code':
      return <Code className="h-4 w-4" />;
    case 'Database':
      return <Database className="h-4 w-4" />;
    case 'Server':
      return <Server className="h-4 w-4" />;
    case 'Cpu':
      return <Cpu className="h-4 w-4" />;
    case 'Monitor':
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

export default function ProjectsTab() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        const rows = Array.isArray(data?.projects) ? (data.projects as any[]) : null;
        const normalized = (rows ?? [])
          .map(normalizeProject)
          .filter((row): row is ProjectRow => Boolean(row));

        if (!cancelled) {
          setProjects(normalized);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        if (!cancelled) {
          setProjects([]);
        }
      }
    };

    fetchProjects();

    return () => {
      cancelled = true;
    };
  }, []);

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
        {projects === null ? (
          <div className="js-reveal py-6 text-sm text-[var(--home-muted)]">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="js-reveal py-6 text-sm text-[var(--home-muted)]">No data available</div>
        ) : (
          projects.map((project, index) => {
            const number = String(index + 1).padStart(2, '0');
            return (
              <a
                key={project.id}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
              className="js-reveal group grid gap-4 py-6 md:grid-cols-[auto_1fr_auto]"
            >
              <div className="pt-2 text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">{number}</div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--home-accent)]">{renderProjectIcon(project.icon)}</span>
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
          })
        )}
      </div>
    </div>
  );
}
