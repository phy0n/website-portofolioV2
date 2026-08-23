'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BookOpen, Github, Code, Cpu, Database, Globe, Monitor, Server, Smartphone } from 'lucide-react';

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  stack: string[];
  highlights: string[];
  link: string;
  github_url?: string | null;
  image?: string | null;
  status: string;
  icon?: string | null;
  is_featured?: boolean | null;
  sort_order?: number | null;
};

const normalizeProject = (value: any): ProjectRow | null => {
  const id = String(value?.id ?? '').trim();
  const title = String(value?.title ?? '').trim();
  const description = String(value?.description ?? '').trim();
  const link = String(value?.link ?? '').trim();
  const status = String(value?.status ?? '').trim();
  const iconRaw = typeof value?.icon === 'string' ? value.icon : '';
  const icon = iconRaw.trim() ? iconRaw.trim() : null;
  const tags = Array.isArray(value?.tags) ? (value.tags as unknown[]).map((t) => String(t)).filter(Boolean) : [];
  const stack = Array.isArray(value?.stack) ? (value.stack as unknown[]).map((t) => String(t)).filter(Boolean) : [];
  const highlights = Array.isArray(value?.highlights)
    ? (value.highlights as unknown[]).map((t) => String(t)).filter(Boolean)
    : [];
  const githubRaw = typeof value?.github_url === 'string' ? value.github_url : '';
  const github_url = githubRaw.trim() ? githubRaw.trim() : null;
  const imageRaw = typeof value?.image === 'string' ? value.image : '';
  const image = imageRaw.trim() ? imageRaw.trim() : null;
  const is_featured = typeof value?.is_featured === 'boolean' ? value.is_featured : null;
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? value.sort_order : null;

  if (!id || !title || !description || !link || !status) return null;
  return { id, title, description, tags, stack, highlights, link, github_url, image, status, icon, is_featured, sort_order };
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

type CaseStudyRow = {
  slug: string;
  projectId: string;
};

const normalizeCaseStudy = (value: any): CaseStudyRow | null => {
  const slug = String(value?.slug ?? '').trim();
  const projectId = String(value?.project?.id ?? '').trim();
  if (!slug || !projectId) return null;
  return { slug, projectId };
};

const isLocalImageSrc = (value: string | null | undefined) => Boolean(value && value.trim().startsWith('/'));

export default function ProjectsTab() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [caseStudies, setCaseStudies] = useState<CaseStudyRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [projectsRes, caseStudiesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/case-studies'),
        ]);

        const projectsData = await projectsRes.json().catch(() => null);
        const caseStudiesData = await caseStudiesRes.json().catch(() => null);

        const projectRows = Array.isArray(projectsData?.projects) ? (projectsData.projects as any[]) : [];
        const normalizedProjects = projectRows
          .map(normalizeProject)
          .filter((row): row is ProjectRow => Boolean(row));

        const caseRows = Array.isArray(caseStudiesData?.caseStudies) ? (caseStudiesData.caseStudies as any[]) : [];
        const normalizedCaseStudies = caseRows
          .map(normalizeCaseStudy)
          .filter((row): row is CaseStudyRow => Boolean(row));

        if (!cancelled) {
          setProjects(normalizedProjects);
          setCaseStudies(normalizedCaseStudies);
        }
      } catch (err) {
        console.error('Failed to fetch projects data:', err);
        if (!cancelled) {
          setProjects([]);
          setCaseStudies([]);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const caseStudyByProjectId = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of caseStudies ?? []) {
      map.set(row.projectId, row.slug);
    }
    return map;
  }, [caseStudies]);

  const featuredProjects = useMemo(() => {
    const all = projects ?? [];
    const picked = all.filter((project) => project.is_featured).slice(0, 2);
    return picked.length > 0 ? picked : all.slice(0, 2);
  }, [projects]);

  const otherProjects = useMemo(() => {
    const featuredIds = new Set(featuredProjects.map((project) => project.id));
    return (projects ?? []).filter((project) => !featuredIds.has(project.id));
  }, [projects, featuredProjects]);

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Projects</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">Personal Project</h2>
        <p className="js-reveal max-w-4xl text-sm sm:text-base md:text-lg leading-relaxed text-[var(--home-muted)]">
          A focused set of projects with clear details and stable delivery.
        </p>
      </div>

      <div className="space-y-4">
        <div className="js-reveal flex items-center justify-between gap-3 border-t border-[var(--home-border)] pt-4">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Featured</p>
          <span className="text-xs text-[var(--home-muted)]">Top picks</span>
        </div>

        {projects === null ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="h-56 rounded-3xl border border-[var(--home-border)] bg-[var(--home-soft)] animate-pulse" />
            ))}
          </div>
        ) : featuredProjects.length === 0 ? (
          <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)]/30 backdrop-blur-sm p-6">
            <p className="text-sm font-semibold text-[var(--home-ink)]">No projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {featuredProjects.map((project) => {
              const caseSlug = caseStudyByProjectId.get(project.id) ?? null;
              const chips = project.stack.length > 0 ? project.stack : project.tags;
              const imageOk = isLocalImageSrc(project.image ?? null);

              return (
                <div
                  key={project.id}
                  className="group overflow-hidden rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)]/30 backdrop-blur-sm shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-[var(--home-accent)]/50 hover:bg-[var(--home-card)]/80">
                  <div className="relative h-36 w-full border-b border-[var(--home-border)] bg-[var(--home-soft)]">
                    {imageOk ? (
                      <Image
                        src={project.image as string}
                        alt={`${project.title} preview`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-[var(--home-ink)] opacity-40">
                        {renderProjectIcon(project.icon)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">{project.status}</p>
                        <h3 className="mt-2 truncate text-base font-sans font-semibold text-[var(--home-ink)]">
                          {project.title}
                        </h3>
                      </div>
                      <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--home-muted)]">
                        Featured
                      </span>
                    </div>

                    <p className="line-clamp-2 text-sm text-[var(--home-muted)]">{project.description}</p>

                    {chips.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {chips.slice(0, 5).map((chip) => (
                          <span
                            key={chip}
                            className="rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-1 text-[11px] text-[var(--home-muted)]">
                            {chip}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--home-muted)] transition hover:border-[var(--home-ink)] hover:bg-[var(--home-card)] hover:text-[var(--home-ink)]"
                        aria-label={`Open ${project.title}`}>
                        Live
                        <ArrowUpRight className="h-4 w-4" />
                      </a>

                      {project.github_url ? (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--home-ink)] opacity-70 transition hover:border-[var(--home-border)] hover:bg-[var(--home-soft)] hover:text-[var(--home-ink)]"
                          aria-label={`Open ${project.title} repository`}>
                          <Github className="h-4 w-4" />
                          Repo
                        </a>
                      ) : null}

                      {caseSlug ? (
                        <Link
                          href={`/projects/${encodeURIComponent(caseSlug)}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--home-ink)] opacity-70 transition hover:border-[var(--home-border)] hover:bg-[var(--home-soft)] hover:text-[var(--home-ink)]"
                          aria-label={`Open case study for ${project.title}`}>
                          <BookOpen className="h-4 w-4" />
                          Case
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {projects === null ? (
          <div className="space-y-3 py-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-24 rounded-xl border border-[var(--home-border)] bg-[var(--home-soft)] animate-pulse" />
            ))}
          </div>
        ) : otherProjects.length === 0 ? null : (
          otherProjects.map((project, index) => {
            const caseSlug = caseStudyByProjectId.get(project.id) ?? null;
            const chips = project.stack.length > 0 ? project.stack : project.tags;

            return (
              <div
                key={project.id}
                className="js-reveal group relative flex flex-col overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card)]/30 backdrop-blur-sm p-6 sm:p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--home-accent)]/50 hover:bg-[var(--home-card)]/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">

                {/* Tech Top Highlight */}
                <div className="absolute left-0 right-0 top-0 h-1 bg-[var(--home-border)] transition-colors duration-500 group-hover:bg-[var(--home-accent)]" />

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#111] border border-[var(--home-border)] text-[var(--home-muted)] group-hover:text-[var(--home-accent)] transition-colors duration-300">
                      {renderProjectIcon(project.icon)}
                    </div>
                    <h3 className="text-xl font-sans font-bold text-[var(--home-ink)] leading-tight">{project.title}</h3>
                  </div>
                  <span className="shrink-0 rounded-md border border-[var(--home-border)] bg-[#111] px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--home-accent)] self-start sm:self-auto">
                    {project.status}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-[var(--home-muted)] group-hover:text-[var(--home-ink)]/90 transition-colors duration-300">
                  {project.description}
                </p>

                {project.highlights.length > 0 ? (
                  <ul className="space-y-2 text-xs text-[var(--home-muted)] mt-4">
                    {project.highlights.slice(0, 2).map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2">
                        <span className="mt-1 h-1 w-1 shrink-0 bg-[var(--home-accent)]" aria-hidden="true" />
                        <span className="leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {chips.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {chips.slice(0, 6).map((chip) => (
                      <span
                        key={chip}
                        className="rounded border border-[var(--home-border)] bg-[#111] px-2 py-1 text-[10px] font-mono text-[var(--home-muted)]">
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 mt-5 border-t border-[var(--home-border)] pt-5">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded bg-[#111] border border-[var(--home-border)] px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--home-muted)] transition hover:border-[var(--home-accent)] hover:text-[var(--home-accent)]"
                    aria-label={`Open ${project.title}`}>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Live
                  </a>

                  {project.github_url ? (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded bg-transparent border border-[var(--home-border)] px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--home-muted)] transition hover:border-[var(--home-ink)] hover:text-[var(--home-ink)]"
                      aria-label={`Open ${project.title} repository`}>
                      <Github className="h-3.5 w-3.5" />
                      Repo
                    </a>
                  ) : null}

                  {caseSlug ? (
                    <Link
                      href={`/projects/${encodeURIComponent(caseSlug)}`}
                      className="inline-flex items-center gap-2 rounded bg-transparent border border-[var(--home-border)] px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--home-muted)] transition hover:border-[var(--home-ink)] hover:text-[var(--home-ink)]"
                      aria-label={`Open case study for ${project.title}`}>
                      <BookOpen className="h-3.5 w-3.5" />
                      Case
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
