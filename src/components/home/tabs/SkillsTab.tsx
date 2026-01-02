'use client';

import React from 'react';
import { Clock, Code, Lightbulb, Palette, Target } from 'lucide-react';

import type { Skill } from '../types';

const HARD_SKILLS: Skill[] = [{ name: 'Web Developer', level: 85, icon: <Code className="w-4 h-4" />, category: 'Frontend' }];

const SOFT_SKILLS: Skill[] = [
  { name: 'Problem Solving', level: 90, icon: <Lightbulb className="w-4 h-4" /> },
  { name: 'Adaptability', level: 88, icon: <Target className="w-4 h-4" /> },
  { name: 'Time Management', level: 82, icon: <Clock className="w-4 h-4" /> },
  { name: 'Creativity', level: 87, icon: <Palette className="w-4 h-4" /> },
];

export default function SkillsTab() {
  return (
    <div className="space-y-6 sm:space-y-8 font-mono animate-slide-down">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
          <span className="text-white/40">~/</span>hard_skills.json
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {HARD_SKILLS.map((skill, index) => (
            <div
              key={index}
              className="bg-white/[0.02] rounded-lg p-3 sm:p-4 border border-white/10 hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                <div className="p-2 bg-white/[0.05] rounded-lg border border-white/10 group-hover:bg-white/[0.08] transition-colors duration-300">
                  {skill.icon}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white font-mono">{skill.name}</h3>
                  <p className="text-white/50 text-xs">{skill.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
          <span className="text-white/40">~/</span>soft_skills.json
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {SOFT_SKILLS.map((skill, index) => (
            <div
              key={index}
              className="bg-white/[0.02] rounded-lg p-3 sm:p-4 border border-white/10 hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/[0.05] rounded-lg border border-white/10 group-hover:bg-white/[0.08] transition-colors duration-300">
                  {skill.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xs sm:text-base font-semibold text-white font-mono">{skill.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

