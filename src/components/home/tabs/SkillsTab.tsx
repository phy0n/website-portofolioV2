'use client';

import React, { useRef, useState, useEffect } from 'react';
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
      { name: 'HTML', level: 95, icon: <SiHtml5 className="h-5 w-5" /> },
      { name: 'CSS', level: 90, icon: <SiCss3 className="h-5 w-5" /> },
      { name: 'JavaScript', level: 85, icon: <SiJavascript className="h-5 w-5" /> },
      { name: 'TypeScript', level: 80, icon: <SiTypescript className="h-5 w-5" /> },
      { name: 'PHP', level: 75, icon: <SiPhp className="h-5 w-5" /> },
      { name: 'Python', level: 70, icon: <SiPython className="h-5 w-5" /> },
      { name: 'C', level: 65, icon: <SiC className="h-5 w-5" /> },
      { name: 'C++', level: 60, icon: <SiCplusplus className="h-5 w-5" /> },
    ],
    tones: ['text-orange-400', 'text-sky-400', 'text-yellow-300', 'text-blue-400', 'text-indigo-300', 'text-yellow-400', 'text-blue-500', 'text-blue-600'],
  },
  {
    title: 'Tech Stack',
    caption: 'Frameworks & core libraries',
    items: [
      { name: 'React', level: 85, icon: <SiReact className="h-5 w-5" /> },
      { name: 'Next.js', level: 80, icon: <SiNextdotjs className="h-5 w-5 text-[var(--home-ink)]" /> },
      { name: 'Tailwind', level: 90, icon: <SiTailwindcss className="h-5 w-5" /> },
      { name: 'Shadcn', level: 85, icon: <SiShadcnui className="h-5 w-5 text-[var(--home-ink)]" /> },
      { name: 'Laravel', level: 75, icon: <SiLaravel className="h-5 w-5" /> },
      { name: 'Node.js', level: 70, icon: <SiNodedotjs className="h-5 w-5 text-green-400" /> },
    ],
    tones: ['text-cyan-300', 'text-neutral-200', 'text-sky-300', 'text-neutral-200', 'text-rose-400', 'text-green-400'],
  },
  {
    title: 'Cyber Security',
    caption: 'Analysis & security testing tools',
    items: [
      { name: 'Kali Linux', level: 70, icon: <SiKalilinux className="h-5 w-5 text-sky-400" /> },
      { name: 'Wireshark', level: 65, icon: <SiWireshark className="h-5 w-5 text-blue-500" /> },
      { name: 'Metasploit', level: 60, icon: <SiMetasploit className="h-5 w-5 text-blue-600" /> },
      { name: 'OWASP', level: 75, icon: <SiOwasp className="h-5 w-5 text-[var(--home-ink)]" /> },
    ],
    tones: ['text-sky-400', 'text-blue-500', 'text-blue-600', 'text-neutral-200'],
  },
  {
    title: 'Database',
    caption: 'Data layer services',
    items: [
      { name: 'MySQL', level: 80, icon: <SiMysql className="h-5 w-5" /> },
      { name: 'Supabase', level: 75, icon: <SiSupabase className="h-5 w-5" /> },
    ],
    tones: ['text-teal-400', 'text-emerald-400'],
  },
  {
    title: 'DevOps & OS',
    caption: 'Runtime, deployment & environments',
    items: [
      { name: 'Fedora', level: 75, icon: <SiFedora className="h-5 w-5 text-blue-500" /> },
      { name: 'Linux', level: 80, icon: <SiLinux className="h-5 w-5 text-[var(--home-ink)]" /> },
      { name: 'Docker', level: 65, icon: <SiDocker className="h-5 w-5" /> },
      { name: 'Vercel', level: 85, icon: <SiVercel className="h-5 w-5 text-[var(--home-ink)]" /> },
      { name: 'Bun', level: 70, icon: <SiBun className="h-5 w-5 text-[var(--home-ink)]" /> },
    ],
    tones: ['text-blue-500', 'text-neutral-200', 'text-sky-400', 'text-neutral-200', 'text-amber-100'],
  },
  {
    title: 'Tool Stack',
    caption: 'Daily workflow & development tools',
    items: [
      { name: 'VS Code', level: 95, icon: <VscVscode className="h-5 w-5 text-sky-400" /> },
      { name: 'GitHub', level: 90, icon: <SiGithub className="h-5 w-5 text-[var(--home-ink)]" /> },
      { name: 'Git', level: 85, icon: <SiGit className="h-5 w-5 text-red-500" /> },
      { name: 'Postman', level: 80, icon: <SiPostman className="h-5 w-5 text-orange-400" /> },
      { name: 'Android Studio', level: 60, icon: <SiAndroidstudio className="h-5 w-5" /> },
    ],
    tones: ['text-sky-400', 'text-neutral-200', 'text-red-500', 'text-orange-400', 'text-green-400'],
  },
];

export default function SkillsTab() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

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
                  className="group relative overflow-hidden flex flex-col justify-between cursor-default gap-3 rounded-xl border border-[var(--home-border)] bg-[var(--home-card)] p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[var(--accent)]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--home-soft)] transition-colors duration-300 group-hover:bg-[var(--home-ink)] group-hover:text-[var(--home-bg)] ${group.tones[index % group.tones.length]}`}
                    >
                      {skill.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--home-ink)] leading-tight">
                        {skill.name}
                      </span>
                      <span className="text-[10px] text-[var(--home-muted)] mt-0.5">{skill.level}% Proficiency</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-[var(--home-soft)] rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-[var(--accent)] rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(209,74,74,0.4)] relative"
                      style={{ width: mounted ? `${skill.level}%` : '0%' }}
                    >
                       <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
