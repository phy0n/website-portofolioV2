'use client';

import React from 'react';
import { Briefcase } from 'lucide-react';

import type { Experience } from '../types';

const EXPERIENCES: Experience[] = [
  {
    role: 'Website Developer',
    company: 'Kh1ev Community',
    period: '2024 - 2025',
    description:
      'Working on the official website for Kh1ev Community, focusing on frontend development and user experience design.',
    status: 'Current',
  },
];

export default function ExperienceTab() {
  return (
    <div className="animate-slide-down">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
        <span className="text-white/40">~/</span>experience.log
      </h2>
      <div className="space-y-4 sm:space-y-6">
        {EXPERIENCES.map((exp, index) => (
          <div
            key={index}
            className="relative bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300 group"
          >
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-mono border border-green-500/30">
                {exp.status}
              </span>
            </div>
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-white font-mono">{exp.role}</h3>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white/60 font-mono mt-1">
                <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{exp.company}</span>
                <span className="text-white/40">•</span>
                <span>{exp.period}</span>
              </div>
            </div>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-mono">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

