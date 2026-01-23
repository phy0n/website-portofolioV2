'use client';

import React from 'react';
import { BookOpen, Code, Gamepad2, Music, Star } from 'lucide-react';

import type { Hobby } from '../types';

const HOBBIES: Hobby[] = [
  { icon: <Code className="h-4 w-4" />, text: 'Programming', color: '' },
  { icon: <Gamepad2 className="h-4 w-4" />, text: 'Playing Game', color: '' },
  { icon: <Music className="h-4 w-4" />, text: 'Listening Music', color: '' },
  { icon: <BookOpen className="h-4 w-4" />, text: 'Reading Comic', color: '' },
];

const FACTS = [
  { label: 'Name', value: 'Phion Rushandle' },
  { label: 'Pronouns', value: 'She/He' },
  { label: 'Age', value: '18 years old' },
  { label: 'Role', value: 'Developer' },
  { label: 'Passion', value: 'Make good things' },
  { label: 'Status', value: 'Learning' },
];

export default function AboutTab() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">About</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Focused on clean structure and clear communication.
        </h2>
        <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)] sm:text-base">
          I am Phion, a developer who enjoys making good things and learning every day. I keep interfaces simple, modern,
          and easy to navigate.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="js-reveal border-l-2 border-[var(--home-accent)] pl-4 text-lg text-[var(--home-ink)]">
            Building calm, modern web experiences that feel intentional.
          </div>
          <div className="js-reveal border border-white/10 bg-black/30 px-5 py-4 text-sm text-[var(--home-muted)]">
            I build web experiences with a steady process, paying attention to the details that make a product feel
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
