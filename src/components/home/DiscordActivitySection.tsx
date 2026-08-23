'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Gamepad2, Headphones, Trophy, Video, Waves } from 'lucide-react';
import { FaSpotify } from 'react-icons/fa';

import type { DiscordActivity, DiscordStatus } from './types';

interface DiscordActivitySectionProps {
  discordStatus: DiscordStatus;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatClock = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const useTickingNow = (enabled: boolean) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return now;
};

const getActivityLabel = (activity: DiscordActivity) => {
  switch (activity.type) {
    case 0:
      return { label: `Playing ${activity.name}`, Icon: Gamepad2, accent: 'text-sky-300' };
    case 1:
      return { label: `Streaming ${activity.name}`, Icon: Video, accent: 'text-violet-300' };
    case 2:
      return { label: `Listening to ${activity.name}`, Icon: Headphones, accent: 'text-amber-300' };
    case 3:
      return { label: `Watching ${activity.name}`, Icon: Eye, accent: 'text-emerald-300' };
    case 5:
      return { label: `Competing in ${activity.name}`, Icon: Trophy, accent: 'text-rose-300' };
    default:
      return { label: activity.name, Icon: Waves, accent: 'text-[var(--home-muted)]' };
  }
};

const SpotifyCard = ({
  spotify,
  now,
}: {
  spotify: NonNullable<DiscordStatus['spotify']>;
  now: number;
}) => {
  const { progress, elapsedLabel, durationLabel } = useMemo(() => {
    const start = spotify.timestamps?.start;
    const end = spotify.timestamps?.end;
    if (typeof start !== 'number' || typeof end !== 'number' || end <= start) {
      return { progress: null as number | null, elapsedLabel: null as string | null, durationLabel: null as string | null };
    }

    const duration = end - start;
    const elapsed = clamp(now - start, 0, duration);
    const nextProgress = clamp(elapsed / duration, 0, 1);

    return {
      progress: nextProgress,
      elapsedLabel: formatClock(elapsed),
      durationLabel: formatClock(duration),
    };
  }, [now, spotify.timestamps?.end, spotify.timestamps?.start]);

  return (
    <div className="flex flex-col w-full p-4 rounded-xl bg-[var(--home-card)]/30 backdrop-blur-sm border border-[var(--home-border)] text-left transition-all duration-300 hover:border-[var(--home-accent)]/50 hover:bg-[var(--home-card)]/80">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1DB954] flex items-center gap-1.5">
          <FaSpotify className="h-3.5 w-3.5" />
          Listening to Spotify
        </p>
        {spotify.songUrl && (
          <a
            href={spotify.songUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] uppercase tracking-wider text-[var(--home-muted)] opacity-70 transition hover:text-[#1DB954] hover:opacity-100 font-bold">
            Open
          </a>
        )}
      </div>

      <div className="flex items-start gap-3.5">
        <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-xl bg-[var(--home-soft)] shadow-inner">
          {spotify.albumArtUrl ? (
            <Image
              src={spotify.albumArtUrl}
              alt={`Album art for ${spotify.song}`}
              fill
              sizes="64px"
              className="object-cover"/>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#1DB954]">
              <FaSpotify className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow min-w-0 pt-0.5">
          {spotify.songUrl ? (
            <a
              href={spotify.songUrl}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-[15px] font-bold text-[var(--home-ink)] transition hover:text-[#1DB954] leading-tight mb-0.5"
              title={spotify.song}>
              {spotify.song}
            </a>
          ) : (
            <p className="truncate text-[15px] font-bold text-[var(--home-ink)] leading-tight mb-0.5" title={spotify.song}>
              {spotify.song}
            </p>
          )}

          <p className="truncate text-[13px] text-[var(--home-muted)] leading-snug" title={spotify.artist}>
            by {spotify.artist}
          </p>
          <p className="truncate text-[13px] text-[var(--home-muted)] leading-snug" title={spotify.album}>
            on {spotify.album}
          </p>

          {progress !== null && elapsedLabel && durationLabel && (
            <div className="mt-2 space-y-1.5 w-full">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--home-soft)] border border-[var(--home-border)]/50">
                <div className="h-full rounded-full bg-[#1DB954]" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium text-[var(--home-muted)] tabular-nums">
                <span>{elapsedLabel}</span>
                <span>{durationLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActivityCard = ({ activity, now }: { activity: DiscordActivity; now: number }) => {
  const { label, Icon, accent } = getActivityLabel(activity);

  const elapsedLabel = useMemo(() => {
    const start = activity.timestamps?.start;
    if (typeof start !== 'number') return null;
    return formatClock(Math.max(0, now - start));
  }, [activity.timestamps?.start, now]);

  return (
    <div className="flex flex-col w-full p-4 rounded-xl bg-[var(--home-card)]/30 backdrop-blur-sm border border-[var(--home-border)] text-left transition-all duration-300 hover:border-[var(--home-accent)]/50 hover:bg-[var(--home-card)]/80">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-3.5 w-3.5 text-[var(--home-muted)]`} />
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--home-muted)]">{label}</p>
      </div>

      <div className="flex items-start gap-3.5">
        <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-xl bg-[var(--home-soft)] shadow-inner">
          {activity.largeImage ? (
            <Image
              src={activity.largeImage}
              alt={activity.assets?.largeText ?? `Activity artwork for ${activity.name}`}
              fill
              sizes="64px"
              className="object-cover"/>
          ) : activity.applicationId ? (
            <Image
              src={`https://dcdn.dstn.to/app-icons/${activity.applicationId}`}
              alt={`App icon for ${activity.name}`}
              fill
              sizes="64px"
              className="object-cover"/>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--home-muted)] opacity-50">
              <Icon className="h-6 w-6" />
            </div>
          )}

          {activity.smallImage && (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 overflow-hidden rounded-full border-2 border-[var(--home-card)] bg-[var(--home-soft)]">
              <Image src={activity.smallImage} alt="" fill sizes="24px" className="object-cover" />
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow min-w-0 pt-0.5">
          <p className="truncate text-[15px] font-bold text-[var(--home-ink)] leading-tight mb-0.5" title={activity.name}>
            {activity.name}
          </p>

          {activity.details && (
            <p className="truncate text-[13px] text-[var(--home-muted)] leading-snug" title={activity.details ?? undefined}>
              {activity.details}
            </p>
          )}

          {activity.state && (
            <p className="truncate text-[13px] text-[var(--home-muted)] leading-snug" title={activity.state ?? undefined}>
              {activity.state}
            </p>
          )}

          {elapsedLabel && (
            <p className="text-[#23a559] text-[13px] font-medium flex items-center gap-1.5 mt-0.5">
              <Icon className="h-[12px] w-[12px]" />
              {elapsedLabel} elapsed
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DiscordActivitySection({ discordStatus }: DiscordActivitySectionProps) {
  const spotify = discordStatus.spotify ?? null;
  const activity = discordStatus.activity ?? null;

  const needsTicker = Boolean(spotify?.timestamps?.start && spotify?.timestamps?.end) || Boolean(activity?.timestamps?.start);
  const now = useTickingNow(needsTicker);

  if (!spotify && !activity) return null;

  return (
    <div className="js-profile-item space-y-3">
      {spotify ? <SpotifyCard spotify={spotify} now={now} /> : null}
      {activity ? <ActivityCard activity={activity} now={now} /> : null}
    </div>
  );
}
