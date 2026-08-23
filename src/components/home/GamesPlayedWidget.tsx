import { FaGamepad, FaCube } from 'react-icons/fa';
import { SiFivem, SiRockstargames, SiValorant, SiRoblox } from 'react-icons/si';

export default function GamesPlayedWidget() {
  const games = [
    {
      name: 'FiveM', icon: <SiFivem className="text-2xl" />, iconColor: 'group-hover/card:text-orange-500', colorHover: 'hover:border-orange-500/40 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]',
      bgImage: '/image/fiveM.png'
    },
    {
      name: 'GTA V', icon: <SiRockstargames className="text-2xl" />, iconColor: 'group-hover/card:text-green-500', colorHover: 'hover:border-green-500/40 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]',
      bgImage: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg'
    },
    {
      name: 'RDR II', icon: <SiRockstargames className="text-2xl" />, iconColor: 'group-hover/card:text-red-600', colorHover: 'hover:border-red-600/40 hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]',
      bgImage: 'https://images.unsplash.com/photo-1498855926480-d98e83099315?q=80&w=600'
    },
    {
      name: 'Valorant', icon: <SiValorant className="text-2xl" />, iconColor: 'group-hover/card:text-red-500', colorHover: 'hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]',
      bgImage: '/image/valorant.jpg'
    },
    {
      name: 'Roblox', icon: <SiRoblox className="text-2xl" />, iconColor: 'group-hover/card:text-white', colorHover: 'hover:border-zinc-400/40 hover:shadow-[0_0_15px_rgba(161,161,170,0.2)]',
      bgImage: '/image/roblox.png'
    },
    {
      name: 'Minecraft', icon: <FaCube className="text-2xl" />, iconColor: 'group-hover/card:text-emerald-500', colorHover: 'hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      bgImage: '/image/minecraft.png'
    },
  ];

  return (
    <div className="hidden sm:flex w-full flex-col rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 p-5 shadow-2xl relative group overflow-hidden">

      <div className="flex items-center gap-3 mb-5 relative z-10">
        <FaGamepad className="text-3xl text-white/70 group-hover:text-white transition-colors drop-shadow-md" />
        <span className="text-white/80 text-[13px] font-bold tracking-widest uppercase group-hover:text-white transition-colors">Games I Play</span>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        {games.map((game) => (
          <div
            key={game.name}
            className={`group/card relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 cursor-default transition-all duration-500 ${game.colorHover}`}
          >
            {/* Hover Background Image */}
            <div
              className="absolute inset-0 opacity-0 group-hover/card:opacity-40 transition-opacity duration-700 bg-cover bg-center z-0"
              style={{ backgroundImage: `url(${game.bgImage})` }}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />

            <div className={`relative z-10 text-white/50 transition-colors duration-300 ${game.iconColor}`}>
              {game.icon}
            </div>

            <span className="relative z-10 text-[11px] font-bold tracking-wide text-white/40 group-hover/card:text-white transition-colors duration-300 text-center leading-tight uppercase">
              {game.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
