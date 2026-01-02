'use client';

import React from 'react';
import { BookOpen, Globe, Instagram } from 'lucide-react';
import { FaDiscord, FaTiktok } from 'react-icons/fa';

import type { SocialMedia } from '../types';

const SOCIAL_MEDIA: SocialMedia[] = [
  {
    name: 'Instagram',
    icon: <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />,
    url: 'https://www.instagram.com/rushandle/',
    color: 'from-pink-500 to-red-500',
  },
  {
    name: 'TikTok',
    icon: <FaTiktok className="w-4 h-4 sm:w-5 sm:h-5" />,
    url: 'https://www.tiktok.com/@phy0n',
    color: 'from-black to-cyan-500',
  },
  {
    name: 'Discord Server',
    icon: <FaDiscord className="w-4 h-4 sm:w-5 sm:h-5" />,
    url: 'https://discord.gg/MwNE7Vfb6t',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    name: 'Blog',
    icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
    url: '/blog',
    color: 'from-red-500 to-pink-500',
  },
];

export default function ConnectTab() {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-slide-down">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4 font-mono">
          <span className="text-white/40">~/</span>connect.links
        </h2>
        <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300">
          <p className="text-white/70 leading-relaxed font-mono text-xs sm:text-sm mb-6">Connect with me on social media!</p>
        </div>
      </div>

      <div>
        <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 md:mb-6 font-mono flex items-center gap-1 sm:gap-2">
          <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          social.links
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 animate-stagger" style={{ animationDelay: '220ms' }}>
          {SOCIAL_MEDIA.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden bg-white/[0.02] cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="absolute inset-0 bg-black/10 transition-all duration-300 z-0"></div>
              <div className="relative flex items-center gap-3 sm:gap-4 z-10">
                <div className="p-2 sm:p-4 bg-white/[0.05] rounded-lg border border-white/10 group-hover:bg-white/[0.08] group-hover:scale-110 transition-all duration-300">
                  <div className="text-white/60 group-hover:text-white transition-colors duration-300 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {social.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-xs sm:text-base font-bold font-mono group-hover:text-white transition-colors duration-300">
                    {social.name}
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm font-mono mt-1">Click to visit →</p>
                </div>
                <div className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

