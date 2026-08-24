'use client';

import React from 'react';
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
  items: Skill[];
  tones: string[];
};

const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Lexicons & Syntaxes',
    items: [
      { name: 'HTML', level: 95, icon: <SiHtml5 /> },
      { name: 'CSS', level: 90, icon: <SiCss3 /> },
      { name: 'JavaScript', level: 85, icon: <SiJavascript /> },
      { name: 'TypeScript', level: 80, icon: <SiTypescript /> },
      { name: 'PHP', level: 75, icon: <SiPhp /> },
      { name: 'Python', level: 70, icon: <SiPython /> },
      { name: 'C', level: 65, icon: <SiC /> },
      { name: 'C++', level: 60, icon: <SiCplusplus /> },
    ],
    tones: ['text-orange-400', 'text-sky-400', 'text-yellow-300', 'text-blue-400', 'text-indigo-300', 'text-yellow-400', 'text-blue-500', 'text-blue-600'],
  },
  {
    title: 'Architectural Frameworks',
    items: [
      { name: 'React', level: 85, icon: <SiReact /> },
      { name: 'Next.js', level: 80, icon: <SiNextdotjs className="text-[var(--home-ink)]" /> },
      { name: 'Tailwind', level: 90, icon: <SiTailwindcss /> },
      { name: 'Shadcn', level: 85, icon: <SiShadcnui className="text-[var(--home-ink)]" /> },
      { name: 'Laravel', level: 75, icon: <SiLaravel /> },
      { name: 'Node.js', level: 70, icon: <SiNodedotjs className="text-green-400" /> },
    ],
    tones: ['text-cyan-300', 'text-neutral-200', 'text-sky-300', 'text-neutral-200', 'text-rose-400', 'text-green-400'],
  },
  {
    title: 'Cyber-Defense',
    items: [
      { name: 'Kali Linux', level: 70, icon: <SiKalilinux className="text-sky-400" /> },
      { name: 'Wireshark', level: 65, icon: <SiWireshark className="text-blue-500" /> },
      { name: 'Metasploit', level: 60, icon: <SiMetasploit className="text-blue-600" /> },
      { name: 'OWASP', level: 75, icon: <SiOwasp className="text-[var(--home-ink)]" /> },
    ],
    tones: ['text-sky-400', 'text-blue-500', 'text-blue-600', 'text-neutral-200'],
  },
  {
    title: 'Data Persistence',
    items: [
      { name: 'MySQL', level: 80, icon: <SiMysql /> },
      { name: 'Supabase', level: 75, icon: <SiSupabase /> },
    ],
    tones: ['text-teal-400', 'text-emerald-400'],
  },
  {
    title: 'Kernel Environments',
    items: [
      { name: 'Fedora', level: 75, icon: <SiFedora className="text-blue-500" /> },
      { name: 'Linux', level: 80, icon: <SiLinux className="text-[var(--home-ink)]" /> },
      { name: 'Docker', level: 65, icon: <SiDocker /> },
      { name: 'Vercel', level: 85, icon: <SiVercel className="text-[var(--home-ink)]" /> },
      { name: 'Bun', level: 70, icon: <SiBun className="text-[var(--home-ink)]" /> },
    ],
    tones: ['text-blue-500', 'text-neutral-200', 'text-sky-400', 'text-neutral-200', 'text-amber-100'],
  },
  {
    title: 'Instrumentation',
    items: [
      { name: 'VS Code', level: 95, icon: <VscVscode className="text-sky-400" /> },
      { name: 'GitHub', level: 90, icon: <SiGithub className="text-[var(--home-ink)]" /> },
      { name: 'Git', level: 85, icon: <SiGit className="text-red-500" /> },
      { name: 'Postman', level: 80, icon: <SiPostman className="text-orange-400" /> },
      { name: 'Android Studio', level: 60, icon: <SiAndroidstudio /> },
    ],
    tones: ['text-sky-400', 'text-neutral-200', 'text-red-500', 'text-orange-400', 'text-green-400'],
  },
];

export default function SkillsTab() {
  const allSkills = SKILL_GROUPS.flatMap((group) =>
    group.items.map((skill, index) => ({
      ...skill,
      tone: group.tones[index % group.tones.length],
    }))
  );

  return (
    <div className="space-y-12 pb-12">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">
          Technological Competencies
        </p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Development Stack & Instrumentation
        </h2>
        <p className="js-reveal max-w-4xl text-sm sm:text-base md:text-lg leading-relaxed text-[var(--home-muted)]">
          An overview of my technical proficiencies.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {allSkills.map((skill) => (
          <div
            key={skill.name}
            className="js-reveal group relative flex aspect-square cursor-default flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)]/30 p-2 backdrop-blur-sm transition-all duration-300 hover:border-[var(--home-border)]">
            <span
              className={`relative z-10 text-3xl transition-transform duration-500 ${skill.tone}`}>
              {skill.icon}
            </span>

            <span className="relative z-10 text-center text-[10px] font-semibold leading-tight text-[var(--home-muted)] transition-colors duration-300 group-hover:text-[var(--home-ink)]">
              {skill.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
