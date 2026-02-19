'use client';

import BlogSidebarList, { type BlogSidebarItem } from '@/app/blog/BlogSidebarList';
import React, { useEffect, useMemo, useState } from 'react';
import { Award, BookOpen, GraduationCap, Languages, User } from 'lucide-react';

const FACTS = [
  { label: 'Name', value: 'Phion Rushandle' },
  { label: 'Pronouns', value: 'He/Him' },
  { label: 'Age', value: '18 years old' },
  { label: 'Role', value: 'Developer' },
  { label: 'Focus', value: 'Consistency' },
  { label: 'Passion', value: 'Make good things' },
  { label: 'Status', value: 'Learning' },
];

type SpokenLanguage = {
  id: string;
  name: string;
  label: string;
  level: number;
  sort_order?: number | null;
};

const normalizeLanguage = (value: any): SpokenLanguage | null => {
  const id = String(value?.id ?? '').trim();
  const name = String(value?.name ?? '').trim();
  const label = String(value?.label ?? '').trim();
  const level = typeof value?.level === 'number' && Number.isFinite(value.level) ? Math.trunc(value.level) : 0;
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? Math.trunc(value.sort_order) : null;

  if (!id || !name || !label) return null;
  return { id, name, label, level: Math.max(0, Math.min(level, 100)), sort_order };
};

const normalizeLatestBlog = (value: any): BlogSidebarItem | null => {
  const id = String(value?.id ?? '').trim();
  const slug = String(value?.slug ?? '').trim();
  const title = String(value?.title ?? '').trim();
  const date = String(value?.date ?? '').trim();
  const imageRaw = typeof value?.image === 'string' ? value.image : '';
  const image = imageRaw.trim() ? imageRaw.trim() : null;

  if (!id || !slug || !title || !date) return null;
  return { id, slug, title, date, image };
};

type EducationRow = {
  id: string;
  institution: string;
  degree: string;
  field?: string | null;
  period: string;
  location?: string | null;
  description?: string | null;
  highlights: string[];
  sort_order?: number | null;
};

const normalizeEducation = (value: any): EducationRow | null => {
  const id = String(value?.id ?? '').trim();
  const institution = String(value?.institution ?? '').trim();
  const degree = String(value?.degree ?? '').trim();
  const period = String(value?.period ?? '').trim();
  const fieldRaw = typeof value?.field === 'string' ? value.field : '';
  const locationRaw = typeof value?.location === 'string' ? value.location : '';
  const descriptionRaw = typeof value?.description === 'string' ? value.description : '';
  const field = fieldRaw.trim() ? fieldRaw.trim() : null;
  const location = locationRaw.trim() ? locationRaw.trim() : null;
  const description = descriptionRaw.trim() ? descriptionRaw.trim() : null;
  const highlights = Array.isArray(value?.highlights)
    ? (value.highlights as unknown[]).map((item) => String(item)).filter(Boolean)
    : [];
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? Math.trunc(value.sort_order) : null;

  if (!id || !institution || !degree || !period) return null;
  return { id, institution, degree, field, period, location, description, highlights, sort_order };
};

type CertificateRow = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  status: string;
  description: string;
  sort_order?: number | null;
};

const normalizeCertificate = (value: any): CertificateRow | null => {
  const id = String(value?.id ?? '').trim();
  const title = String(value?.title ?? '').trim();
  const issuer = String(value?.issuer ?? '').trim();
  const date = String(value?.date ?? '').trim();
  const status = String(value?.status ?? '').trim();
  const description = String(value?.description ?? '').trim();
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? Math.trunc(value.sort_order) : null;

  if (!id || !title || !issuer || !date || !status || !description) return null;
  return { id, title, issuer, date, status, description, sort_order };
};

