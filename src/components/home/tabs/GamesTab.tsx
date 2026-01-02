'use client';

import Image from 'next/image';
import React from 'react';
import { Gamepad2 } from 'lucide-react';

import type { RobloxProfile } from '../types';

interface GamesTabProps {
  robloxLoading: boolean;
  robloxProfile: RobloxProfile | null;
  onRetry: () => void;
}

export default function GamesTab({ robloxLoading, robloxProfile, onRetry }: GamesTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-slide-down">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4 font-mono">
          <span className="text-white/40">~/</span>games.data
        </h2>
        <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="w-5 h-5 text-white/60" />
            <p className="text-white/70 leading-relaxed font-mono text-xs sm:text-sm">My Gaming Profiles</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 md:mb-6 font-mono flex items-center gap-1 sm:gap-2">
          <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4" />
          roblox.profile
        </h3>
        <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300">
          {robloxLoading ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-white/60 font-mono text-sm">Loading Roblox profile...</p>
            </div>
          ) : robloxProfile ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Profile Picture & Name/Username - Horizontal */}
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Profile Picture - Left */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden border-2 border-white/20 bg-white/[0.02] shadow-lg">
                    {robloxProfile.avatarUrl && (
                      <Image
                        src={robloxProfile.avatarUrl}
                        alt="Roblox Avatar"
                        width={112}
                        height={112}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    )}
                  </div>
                </div>

                {/* Display Name & Username - Right */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-base sm:text-lg md:text-xl font-bold font-mono mb-1 truncate">
                    {robloxProfile.displayName}
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm font-mono truncate">@{robloxProfile.username}</p>
                </div>
              </div>

              {/* Bio/Description - Full Width */}
              {robloxProfile.description && (
                <div className="bg-white/[0.02] rounded-lg p-3 sm:p-4 border border-white/10">
                  <p className="text-white/70 text-[10px] xs:text-xs sm:text-sm font-mono leading-relaxed">
                    {robloxProfile.description}
                  </p>
                </div>
              )}

              {/* View Profile Button - Full Width on Mobile */}
              <a
                href="https://www.roblox.com/users/8883015179/profile"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 rounded-lg text-white/60 hover:text-white text-xs sm:text-sm font-mono transition-all duration-300 text-center"
              >
                View Profile →
              </a>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/60 font-mono text-sm">Failed to load profile</p>
              <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 rounded-lg text-white/80 font-mono text-sm transition-all duration-300"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

