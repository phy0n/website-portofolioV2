import { FaGamepad } from 'react-icons/fa';
import { TbBrandMinecraft } from 'react-icons/tb';

async function getMinecraftData() {
  try {
    const res = await fetch('https://api.mojang.com/users/profiles/minecraft/phy0n', { next: { revalidate: 3600 } });
    if (!res.ok) {
      return { name: 'phy0n', id: '8810c2eb31ea4fb18958095619ddf35d' };
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch Minecraft data:", error);
    return { name: 'phy0n', id: '8810c2eb31ea4fb18958095619ddf35d' };
  }
}

export default async function MinecraftProfileWidget() {
  const data = await getMinecraftData();
  const name = data?.name || 'phy0n';
  const characterUrl = `https://mc-heads.net/body/${name}/300`;

  return (
    <div className="w-full flex flex-col rounded-2xl bg-[#0a0a0a] border border-[#1e1f22] shadow-2xl p-4 gap-4 relative">
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-2">
          <TbBrandMinecraft className="w-4 h-4 opacity-50 text-white" />
          <span className="text-[11px] font-bold text-white/40 tracking-widest uppercase">Minecraft Profile</span>
        </div>
      </div>

      <div className="w-full h-[260px] bg-[#111214] rounded-xl relative flex items-center justify-center overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

        {characterUrl ? (
          <img
            src={characterUrl}
            alt="Minecraft Character"
            className="w-full h-full object-contain p-4 relative z-10 drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]"
          />
        ) : (
          <FaGamepad className="text-white/10 text-6xl relative z-10 mb-10" />
        )}
      </div>

      <div className="flex flex-col text-center px-2 pt-1 pb-2">
        <h3 className="text-white font-bold text-[18px] leading-tight tracking-wide">{name}</h3>
        <p className="text-zinc-500 font-semibold text-[13px] mt-0.5">Premium Player</p>
      </div>
    </div>
  );
}
