'use client';

import React from 'react';
import { Monitor } from 'lucide-react';

import type { Project } from '../types';

const PROJECTS: Project[] = [
  {
    title: 'Kh1ev Project',
    description: 'This is my kh1ev community website',
    tags: ['React', 'TailwindCSS', 'TypeScript'],
    link: 'https://kh1ev.my.id/',
    status: 'Live',
    icon: <Monitor className="w-4 h-4" />,
  },
];

export default function ProjectsTab() {
  return (
    <div className="animate-slide-down">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
        <span className="text-white/40">~/</span>projects/
      </h2>
      <div className="grid gap-4 sm:gap-6">
        {PROJECTS.map((project, index) => (
          <a
            key={index}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group bg-white/[0.02] hover:bg-white/[0.04] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-white font-mono group-hover:text-white transition-colors duration-300">
                  {project.title}
                </h3>
              </div>
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-mono border border-blue-500/30">
                {project.status}
              </span>
            </div>
            <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed font-mono">{project.description}</p>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {project.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/[0.05] text-white/70 rounded-full text-xs border border-white/10 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

