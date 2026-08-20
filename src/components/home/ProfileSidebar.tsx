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
  dnd: 'Do Not Disturb',
  offline: 'Invisible',
};

const StatusIcon = ({ status, className = "" }: { status: string, className?: string }) => {
  const color = status === 'online' ? '#23a559' : status === 'idle' ? '#f0b232' : status === 'dnd' ? '#ed4245' : '#80848e';
  
  return (
    <svg viewBox="0 0 24 24" className={className}>
      {status === 'online' && (
        <circle cx="12" cy="12" r="12" fill={color} />
      )}
      {status === 'idle' && (
        <path fill={color} fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM10.5 4.5C10.5 7.81371 7.81371 10.5 4.5 10.5C4.24965 10.5 4.00289 10.4845 3.76106 10.4545C5.07478 14.8876 9.17646 18 13.5 18C19.299 18 24 13.299 24 7.5C24 6.78652 23.9288 6.09015 23.7937 5.4178C22.6515 8.91971 19.3496 11.5 15.5 11.5C11.3579 11.5 8 8.14214 8 4C8 3.53982 8.0414 3.08933 8.12035 2.65175C9.37893 3.82103 10.5 4.5 10.5 4.5Z" />
      )}
      {status === 'dnd' && (
        <path fill={color} fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM17 14.5H7V9.5H17V14.5Z" />
      )}
      {status === 'offline' && (
        <path fill={color} fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5899 5.5 12 5.5C8.41015 5.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5Z" />
      )}
    </svg>
  );
};

export default function ProfileSidebar({ avatarUrl, discordStatus, skills }: ProfileSidebarProps) {
  const statusKey = discordStatus?.status ?? 'offline';
  const statusLabel = STATUS_LABELS[statusKey] ?? 'Offline';

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
            {/* The wrapper bg matches the card background to give a cutout effect */}
            <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--home-card)]">
              <StatusIcon status={statusKey} className="h-4 w-4" />
            </div>
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
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--home-muted)]">
              <StatusIcon status={statusKey} className="h-3 w-3" />
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
