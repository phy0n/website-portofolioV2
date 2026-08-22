import { FaDiscord } from 'react-icons/fa';

async function getDiscordData() {
  try {
    const res = await fetch('https://discord.com/api/v9/invites/kh1ev?with_counts=true', {
      next: { revalidate: 60 } // Cache for 1 minute
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch Discord data:", error);
    return null;
  }
}

export default async function DiscordServerWidget() {
  const data = await getDiscordData();
  
  // Fallback data if API fails
  const name = data?.guild?.name || 'Kh1ev Community';
  const members = data?.approximate_member_count || 0;
  const online = data?.approximate_presence_count || 0;
  
  let iconUrl = null;
  let bannerUrl = null;
  
  if (data?.guild?.id) {
    if (data.guild.icon) {
      iconUrl = `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png?size=256`;
    }
    if (data.guild.banner) {
      bannerUrl = `https://cdn.discordapp.com/banners/${data.guild.id}/${data.guild.banner}.png?size=512`;
    }
  }

  const description = data?.guild?.description || '';

  return (
    <div className="w-full flex flex-col rounded-2xl shadow-2xl overflow-hidden relative" style={{ backgroundColor: '#121212' }}>
      {/* Banner */}
      <div className="w-full h-40 bg-[#1e1f22] relative">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#5865F2]/40 to-[#5865F2]/10"></div>
        )}
      </div>
      
      <div className="px-6 pb-6 flex flex-col relative">
        {/* Avatar/Icon - Overlapping the banner */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden relative -mt-10 mb-4 border-4" style={{ backgroundColor: '#121212', borderColor: '#121212' }}>
          <div className="w-full h-full bg-[#5865F2] flex items-center justify-center rounded-xl overflow-hidden">
            {iconUrl ? (
              <img src={iconUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <FaDiscord className="text-white text-4xl" />
            )}
          </div>
        </div>

        {/* Server Info */}
        <div className="flex flex-col mb-5">
          <h3 className="text-white font-bold text-[20px] leading-tight tracking-wide">{name}</h3>
          {description && (
            <p className="text-zinc-400 text-[14px] font-medium mt-2.5 leading-relaxed line-clamp-3">
              {description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#23a559]"></div>
            <span className="text-zinc-300 text-[14px] font-semibold">{online.toLocaleString()} Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-500"></div>
            <span className="text-zinc-400 text-[14px] font-medium">{members.toLocaleString()} Members</span>
          </div>
        </div>

        <a
          href="https://discord.gg/kh1ev"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-[#23a559] hover:bg-[#1f934f] text-white font-bold text-[15px] rounded-xl transition-colors text-center shadow-lg active:scale-[0.98]"
        >
          Join Server
        </a>
      </div>
    </div>
  );
}
