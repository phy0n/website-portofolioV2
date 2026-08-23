import { SiValorant } from 'react-icons/si';

export default function ValorantProfileWidget() {
  const name = 'phy0n';
  const tag = '#00000';
  const level = 30;
  const title = 'Iron 3';
  const rankIconUrl = 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/5/largeicon.png';


  return (
    <div className="w-full flex flex-col rounded-2xl bg-[#0a0a0a] border border-[#1e1f22] shadow-2xl p-4 gap-4 relative overflow-hidden group">

      <div className="flex items-center justify-between w-full px-1 relative z-10">
        <div className="flex items-center gap-2">
          <SiValorant className="w-4 h-4 text-white opacity-50" />
          <span className="text-[11px] font-bold text-white/40 tracking-widest uppercase">Valorant Profile</span>
        </div>
        <div className="bg-black/40 border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-white/50">
          Lv. {level}
        </div>
      </div>

      <div className="w-full h-[260px] bg-[#111214] rounded-xl relative flex items-center justify-center overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-10"></div>


        <img
          src={rankIconUrl}
          alt={title}
          className="w-32 h-32 object-contain relative z-20 drop-shadow-[0_10px_15px_rgba(255,70,85,0.2)] group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="flex flex-col text-center px-2 pt-1 pb-2 relative z-10">
        <h3 className="text-white font-bold text-[18px] leading-tight tracking-wide">{name}<span className="text-zinc-500 text-[14px]">{tag}</span></h3>
        <p className="text-[#ff4655] font-bold text-[13px] mt-0.5 uppercase tracking-wide">{title}</p>
      </div>
    </div>
  );
}
