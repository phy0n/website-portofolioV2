'use client';

import { useLanyard } from 'use-lanyard';

const DISCORD_ID = '494169184175915019';

export default function DiscordProfile({ fallbackImageUrl }: { fallbackImageUrl: string }) {
  const status = useLanyard(DISCORD_ID);

  const user = status?.discord_user;
  const decoration = (user as any)?.avatar_decoration_data?.asset;
  let imageUrl = fallbackImageUrl;
  if (user?.avatar) {
    const isGif = user.avatar.startsWith('a_');
    imageUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${isGif ? 'gif' : 'png'}?size=512`;
  }

  let statusColor = 'bg-gray-500';
  if (status?.discord_status === 'online') statusColor = 'bg-[#23a559]';
  if (status?.discord_status === 'idle') statusColor = 'bg-[#f0b232]';
  if (status?.discord_status === 'dnd') statusColor = 'bg-[#f23f43]';

  return (
    <div className="relative flex justify-center mb-5 w-32 h-32 mx-auto">
      <div className="relative w-full h-full rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-zinc-900 group shadow-2xl z-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold">
            P
          </div>
        )}
      </div>

      <div className={`absolute bottom-1 right-1 h-[22px] w-[22px] ${statusColor} border-4 border-[#0a0a0a] rounded-full z-20 transition-colors duration-500`}></div>
      {decoration && (
        <div className="absolute inset-[-12%] z-10 pointer-events-none">
          <img
            src={`https://cdn.discordapp.com/avatar-decoration-presets/${decoration}.png?size=256`}
            alt="Avatar Decoration"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
