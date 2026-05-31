'use client';

import React, { useRef } from 'react';
import {
  SiCss3,
  SiC,
  SiCplusplus,
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
  SiKalilinux,
  SiWireshark,
  SiOwasp,
  SiFedora,
  SiMetasploit,
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
      { name: 'C++', level: 0, icon: <SiCplusplus className="h-5 w-5" /> },
    ],
    tones: ['text-orange-400', 'text-sky-400', 'text-yellow-300', 'text-blue-400', 'text-indigo-300', 'text-yellow-400', 'text-blue-500', 'text-blue-600'],
  },
  {
    title: 'Tech Stack',
    caption: 'Frameworks & core libraries',
    items: [
      { name: 'React', level: 0, icon: <SiReact className="h-5 w-5" /> },
      { name: 'Next.js', level: 0, icon: <SiNextdotjs className="h-5 w-5 text-[var(--home-ink)]" /> },
      { name: 'Tailwind', level: 0, icon: <SiTailwindcss className="h-5 w-5" /> },
      { name: 'Shadcn', level: 0, icon: <SiShadcnui className="h-5 w-5 text-[var(--home-ink)]" /> },
      { name: 'Laravel', level: 0, icon: <SiLaravel className="h-5 w-5" /> },
      { name: 'Node.js', level: 0, icon: <SiNodedotjs className="h-5 w-5 text-green-400" /> },
    ],
    tones: ['text-cyan-300', 'text-neutral-200', 'text-sky-300', 'text-neutral-200', 'text-rose-400', 'text-green-400'],
  },
  {
    title: 'Cyber Security',
    caption: 'Analysis & security testing tools',
    items: [
      { name: 'Kali Linux', level: 0, icon: <SiKalilinux className="h-5 w-5 text-sky-400" /> },
      { name: 'Wireshark', level: 0, icon: <SiWireshark className="h-5 w-5 text-blue-500" /> },
      { name: 'Metasploit', level: 0, icon: <SiMetasploit className="h-5 w-5 text-blue-600" /> },
      { name: 'OWASP', level: 0, icon: <SiOwasp className="h-5 w-5 text-[var(--home-ink)]" /> },
    ],
    tones: ['text-sky-400', 'text-blue-500', 'text-blue-600', 'text-neutral-200'],
  },
  {
    title: 'Database',
    caption: 'Data layer services',
    items: [
      { name: 'MySQL', level: 0, icon: <SiMysql className="h-5 w-5" /> },
      { name: 'Supabase', level: 0, icon: <SiSupabase className="h-5 w-5" /> },
    ],
    tones: ['text-teal-400', 'text-emerald-400'],
  },
  {
    title: 'DevOps & OS',
    caption: 'Runtime, deployment & environments',
    items: [
      { name: 'Fedora', level: 0, icon: <SiFedora className="h-5 w-5 text-blue-500" /> },
      { name: 'Linux', level: 0, icon: <SiLinux className="h-5 w-5 text-[var(--home-ink)]" /> },
      { name: 'Docker', level: 0, icon: <SiDocker className="h-5 w-5" /> },
      { name: 'Vercel', level: 0, icon: <SiVercel className="h-5 w-5 text-[var(--home-ink)]" /> },
      { name: 'Bun', level: 0, icon: <SiBun className="h-5 w-5 text-[var(--home-ink)]" /> },
    ],
    tones: ['text-blue-500', 'text-neutral-200', 'text-sky-400', 'text-neutral-200', 'text-amber-100'],
  },
  {
    title: 'Tool Stack',
    caption: 'Daily workflow & development tools',
    items: [
      { name: 'VS Code', level: 0, icon: <VscVscode className="h-5 w-5 text-sky-400" /> },
      { name: 'GitHub', level: 0, icon: <SiGithub className="h-5 w-5 text-[var(--home-ink)]" /> },
      { name: 'Git', level: 0, icon: <SiGit className="h-5 w-5 text-red-500" /> },
      { name: 'Postman', level: 0, icon: <SiPostman className="h-5 w-5 text-orange-400" /> },
      { name: 'Android Studio', level: 0, icon: <SiAndroidstudio className="h-5 w-5" /> },
    ],
    tones: ['text-sky-400', 'text-neutral-200', 'text-red-500', 'text-orange-400', 'text-green-400'],
  },
];

export default function SkillsTab() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={rootRef} className="space-y-8 pb-12">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Skills</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Languages and tools
        </h2>
        <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
          A focused set of technologies organized by how I use them across the workflow. Includes programming languages, frameworks, security tools, and operating systems.
        </p>
      </div>

      <div className="space-y-12">
        {SKILL_GROUPS.map((group) => (
          <div key={group.title} className="space-y-5">
            <div className="js-reveal flex flex-wrap items-center justify-between gap-3 border-t border-[var(--home-border)] pt-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">{group.title}</p>
                <p className="mt-1 text-xs text-[var(--home-muted)]">{group.caption}</p>
              </div>
            </div>
            <div className="js-reveal grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {group.items.map((skill, index) => (
                <div
                  key={skill.name}
                  className="group flex cursor-default items-center gap-3 rounded-xl border border-[var(--home-border)] bg-[var(--home-card)] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--home-ink)] hover:bg-[var(--home-soft)]">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--home-soft)] transition-transform duration-300 group-hover:scale-110 ${group.tones[index % group.tones.length]}`}>
                    {skill.icon}
                  </span>
                  <span className="text-sm font-medium text-[var(--home-ink)]">
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
