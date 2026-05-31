'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  SiCss3,
  SiC,
  SiDiscord,
  SiDocker,
  SiGithub,
  SiGit,
  SiHtml5,
  SiJavascript,
  SiLaravel,
  SiLinux,
  SiMysql,
  SiPhp,
  SiPostman,
  SiPython,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiShadcnui,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiBun,
  SiAndroidstudio,
} from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';

import type { Skill } from '../types';

type SkillGroup = {
  title: string;
  caption: string;
  items: Skill[];
  tones: string[];
};

const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Languages',
    caption: 'Core programming languages',
    items: [
      { name: 'HTML', level: 0, icon: <SiHtml5 className="h-5 w-5" /> },
      { name: 'CSS', level: 0, icon: <SiCss3 className="h-5 w-5" /> },
      { name: 'JavaScript', level: 0, icon: <SiJavascript className="h-5 w-5" /> },
      { name: 'TypeScript', level: 0, icon: <SiTypescript className="h-5 w-5" /> },
      { name: 'PHP', level: 0, icon: <SiPhp className="h-5 w-5" /> },
      { name: 'Python', level: 0, icon: <SiPython className="h-5 w-5" /> },
      { name: 'C', level: 0, icon: <SiC className="h-5 w-5" /> },
    ],
    tones: ['text-orange-400', 'text-sky-400', 'text-yellow-300', 'text-blue-400', 'text-indigo-300'],
  },
  {
    title: 'Tech Stack',
    caption: 'Frameworks & core libraries',
    items: [
      { name: 'React', level: 0, icon: <SiReact className="h-5 w-5" /> },
      { name: 'Next.js', level: 0, icon: <SiNextdotjs className="h-5 w-5" /> },
      { name: 'Tailwind', level: 0, icon: <SiTailwindcss className="h-5 w-5" /> },
      { name: 'Shadcn', level: 0, icon: <SiShadcnui className="h-5 w-5" /> },
      { name: 'Laravel', level: 0, icon: <SiLaravel className="h-5 w-5" /> },
      { name: 'Node.js', level: 0, icon: <SiNodedotjs className="h-5 w-5 text-green-400" /> },
    ],
    tones: ['text-cyan-300', 'text-neutral-200', 'text-sky-300', 'text-green-400', 'text-rose-300'],
  },
  {
    title: 'Database',
    caption: 'Data layer services',
    items: [
      { name: 'MySQL', level: 0, icon: <SiMysql className="h-5 w-5" /> },
      { name: 'Supabase', level: 0, icon: <SiSupabase className="h-5 w-5" /> },
    ],
    tones: ['text-teal-300', 'text-emerald-300'],
  },
  {
    title: 'DevOps',
    caption: 'Runtime & deployment',
    items: [
      { name: 'Docker', level: 0, icon: <SiDocker className="h-5 w-5" /> },
      { name: 'Linux', level: 0, icon: <SiLinux className="h-5 w-5 text-white" /> },
      { name: 'Vercel', level: 0, icon: <SiVercel className="h-5 w-5" /> },
      { name: 'Bun', level: 0, icon: <SiBun className="h-5 w-5 text-white" /> },
    ],
    tones: ['text-sky-300', 'text-lime-300', 'text-neutral-200', 'text-yellow-300'],
  },
  {
    title: 'Tool Stack',
    caption: 'Daily workflow tools',
    items: [
      { name: 'GitHub', level: 0, icon: <SiGithub className="h-5 w-5 text-white" /> },
      { name: 'Git', level: 0, icon: <SiGit className="h-5 w-5 text-red-500" /> },
      { name: 'Postman', level: 0, icon: <SiPostman className="h-5 w-5 text-orange-400" /> },
      { name: 'VS Code', level: 0, icon: <VscVscode className="h-5 w-5 text-sky-400" /> },
      { name: 'Android Studio', level: 0, icon: <SiAndroidstudio className="h-5 w-5" /> },
    ],
    tones: ['text-purple-300', 'text-orange-300', 'text-amber-300', 'text-sky-300', 'text-green-300'],
  },
];

function SkillIcon({
  name,
  icon,
  tone,
  groupTitle,
  isActive,
  onToggle,
}: {
  name: string;
  icon: React.ReactNode;
  tone: string;
  groupTitle: string;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="js-skill relative">
      <button
        type="button"
        aria-label={name}
        aria-expanded={isActive}
        onClick={onToggle}
        className={[
          'group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/30 text-[var(--home-ink)] transition',
          'hover:border-white/20 hover:bg-black/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-accent)]/40',
        ].join(' ')}>
        <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ${tone}`}>{icon}</span>
      </button>

      {isActive ? (
        <div
          role="tooltip"
          className="absolute left-full top-1/2 z-20 ml-3 w-max -translate-y-1/2 rounded-2xl border border-white/10 bg-black/80 px-3 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur">
          <p className="text-xs font-semibold text-white">{name}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-white/60">{groupTitle}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function SkillsTab() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeSkill) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest('.js-skill')) return;
      setActiveSkill(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveSkill(null);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSkill]);

  return (
    <div ref={rootRef} className="space-y-6">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Skills</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Languages and tools
        </h2>
        <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
          A focused set of technologies organized by how I use them across the workflow.
        </p>
      </div>

      <div className="space-y-10">
        {SKILL_GROUPS.map((group) => (
          <div key={group.title} className="space-y-4">
            <div className="js-reveal flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">{group.title}</p>
                <p className="mt-2 text-xs text-[var(--home-muted)]">{group.caption}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {group.items.map((skill, index) => (
                <SkillIcon
                  key={skill.name}
                  name={skill.name}
                  icon={skill.icon}
                  tone={group.tones[index % group.tones.length]}
                  groupTitle={group.title}
                  isActive={activeSkill === skill.name}
                  onToggle={() => setActiveSkill((current) => (current === skill.name ? null : skill.name))}/>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
