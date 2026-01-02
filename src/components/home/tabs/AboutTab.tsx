'use client';

import React from 'react';
import { BookOpen, Code, Gamepad2, Music, Star } from 'lucide-react';

import type { Hobby } from '../types';

const HOBBIES: Hobby[] = [
  { icon: <Code className="w-4 h-4" />, text: 'Programming', color: 'from-blue-500/20 to-cyan-500/20' },
  { icon: <Gamepad2 className="w-4 h-4" />, text: 'Playing Game', color: 'from-purple-500/20 to-pink-500/20' },
  { icon: <Music className="w-4 h-4" />, text: 'Listening Music', color: 'from-green-500/20 to-emerald-500/20' },
  { icon: <BookOpen className="w-4 h-4" />, text: 'Reading Comic', color: 'from-orange-500/20 to-red-500/20' },
];

export default function AboutTab() {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-slide-down">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4 font-mono">
          <span className="text-white/40">~/</span>about.md
        </h2>
        <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300">
          <p className="text-white/70 leading-relaxed font-mono text-xs sm:text-sm">
            <span className="text-white/40">const</span> <span className="text-white">developer</span> = {'{'}
            <br />
            <span className="ml-3 sm:ml-4 text-white/40">name:</span>{' '}
            <span className="text-green-400">Panggil Aja Phion</span>,
            <br />
            <span className="ml-3 sm:ml-4 text-white/40">gender:</span> <span className="text-green-400">She/He</span>,
            <br />
            <span className="ml-3 sm:ml-4 text-white/40">age:</span> <span className="text-green-400">18 years old</span>,
            <br />
            <span className="ml-3 sm:ml-4 text-white/40">role:</span> <span className="text-green-400">Developer</span>,
            <br />
            <span className="ml-3 sm:ml-4 text-white/40">passion:</span>{' '}
            <span className="text-green-400">Make good things</span>,
            <br />
            <span className="ml-3 sm:ml-4 text-white/40">status:</span>{' '}
            <span className="text-green-400">Learning &amp; Growing</span>
            <br />
            {'}'}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 md:mb-6 font-mono flex items-center gap-1 sm:gap-2">
          <Star className="w-3 h-3 sm:w-4 sm:h-4" />
          interests.json
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 animate-stagger" style={{ animationDelay: '200ms' }}>
          {HOBBIES.map((hobby, index) => (
            <div
              key={index}
              className="group relative rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden bg-white/[0.02] animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="absolute inset-0 bg-black/10 transition-all duration-300 z-0"></div>
              <div className="relative flex items-center gap-2 sm:gap-3 z-10">
                <div className="p-2 bg-white/[0.05] rounded-lg border border-white/10 group-hover:bg-white/[0.08] transition-colors duration-300">
                  {hobby.icon}
                </div>
                <span className="text-xs sm:text-sm font-mono text-white/80 group-hover:text-white transition-colors duration-300">
                  {hobby.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

