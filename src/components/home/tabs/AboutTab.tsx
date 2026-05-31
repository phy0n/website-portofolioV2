'use client';

import React from 'react';
import {
  BookOpen,
  Brain,
  Code,
  Database,
  Gamepad2,
  GitBranch,
  Layers3,
  Music,
  Network,
  ServerCog,
  Sparkles,
  Star,
  Workflow,
} from 'lucide-react';

import type { Hobby } from '../types';

const LEARNING_ROADMAP = [
  {
    icon: <Code className="h-4 w-4" />,
    title: 'Programming fundamentals',
    text: 'Writing logic clearly and understanding how code runs.',
  },
  {
    icon: <Layers3 className="h-4 w-4" />,
    title: 'Data structures & algorithms',
    text: 'Learning how data is organized and problems are solved efficiently.',
  },
  {
    icon: <Network className="h-4 w-4" />,
    title: 'Web systems',
    text: 'Exploring how frontend, backend, APIs, and servers communicate.',
  },
  {
    icon: <Workflow className="h-4 w-4" />,
    title: 'Application architecture',
    text: 'Understanding how app features are structured and connected.',
  },
  {
    icon: <Database className="h-4 w-4" />,
    title: 'Databases',
    text: 'Modeling data, writing queries, and managing relationships.',
  },
  {
    icon: <ServerCog className="h-4 w-4" />,
    title: 'Operating systems',
    text: 'Studying processes, files, memory, and the system layer underneath.',
  },
  {
    icon: <GitBranch className="h-4 w-4" />,
    title: 'Git, Linux & tooling',
    text: 'Using developer tools to work, debug, and manage projects better.',
  },
  {
    icon: <Brain className="h-4 w-4" />,
    title: 'Problem solving',
    text: 'Breaking complex ideas into smaller steps that can be tested.',
  },
];

const HOBBIES: Hobby[] = [
  { icon: <Code className="h-4 w-4" />, text: 'Programming', color: '' },
  { icon: <Gamepad2 className="h-4 w-4" />, text: 'Games', color: '' },
  { icon: <Music className="h-4 w-4" />, text: 'Music', color: '' },
  { icon: <BookOpen className="h-4 w-4" />, text: 'Art', color: '' },
];

export default function AboutTab() {
  return (
    <div className="space-y-12">
      <div className="max-w-5xl space-y-4">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">About</p>
        <div className="space-y-3">
          <h2 className="js-reveal max-w-4xl text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
            Exploring how computer science works
          </h2>
          <p className="js-reveal max-w-4xl text-sm leading-relaxed text-[var(--home-muted)] sm:text-base">
            I am Phion Rushandle, a Computer Science Enthusiast. I enjoy learning how software works
            from the inside: how code becomes applications, how web systems communicate, how data is
            stored, and how operating systems support everything underneath.
          </p>
        </div>
      </div>

      <div className="space-y-5 py-2">
        <div className="js-reveal max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Currently learning</p>
          </div>
          <p className="text-sm leading-relaxed text-[var(--home-muted)]">
            Areas I am exploring step by step to understand the bigger picture of computer science.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-4">
          {LEARNING_ROADMAP.map((item, index) => (
            <div
              key={item.title}
              className="js-reveal flex min-h-24 items-start gap-3 rounded-md border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--home-bg)] text-[var(--home-accent)] ring-1 ring-white/10">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--home-muted)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-0.5 text-sm font-semibold leading-snug text-[var(--home-ink)]">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--home-muted)]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="js-reveal flex items-center gap-2">
          <h3 className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Interests</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {HOBBIES.map((hobby) => (
            <div
              key={hobby.text}
              className="js-reveal flex items-center gap-2 rounded-full bg-[var(--home-bg)] px-4 py-2 text-sm text-[var(--home-muted)] ring-1 ring-white/10">
              <span className="text-[var(--home-accent)]">{hobby.icon}</span>
              {hobby.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
