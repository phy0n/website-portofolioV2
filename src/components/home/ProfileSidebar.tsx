'use client';

import Image from 'next/image';
import React from 'react';
import { Gamepad2, MessageCircle, Music } from 'lucide-react';

import type { DiscordStatus } from './types';

interface ProfileSidebarProps {
  avatarUrl: string | null;
  discordStatus: DiscordStatus | null;
  skills: string[];
}

export default function ProfileSidebar({ avatarUrl, discordStatus, skills }: ProfileSidebarProps) {
  return (
    <div className="text-left lg:text-left lg:min-w-[250px] xl:min-w-[300px]">
      {/* Avatar */}
      <div className="relative inline-block mb-4 sm:mb-6 group animate-stagger">
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-full animate-pulse"></div>
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-white/10 to-white/[0.05] rounded-full p-1 shadow-2xl border border-white/20 group-hover:border-white/30 transition-all duration-500 animate-glow-pulse">
          <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center overflow-hidden border border-white/10 relative">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden">
              {avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt="Profile Photo"
                  width={96}
                  height={96}
                  className="object-cover hover:scale-110 transition-transform duration-500"
                  priority
                />
              )}
            </div>
          </div>
          {discordStatus && (
            <div
              className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-[3px] border-[#1a1b1e] ${
                discordStatus.status === 'online'
                  ? 'bg-green-500'
                  : discordStatus.status === 'idle'
                    ? 'bg-yellow-500'
                    : discordStatus.status === 'dnd'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
              }`}
            ></div>
          )}
        </div>
      </div>

      {/* Name and username below avatar */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-wide animate-slide-down">
          <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent font-mono animate-gradient">
            Phy0n
          </span>
          <span className="text-white/50 text-sm sm:text-base md:text-lg ml-1 sm:ml-2 font-mono">#LoveYou.</span>
        </h1>
        <div
          className="flex items-center justify-start gap-1 sm:gap-2 mb-2 sm:mb-4 animate-slide-down"
          style={{ animationDelay: '150ms' }}
        >
          <span className="text-white/60 text-xs sm:text-sm font-mono">@Phy0n</span>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          <span className="text-white/40 text-xs font-mono">Orang Gila</span>
        </div>
      </div>

      {/* Developer tag below name/username */}
      <div
        className="flex flex-wrap justify-start gap-1 sm:gap-2 mb-4 sm:mb-6 animate-stagger"
        style={{ animationDelay: '200ms' }}
      >
        {skills.map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-white/80 rounded-full text-[10px] xs:text-xs sm:text-xs border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer font-mono animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <span className="text-white/40">&lt;</span>
            {skill}
            <span className="text-white/40">/&gt;</span>
          </span>
        ))}
      </div>

      {/* Custom Status */}
      {discordStatus && discordStatus.customStatus && !discordStatus.activity && !discordStatus.spotify && (
        <div
          className="mb-4 sm:mb-6 bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/15 transition-all duration-300 font-mono animate-stagger"
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
            <span className="text-white/60 text-[10px] xs:text-xs sm:text-sm font-mono">status:</span>
          </div>
          <p className="text-white/80 text-[10px] xs:text-xs sm:text-sm leading-relaxed">{discordStatus.customStatus}</p>
        </div>
      )}

      {/* Discord Activity Status */}
      {discordStatus && discordStatus.activity && (
        <div
          className="mb-4 sm:mb-6 bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/15 transition-all duration-300 font-mono animate-stagger"
          style={{ animationDelay: '140ms' }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
            <span className="text-white/60 text-[10px] xs:text-xs sm:text-sm font-mono">playing:</span>
          </div>
          <p className="text-white/80 text-[10px] xs:text-xs sm:text-sm font-bold mb-1">{discordStatus.activity.name}</p>
          {discordStatus.activity.details && (
            <p className="text-white/60 text-[10px] xs:text-xs leading-relaxed">{discordStatus.activity.details}</p>
          )}
          {discordStatus.activity.state && (
            <p className="text-white/50 text-[10px] xs:text-xs leading-relaxed">{discordStatus.activity.state}</p>
          )}
        </div>
      )}

      {/* Spotify Status */}
      {discordStatus && discordStatus.spotify && (
        <div
          className="mb-4 sm:mb-6 bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/15 transition-all duration-300 font-mono animate-stagger"
          style={{ animationDelay: '160ms' }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <Music className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
            <span className="text-white/60 text-[10px] xs:text-xs sm:text-sm font-mono">listening to:</span>
          </div>
          <p className="text-white/80 text-[10px] xs:text-xs sm:text-sm font-bold mb-1">{discordStatus.spotify.song}</p>
          <p className="text-white/60 text-[10px] xs:text-xs">by {discordStatus.spotify.artist}</p>
        </div>
      )}

      <div
        className="bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/15 transition-all duration-300 font-mono animate-stagger"
        style={{ animationDelay: '180ms' }}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white/60 text-xs sm:text-sm font-mono">motivation:</span>
        </div>
        <p className="text-white/80 text-xs sm:text-sm leading-relaxed">The best revenge is to make yourself better</p>
      </div>
    </div>
  );
}

