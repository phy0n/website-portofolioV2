'use client';
import { useLanyard } from 'use-lanyard';
import { useEffect, useState } from 'react';

const DISCORD_ID = '494169184175915019';

interface DiscordBadge {
  id: string;
  description: string;
  icon: string;
}

export default function DiscordBadges() {
  const status = useLanyard(DISCORD_ID);
  const user = status?.discord_user;
  const primaryGuild = (user as any)?.primary_guild;
  const [badges, setBadges] = useState<DiscordBadge[]>([]);

  useEffect(() => {
    fetch(`https://dcdn.dstn.to/profile/${DISCORD_ID}`)
      .then(res => res.json())
      .then(data => {
        if (data.badges) {
          setBadges(data.badges);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex items-center gap-1.5 justify-center">
      {/* Clan Badge */}
      {primaryGuild?.badge && (
        <div className="flex items-center gap-1 bg-[#111214] border border-white/10 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-zinc-300 tracking-wide cursor-pointer hover:bg-white/10 transition mr-1" title="Clan Badge">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={`https://cdn.discordapp.com/guild-tag-badges/${primaryGuild.identity_guild_id}/${primaryGuild.badge}.png`} 
            alt="Clan Badge" 
            className="w-3.5 h-3.5 object-contain"
          />
          <span className="leading-none mt-[1px]">{primaryGuild.tag}</span>
        </div>
      )}
      
      {/* Dynamic Profile Badges */}
      {badges.map((badge) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={badge.id}
          src={`https://cdn.discordapp.com/badge-icons/${badge.icon}.png`}
          alt={badge.description}
          className="w-[22px] h-[22px] object-contain cursor-pointer"
          title={badge.description}
        />
      ))}
    </div>
  );
}