export default function HomeRightSidebar() {
  const [spokenLanguages, setSpokenLanguages] = useState<SpokenLanguage[] | null>(null);
  const [education, setEducation] = useState<EducationRow[] | null>(null);
  const [certificates, setCertificates] = useState<CertificateRow[] | null>(null);
  const [latestBlogs, setLatestBlogs] = useState<BlogSidebarItem[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      await Promise.all([
        (async () => {
          try {
            const res = await fetch('/api/languages', { cache: 'no-store', signal: controller.signal });
            if (!res.ok) {
              setSpokenLanguages([]);
              return;
            }
            const data = (await res.json()) as { ok?: boolean; languages?: unknown };
            if (!data?.ok) {
              setSpokenLanguages([]);
              return;
            }
            const rows = Array.isArray(data.languages) ? data.languages : [];
            const normalized = rows.map(normalizeLanguage).filter((row): row is SpokenLanguage => Boolean(row));
            setSpokenLanguages(normalized);
          } catch (err) {
            const error = err as { name?: string };
            if (error?.name === 'AbortError') return;
            setSpokenLanguages([]);
          }
        })(),
        (async () => {
          try {
            const res = await fetch('/api/education', { cache: 'no-store', signal: controller.signal });
            if (!res.ok) {
              setEducation([]);
              return;
            }
            const data = (await res.json()) as { education?: unknown };
            const rows = Array.isArray(data?.education) ? data.education : [];
            const normalized = rows.map(normalizeEducation).filter((row): row is EducationRow => Boolean(row));
            setEducation(normalized);
          } catch (err) {
            const error = err as { name?: string };
            if (error?.name === 'AbortError') return;
            setEducation([]);
          }
        })(),
        (async () => {
          try {
            const res = await fetch('/api/certificates', { cache: 'no-store', signal: controller.signal });
            if (!res.ok) {
              setCertificates([]);
              return;
            }
            const data = (await res.json()) as { certificates?: unknown };
            const rows = Array.isArray(data?.certificates) ? data.certificates : [];
            const normalized = rows
              .map(normalizeCertificate)
              .filter((row): row is CertificateRow => Boolean(row));
            setCertificates(normalized);
          } catch (err) {
            const error = err as { name?: string };
            if (error?.name === 'AbortError') return;
            setCertificates([]);
          }
        })(),
        (async () => {
          try {
            const res = await fetch('/api/latest-blogs', { cache: 'no-store', signal: controller.signal });
            if (!res.ok) {
              setLatestBlogs([]);
              return;
            }
            const data = (await res.json()) as { blogs?: unknown };
            const rows = Array.isArray(data?.blogs) ? data.blogs : [];
            const normalized = rows.map(normalizeLatestBlog).filter((row): row is BlogSidebarItem => Boolean(row));
            setLatestBlogs(normalized);
          } catch (err) {
            const error = err as { name?: string };
            if (error?.name === 'AbortError') return;
            setLatestBlogs([]);
          }
        })(),
      ]);
    };

    void load();
    return () => controller.abort();
  }, []);

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

  const sortedCertificates = useMemo(() => {
    const rows = certificates ?? [];
    if (rows.length <= 1) return rows;
    return rows.slice().sort((a, b) => {
      const orderA = typeof a.sort_order === 'number' ? a.sort_order : 0;
      const orderB = typeof b.sort_order === 'number' ? b.sort_order : 0;
      if (orderA !== orderB) return orderB - orderA;
      return a.date.localeCompare(b.date);
    });
  }, [certificates]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/30">
        <div className="js-reveal flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <User className="h-4 w-4 text-[var(--home-accent)]" />
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Profile</p>
        </div>
        <div className="divide-y divide-white/10">
          {FACTS.map((fact) => (
            <div
              key={fact.label}
              className="js-reveal flex flex-col gap-1 px-5 py-4 text-sm text-[var(--home-muted)] sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-[11px] uppercase tracking-[0.35em]">{fact.label}</span>
              <span className="text-[var(--home-ink)]">{fact.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30">
        <div className="js-reveal flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <Languages className="h-4 w-4 text-[var(--home-accent)]" />
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Languages</p>
        </div>
        {spokenLanguages === null ? (
          <div className="js-reveal px-5 py-4 text-sm text-[var(--home-muted)]">Loading...</div>
        ) : sortedLanguages.length === 0 ? (
          <div className="js-reveal px-5 py-4 text-sm text-[var(--home-muted)]">No languages yet.</div>
        ) : (
          <div className="grid gap-3 p-5">
            {sortedLanguages.map((language) => {
              const level = Math.max(0, Math.min(language.level, 100));
              return (
                <div key={language.id} className="js-reveal rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3 text-xs text-[var(--home-muted)]">
                    <span className="truncate text-[var(--home-ink)]">{language.name}</span>
                    <span className="shrink-0 tabular-nums">
                      {language.label} • {level}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[var(--home-accent)]" style={{ width: `${level}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div id="education" className="scroll-mt-24 rounded-2xl border border-white/10 bg-black/30">
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

      <div id="certificates" className="scroll-mt-24 rounded-2xl border border-white/10 bg-black/30">
        <div className="js-reveal flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <Award className="h-4 w-4 text-[var(--home-accent)]" />
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Certificates</p>
        </div>
        {certificates === null ? (
          <div className="js-reveal px-5 py-4 text-sm text-[var(--home-muted)]">Loading...</div>
        ) : sortedCertificates.length === 0 ? (
          <div className="js-reveal px-5 py-4 text-sm text-[var(--home-muted)]">No certificates yet.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {sortedCertificates.map((cert) => (
              <div key={cert.id} className="js-reveal space-y-2 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--home-ink)]">{cert.title}</p>
                    <p className="mt-1 text-xs text-white/60">
                      {cert.issuer} • {cert.date}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">
                    {cert.status}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--home-muted)]">{cert.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="js-reveal flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[var(--home-accent)]" />
            <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Latest Posts</p>
          </div>
          <span className="text-xs tabular-nums text-[var(--home-muted)]">{latestBlogs?.length ?? 0}</span>
        </div>

        {latestBlogs === null ? (
          <div className="js-reveal mt-4 text-sm text-[var(--home-muted)]">Loading...</div>
        ) : latestBlogs.length === 0 ? (
          <div className="js-reveal mt-4 text-sm text-[var(--home-muted)]">No posts yet.</div>
        ) : (
          <BlogSidebarList blogs={latestBlogs} />
        )}
      </div>
    </div>
  );
}
