'use client';

import type { BlogSidebarItem } from '@/app/blog/BlogSidebarList';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

type HomeSidebarData = {
  spokenLanguages: SpokenLanguage[] | null;
  education: EducationRow[] | null;
  latestBlogs: BlogSidebarItem[] | null;
};

const HomeSidebarDataContext = createContext<HomeSidebarData | null>(null);

export function HomeSidebarDataProvider({ children }: { children: React.ReactNode }) {
  const [spokenLanguages, setSpokenLanguages] = useState<SpokenLanguage[] | null>(null);
  const [education, setEducation] = useState<EducationRow[] | null>(null);
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
            const rows = Array.isArray(data?.languages) ? data.languages : [];
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

  const value = useMemo(
    () => ({ spokenLanguages, education, latestBlogs }),
    [spokenLanguages, education, latestBlogs]
  );

  return <HomeSidebarDataContext.Provider value={value}>{children}</HomeSidebarDataContext.Provider>;
}

export function useHomeSidebarData() {
  const value = useContext(HomeSidebarDataContext);
  if (!value) {
    throw new Error('useHomeSidebarData must be used within HomeSidebarDataProvider');
  }
  return value;
}

