import { FaGamepad, FaArrowRight } from 'react-icons/fa';

async function getRobloxData() {
  try {
    const userRes = await fetch('https://users.roblox.com/v1/users/8883015179', { next: { revalidate: 3600 } });
    if (!userRes.ok) return null;
    const userData = await userRes.json();

    const fullBodyRes = await fetch('https://thumbnails.roblox.com/v1/users/avatar?userIds=8883015179&size=720x720&format=Png&isCircular=false', { next: { revalidate: 3600 } });
    let characterUrl = null;
    if (fullBodyRes.ok) {
      const fullBodyData = await fullBodyRes.json();
      if (fullBodyData?.data?.[0]?.imageUrl) {
        characterUrl = fullBodyData.data[0].imageUrl;
      }
    }

    return { userData, characterUrl };
  } catch (error) {
    console.error("Failed to fetch Roblox data:", error);
    return null;
  }
}

export default async function RobloxProfileWidget() {
  const data = await getRobloxData();

  const name = data?.userData?.name || 'Phy0nn';
  const displayName = data?.userData?.displayName || '4phy0n';
  const characterUrl = data?.characterUrl || null;

  return (
    <a 
      href="https://www.roblox.com/users/8883015179/profile" 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-full flex flex-col rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl p-4 gap-4 relative group cursor-pointer transition-all duration-300 hover:border-white/25 active:scale-[0.98]"
    >
      <div className="flex items-center justify-between w-full px-1 relative z-10">
        <div className="flex items-center gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg" className="w-4 h-4 opacity-50 invert" alt="Roblox" />
          <span className="text-[11px] font-bold text-white/40 tracking-widest uppercase">Roblox Profile</span>
        </div>
      </div>

      <div className="w-full h-[260px] bg-black/40 rounded-xl relative flex items-center justify-center overflow-hidden border border-white/5 transition-colors group-hover:border-white/10">
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        {characterUrl ? (
          <img
            src={characterUrl}
            alt="Roblox Character"
            className="w-full h-full object-contain p-2 relative z-10 drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]"
          />
        ) : (
          <FaGamepad className="text-white/10 text-6xl relative z-10 mb-10" />
        )}
      </div>

      <div className="flex flex-col text-center px-2 pt-1 pb-2 relative z-10">
        <h3 className="text-white font-bold text-[18px] leading-tight tracking-wide">{displayName}</h3>
        <p className="text-zinc-500 font-semibold text-[13px] mt-0.5">@{name}</p>
        
        <div className="mx-auto mt-4 flex items-center gap-1.5 text-[11px] font-bold text-white/30 uppercase tracking-widest transition-all group-hover:text-white/70">
          <span>View Profile</span>
          <FaArrowRight className="text-[10px] transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </a>
  );
}
