'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Code, Gamepad2, Languages, Music, Star } from 'lucide-react';

import type { Hobby } from '../types';

const HOBBIES: Hobby[] = [
  { icon: <Code className="h-4 w-4" />, text: 'Programming', color: '' },
  { icon: <Gamepad2 className="h-4 w-4" />, text: 'Playing Game', color: '' },
  { icon: <Music className="h-4 w-4" />, text: 'Listening Music', color: '' },
  { icon: <BookOpen className="h-4 w-4" />, text: 'Reading Comic', color: '' },
];

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

const FALLBACK_LANGUAGES: SpokenLanguage[] = [
  { id: 'id', name: 'Bahasa Indonesia', level: 100, label: 'Native' },
  { id: 'en', name: 'English', level: 75, label: 'Intermediate' },
  { id: 'ja', name: 'Japanese', level: 40, label: 'Basic' },
  { id: 'de', name: 'German', level: 35, label: 'Basic' },
];

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

export default function AboutTab() {
  const [languageSource, setLanguageSource] = useState<'fallback' | 'api'>('fallback');
  const [spokenLanguages, setSpokenLanguages] = useState<SpokenLanguage[]>(FALLBACK_LANGUAGES);

  useEffect(() => {
    const controller = new AbortController();

    const loadLanguages = async () => {
      try {
        const res = await fetch('/api/languages', { cache: 'no-store', signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; languages?: unknown };
        if (!data?.ok) return;
        const rows = Array.isArray(data.languages) ? data.languages : [];
        const normalized = rows.map(normalizeLanguage).filter((row): row is SpokenLanguage => Boolean(row));
        setSpokenLanguages(normalized);
        setLanguageSource('api');
      } catch (err) {
        const error = err as { name?: string };
        if (error?.name === 'AbortError') return;
      }
    };

    void loadLanguages();
    return () => controller.abort();
  }, []);

  const sortedLanguages = useMemo(() => {
    if (spokenLanguages.length <= 1) return spokenLanguages;
    return [...spokenLanguages].sort((a, b) => {
      const orderA = typeof a.sort_order === 'number' ? a.sort_order : 0;
      const orderB = typeof b.sort_order === 'number' ? b.sort_order : 0;
      if (orderA !== orderB) return orderB - orderA;
      return a.name.localeCompare(b.name);
    });
  }, [spokenLanguages]);

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">About</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Focused on clean structure and clear communication.
        </h2>
        <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)] sm:text-base">
          I am Phion, a developer who enjoys making good things and learning every day. I keep things simple, clear, and
          easy to use.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="js-reveal border-l-2 border-[var(--home-accent)] pl-4 text-lg text-[var(--home-ink)]">
            Building calm, modern experiences that feel intentional.
          </div>
          <div className="js-reveal border border-white/10 bg-black/30 px-5 py-4 text-sm text-[var(--home-muted)]">
            I build experiences with a steady process, paying attention to the details that make a product feel
            confident and professional.
          </div>
        </div>

        <div className="space-y-3 border-y border-white/10">
          {FACTS.map((fact, index) => (
            <div
              key={fact.label}
              className={`js-reveal flex flex-col gap-1 py-3 text-sm text-[var(--home-muted)] sm:flex-row sm:items-center sm:justify-between ${
                index === FACTS.length - 1 ? '' : 'border-b border-white/10'
              }`}
            >
              <span className="text-[11px] uppercase tracking-[0.35em]">{fact.label}</span>
              <span className="text-[var(--home-ink)]">{fact.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 border-t border-white/10 pt-6">
        <div className="js-reveal flex items-center gap-2">
          <Languages className="h-4 w-4 text-[var(--home-accent)]" />
          <h3 className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Languages</h3>
        </div>
        {languageSource === 'api' && sortedLanguages.length === 0 ? (
          <div className="js-reveal rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-[var(--home-muted)]">
            No languages yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
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

      <div className="space-y-4 border-t border-white/10 pt-6">
        <div className="js-reveal flex items-center gap-2">
          <Star className="h-4 w-4 text-[var(--home-accent)]" />
          <h3 className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Interests</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {HOBBIES.map((hobby, index) => (
            <div
              key={index}
              className="js-reveal flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-[var(--home-muted)]"
            >
              <span className="text-[var(--home-accent)]">{hobby.icon}</span>
              {hobby.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
