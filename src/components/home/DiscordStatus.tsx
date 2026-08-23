'use client';

import { useLanyard } from 'use-lanyard';
import { FaSpotify, FaGamepad } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const DISCORD_ID = '494169184175915019';

function getAssetUrl(appId: string | undefined, assetId: string | undefined) {
  if (!assetId || !appId) return '';
  const assetIdStr = String(assetId);
  if (assetIdStr.startsWith('mp:external/')) {
    return `https://media.discordapp.net/external/${assetIdStr.replace('mp:external/', '')}`;
  }
  return `https://cdn.discordapp.com/app-assets/${appId}/${assetIdStr}.png`;
}

function formatElapsedTime(startTimestamp: number) {
  const now = Date.now();
  const diff = Math.max(0, Math.floor((now - startTimestamp) / 1000));
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function DiscordStatus() {
  const status = useLanyard(DISCORD_ID);
  const [timeStr, setTimeStr] = useState('');

  const isPlayingSpotify = status?.spotify;
  const activities = status?.activities?.filter((a: any) => a.type === 0) || [];
  const currentActivity = activities.length > 0 ? activities[0] : null;

  useEffect(() => {
    const startTimestamp = currentActivity?.timestamps?.start;

    if (!startTimestamp) {
      setTimeStr('');
      return;
    }

    const interval = setInterval(() => {
      setTimeStr(formatElapsedTime(startTimestamp));
    }, 1000);

    setTimeStr(formatElapsedTime(startTimestamp));

    return () => clearInterval(interval);
  }, [currentActivity]);

  if (!status) return null;
  if (!isPlayingSpotify && !currentActivity) return null;

  return (
    <div className="w-full mb-8 flex flex-col items-center gap-3 animate-fade-in">
      {isPlayingSpotify && status.spotify && (
        <a
          href={`https://open.spotify.com/track/${status.spotify.track_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex w-full items-center gap-4 rounded-2xl p-4 bg-[#0d0d0d] border border-white/10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:border-[#1DB954]/50"
        >
          <div className="relative w-12 h-12 flex-shrink-0">
            <img
              src={status.spotify.album_art_url || ""}
              alt="Album Art"
              className="rounded-lg object-cover w-full h-full"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#0a0a0a] rounded-full p-0.5">
              <FaSpotify className="text-[#1DB954] text-xs" />
            </div>
          </div>
          <div className="flex flex-col flex-grow overflow-hidden">
            <p className="text-[#1DB954] text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse"></span>
              Listening to Spotify
            </p>
            <p className="text-white text-sm font-semibold truncate leading-tight">{status.spotify.song}</p>
            <p className="text-zinc-400 text-xs truncate leading-tight">by {status.spotify.artist}</p>
          </div>
        </a>
      )}

      {currentActivity && !isPlayingSpotify && (
        <div className="flex flex-col w-full p-4 rounded-2xl bg-[#0d0d0d] border border-white/10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)] text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-3">Playing</p>
          <div className="flex items-start gap-3.5">
            <div className="relative w-16 h-16 flex-shrink-0 bg-[#2b2d31] rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
              {currentActivity.assets?.large_image ? (
                <img
                  src={getAssetUrl(currentActivity.application_id, currentActivity.assets.large_image)}
                  alt="Game Art"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaGamepad className="text-zinc-500 text-2xl" />
              )}
            </div>
            <div className="flex flex-col flex-grow overflow-hidden pt-0.5">
              <p className="text-zinc-100 text-[15px] font-bold leading-tight mb-0.5 truncate">{currentActivity.name}</p>
              {currentActivity.details && <p className="text-zinc-300 text-[13px] truncate leading-snug">{currentActivity.details}</p>}
              {currentActivity.state && <p className="text-zinc-300 text-[13px] truncate leading-snug">{currentActivity.state}</p>}

              {timeStr && (
                <p className="text-[#23a559] text-[13px] font-medium flex items-center gap-1.5 mt-0.5">
                  <FaGamepad className="text-[12px]" />
                  {timeStr}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
