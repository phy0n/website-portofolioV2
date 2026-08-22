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

  let statusColor = 'text-gray-500';
  let statusSvg = (
    <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    </svg>
  );

  if (status?.discord_status === 'online') {
    statusColor = 'text-[#23a559]';
    statusSvg = (
      <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
  } else if (status?.discord_status === 'idle') {
    statusColor = 'text-[#f0b232]';
    statusSvg = (
      <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
        <path d="M12.1 22c5.5 0 10-4.5 10-10 0-5.2-4-9.6-9.1-9.9-.4 0-.8.4-.6.8 1.9 3.2 1.4 7.4-1.3 10.1-2.7 2.7-6.9 3.2-10.1 1.3-.4-.2-.8.2-.8.6.3 5.1 4.7 9.1 9.9 9.1z" />
      </svg>
    );
  } else if (status?.discord_status === 'dnd') {
    statusColor = 'text-[#f23f43]';
    statusSvg = (
      <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
      </svg>
    );
  }

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

      <div className={`absolute bottom-[2px] right-[2px] h-[28px] w-[28px] ${statusColor} bg-[#0a0a0a] rounded-full z-20 flex items-center justify-center p-1 transition-colors duration-500`}>
        {statusSvg}
      </div>
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
