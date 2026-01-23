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
    <div className="space-y-6">
      <div className="space-y-3" data-gsap="reveal">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Games</p>
        <h2 className="text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">Playground</h2>
        <p className="max-w-2xl text-sm text-[var(--home-muted)]">A quick look at my Roblox profile.</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[var(--home-card)] p-6" data-gsap="reveal">
        {robloxLoading ? (
          <div className="space-y-4">
            <div className="h-5 w-32 rounded-full bg-white/10 animate-pulse" />
            <div className="h-4 w-48 rounded-full bg-white/10 animate-pulse" />
            <div className="h-20 w-full rounded-2xl bg-white/10 animate-pulse" />
          </div>
        ) : robloxProfile ? (
          <div className="grid gap-5 md:grid-cols-[auto_1fr]">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-[var(--home-soft)]">
              {robloxProfile.avatarUrl && (
                <Image
                  src={robloxProfile.avatarUrl}
                  alt="Roblox avatar"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">
                  <Gamepad2 className="h-4 w-4" />
                  Roblox
                </div>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[var(--home-muted)]">
                  {robloxProfile.isBanned ? 'Banned' : 'Active'}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-sans font-semibold text-[var(--home-ink)]">{robloxProfile.displayName}</h3>
              <p className="text-sm text-[var(--home-muted)]">@{robloxProfile.username}</p>
              {robloxProfile.description && (
                <p className="mt-3 text-sm text-[var(--home-muted)]">{robloxProfile.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[var(--home-muted)]">
                  Created {robloxProfile.created}
                </span>
              </div>
              <a
                href="https://www.roblox.com/users/8883015179/profile"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[var(--home-ink)] transition hover:border-[var(--home-accent)]"
              >
                View profile
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[var(--home-muted)]">Failed to load profile.</p>
            <button
              onClick={onRetry}
              className="inline-flex rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[var(--home-ink)] transition hover:border-[var(--home-accent)]"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
