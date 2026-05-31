'use client';

import Image from 'next/image';
import React from 'react';

import DiscordActivitySection from './DiscordActivitySection';
import type { DiscordStatus } from './types';

interface ProfileSidebarProps {
  avatarUrl: string | null;
  discordStatus: DiscordStatus | null;
  skills: string[];
}

const STATUS_LABELS: Record<string, string> = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do not disturb',
  offline: 'Offline',
};

const STATUS_STYLES: Record<string, string> = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-400',
  dnd: 'bg-rose-500',
  offline: 'bg-slate-500',
};

export default function ProfileSidebar({ avatarUrl, discordStatus, skills }: ProfileSidebarProps) {
  const statusKey = discordStatus?.status ?? 'offline';
  const statusLabel = STATUS_LABELS[statusKey] ?? 'Offline';
  const statusClass = STATUS_STYLES[statusKey] ?? STATUS_STYLES.offline;

  let presenceLabel = 'Status';
  let presenceLine = 'Learning and growing every day.';

  if (discordStatus?.spotify) {
    presenceLabel = 'Listening';
    presenceLine = `${discordStatus.spotify.song} - ${discordStatus.spotify.artist}`;
  } else if (discordStatus?.activity) {
    switch (discordStatus.activity.type) {
      case 0:
        presenceLabel = 'Playing';
        break;
      case 1:
        presenceLabel = 'Streaming';
        break;
      case 2:
        presenceLabel = 'Listening';
        break;
      case 3:
        presenceLabel = 'Watching';
        break;
      case 5:
        presenceLabel = 'Competing';
        break;
      default:
        presenceLabel = 'Activity';
        break;
    }
    presenceLine = discordStatus.activity.name;
  } else if (discordStatus?.customStatus) {
    presenceLabel = 'Message';
    presenceLine = discordStatus.customStatus;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-6">
      <div className="relative z-10">
        <div className="js-profile-item flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[var(--home-border)] bg-[var(--home-soft)]">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Profile avatar" width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-semibold text-[var(--home-ink)]">P</span>
              )}
            </div>
            <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[var(--home-card)] ${statusClass}`} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Profile</p>
            <h2 className="text-2xl font-sans font-semibold text-[var(--home-ink)]">Phy0n</h2>
            <p className="text-sm text-[var(--home-muted)]">@Phy0n</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="js-profile-item rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-1 text-xs text-[var(--home-muted)]">
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-4 border-t border-[var(--home-border)] pt-5">
          <div className="js-profile-item flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">{presenceLabel}</p>
            <div className="flex items-center gap-2 text-xs text-[var(--home-muted)]">
              <span className={`h-2 w-2 rounded-full ${statusClass}`} />
              {statusLabel}
            </div>
          </div>
          <p className="js-profile-item text-sm leading-relaxed text-[var(--home-ink)]">{presenceLine}</p>
          <div className="js-profile-item border-l-2 border-[var(--home-accent)] pl-4 text-sm text-[var(--home-muted)]">
            The best revenge is to make yourself better.
          </div>
          {discordStatus ? <DiscordActivitySection discordStatus={discordStatus} /> : null}
        </div>
      </div>
    </div>
  );
}
