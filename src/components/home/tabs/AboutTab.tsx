'use client';

import React from 'react';
import { BookOpen, Code, Gamepad2, Music, Star } from 'lucide-react';

import type { Hobby } from '../types';

const HOBBIES: Hobby[] = [
  { icon: <Code className="h-4 w-4" />, text: 'Programming', color: '' },
  { icon: <Gamepad2 className="h-4 w-4" />, text: 'Games', color: '' },
  { icon: <Music className="h-4 w-4" />, text: 'Music', color: '' },
  { icon: <BookOpen className="h-4 w-4" />, text: 'Art', color: '' },
];

export default function AboutTab() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">About</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Focused on Consistency
        </h2>
        <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)] sm:text-base">
          I am Phion, I enjoy building useful and meaningful solutions while continuously learning and improving. I focus on keeping things simple, structured, and easy to understand whether it's software, systems, or ideas.
        </p>
      </div>

      <div className="space-y-6">
        <div className="js-reveal border-l-2 border-[var(--home-accent)] pl-4 text-lg text-[var(--home-ink)]">
          Building reliable and thoughtful solutions across different fields and challenges.
        </div>
        <div className="js-reveal border border-white/10 bg-black/30 px-5 py-4 text-sm text-[var(--home-muted)]">
          I follow a steady process: understand the problem, explore solutions, test, and refine, so the result stays clear, maintainable, and ready to grow.
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
              className="js-reveal flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-[var(--home-muted)]">
              <span className="text-[var(--home-accent)]">{hobby.icon}</span>
              {hobby.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
