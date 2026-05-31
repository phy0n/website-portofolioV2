'use client';

import Image from 'next/image';
import React from 'react';
import { Gamepad2 } from 'lucide-react';

import type { MinecraftProfile, RobloxProfile } from '../types';

interface GamesTabProps {
  robloxLoading: boolean;
  robloxProfile: RobloxProfile | null;
  minecraftLoading: boolean;
  minecraftProfile: MinecraftProfile | null;
  onRetryRoblox: () => void;
  onRetryMinecraft: () => void;
}

function MinecraftHead({ skinUrl }: { skinUrl: string }) {
  const scale = 12;
  const backgroundSize = `${64 * scale}px ${64 * scale}px`;
  const headPosition = `${-8 * scale}px ${-8 * scale}px`;
  const hatPosition = `${-40 * scale}px ${-8 * scale}px`;

  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[var(--home-border)] bg-[var(--home-soft)]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${skinUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize,
          backgroundPosition: headPosition,
          imageRendering: 'pixelated',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${skinUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize,
          backgroundPosition: hatPosition,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}

export default function GamesTab({
  robloxLoading,
  robloxProfile,
  minecraftLoading,
  minecraftProfile,
  onRetryRoblox,
  onRetryMinecraft,
}: GamesTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3" data-gsap="reveal">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Games</p>
        <h2 className="text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">Playground</h2>
        <p className="max-w-2xl text-sm text-[var(--home-muted)]">A quick look at my Roblox and Minecraft profiles.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-6" data-gsap="reveal">
          {robloxLoading ? (
            <div className="space-y-4">
              <div className="h-5 w-32 rounded-full bg-[var(--home-soft)] animate-pulse" />
              <div className="h-4 w-48 rounded-full bg-[var(--home-soft)] animate-pulse" />
              <div className="h-20 w-full rounded-2xl bg-[var(--home-soft)] animate-pulse" />
            </div>
          ) : robloxProfile ? (
            <div className="grid gap-5 md:grid-cols-[auto_1fr]">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[var(--home-border)] bg-[var(--home-soft)]">
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
                  <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-1 text-xs text-[var(--home-muted)]">
                    {robloxProfile.isBanned ? 'Banned' : 'Active'}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-sans font-semibold text-[var(--home-ink)]">{robloxProfile.displayName}</h3>
                <p className="text-sm text-[var(--home-muted)]">@{robloxProfile.username}</p>
                {robloxProfile.description && (
                  <p className="mt-3 text-sm text-[var(--home-muted)]">{robloxProfile.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-1 text-xs text-[var(--home-muted)]">
                    Created {robloxProfile.created}
                  </span>
                </div>
                <a
                  href="https://www.roblox.com/users/8883015179/profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-full border border-[var(--home-border)] px-4 py-2 text-xs uppercase tracking-[0.35em] text-[var(--home-ink)] transition hover:border-[var(--home-accent)]">
                  View profile
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[var(--home-muted)]">Failed to load profile.</p>
              <button
                onClick={onRetryRoblox}
                className="inline-flex rounded-full border border-[var(--home-border)] px-4 py-2 text-xs uppercase tracking-[0.35em] text-[var(--home-ink)] transition hover:border-[var(--home-accent)]">
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-6" data-gsap="reveal">
          {minecraftLoading ? (
            <div className="space-y-4">
              <div className="h-5 w-32 rounded-full bg-[var(--home-soft)] animate-pulse" />
              <div className="h-4 w-48 rounded-full bg-[var(--home-soft)] animate-pulse" />
              <div className="h-20 w-full rounded-2xl bg-[var(--home-soft)] animate-pulse" />
            </div>
          ) : minecraftProfile ? (
            <div className="grid gap-5 md:grid-cols-[auto_1fr]">
              <div className="h-24 w-24">
                {minecraftProfile.skinUrl ? <MinecraftHead skinUrl={minecraftProfile.skinUrl} /> : null}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">
                    <Gamepad2 className="h-4 w-4" />
                    Minecraft
                  </div>
                  <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-1 text-xs text-[var(--home-muted)]">
                    Java
                  </span>
                  {minecraftProfile.capeUrl ? (
                    <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-1 text-xs text-[var(--home-muted)]">
                      Cape
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 text-lg font-sans font-semibold text-[var(--home-ink)]">{minecraftProfile.username}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-1 text-xs text-[var(--home-muted)]">
                    UUID {minecraftProfile.uuid}
                  </span>
                  <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-1 text-xs text-[var(--home-muted)]">
                    Model {minecraftProfile.model}
                  </span>
                </div>
                <a
                  href={`https://namemc.com/profile/${encodeURIComponent(minecraftProfile.username)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-full border border-[var(--home-border)] px-4 py-2 text-xs uppercase tracking-[0.35em] text-[var(--home-ink)] transition hover:border-[var(--home-accent)]">
                  View profile
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[var(--home-muted)]">Failed to load profile.</p>
              <button
                onClick={onRetryMinecraft}
                className="inline-flex rounded-full border border-[var(--home-border)] px-4 py-2 text-xs uppercase tracking-[0.35em] text-[var(--home-ink)] transition hover:border-[var(--home-accent)]">
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
