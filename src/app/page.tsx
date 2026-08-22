import Image from 'next/image';
import Link from 'next/link';
import { getSiteProfile } from '@/lib/site-profile';
import { FaInstagram, FaTiktok, FaDiscord, FaGlobe, FaBlog, FaUsers, FaGithub, FaCode, FaDumbbell, FaMusic, FaFilm, FaCoffee, FaMapMarkerAlt, FaYoutube } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa6';
import { SiRoblox } from 'react-icons/si';
import DiscordStatus from '@/components/home/DiscordStatus';
import DiscordProfile from '@/components/home/DiscordProfile';
import DiscordBadges from '@/components/home/DiscordBadges';
import ViewCounter from '@/components/home/ViewCounter';
import LocalTimeWeather from '@/components/home/LocalTimeWeather';
import RobloxProfileWidget from '@/components/home/RobloxProfileWidget';
import RandomImageWidget from '@/components/home/RandomImageWidget';
import DiscordServerWidget from '@/components/home/DiscordServerWidget';
import SpotifyPlaylistWidget from '@/components/home/SpotifyPlaylistWidget';

export default async function Page() {
  const { profileImageUrl } = await getSiteProfile();

  const links = [
    {
      title: 'Instagram',
      subtitle: '@rushandle',
      url: 'https://www.instagram.com/rushandle/',
      icon: <FaInstagram className="text-xl" />,
      color: 'bg-[#E1306C]',
    },
    {
      title: 'TikTok',
      subtitle: '@phy0n',
      url: 'https://www.tiktok.com/@phy0n',
      icon: <FaTiktok className="text-xl" />,
      color: 'bg-zinc-900',
    },
    {
      title: 'YouTube',
      subtitle: '@PhionRushandle',
      url: 'https://youtube.com/@PhionRushandle',
      icon: <FaYoutube className="text-xl" />,
      color: 'bg-[#FF0000]',
    },
    {
      title: 'GitHub',
      subtitle: '@phy0n',
      url: 'https://github.com/phy0n',
      icon: <FaGithub className="text-xl" />,
      color: 'bg-[#2b3137]',
    },
    {
      title: 'Discord Server',
      subtitle: 'discord.gg/kh1ev',
      url: 'https://discord.gg/MwNE7Vfb6t',
      icon: <FaDiscord className="text-xl" />,
      color: 'bg-[#5865F2]',
    },
    {
      title: 'Personal Blog',
      subtitle: 'phy0n.site/blog',
      url: 'https://phy0n.site/blog',
      icon: <FaBlog className="text-xl" />,
      color: 'bg-zinc-800',
    },
    {
      title: 'Kh1ev Community',
      subtitle: 'kh1ev.my.id',
      url: 'https://kh1ev.my.id/',
      icon: <FaUsers className="text-xl" />,
      color: 'bg-[#404EED]',
    },
    {
      title: '4Fun Clan Roblox',
      subtitle: '4funclan.site',
      url: 'https://4funclan.site/',
      icon: <SiRoblox className="text-xl" />,
      color: 'bg-zinc-900 border border-white/5',
    },
    {
      title: 'Roblox Profile',
      subtitle: '@Phy0nn',
      url: 'https://www.roblox.com/users/8883015179/profile',
      icon: <SiRoblox className="text-xl" />,
      color: 'bg-zinc-800',
    },
    {
      title: 'SociaBuzz',
      subtitle: 'Support & Donate',
      url: 'https://sociabuzz.com/phionne/tribe',
      icon: <FaCoffee className="text-xl" />,
      color: 'bg-yellow-600 hover:bg-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen relative flex flex-col items-center py-16 px-4 overflow-hidden bg-[#0a0a0a] text-white font-nunito selection:bg-white/20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col xl:flex-row justify-center items-start gap-8 mt-8">
        <aside className="hidden xl:flex w-[350px] flex-col gap-6 sticky top-24 pt-10 shrink-0">
          <DiscordServerWidget />
          <RobloxProfileWidget />
        </aside>

        <main className="w-full max-w-[440px] flex flex-col items-center mx-auto shrink-0">
          <DiscordProfile fallbackImageUrl={profileImageUrl ?? ''} />

          <h1 className="text-3xl font-bold tracking-tight mb-0.5 text-center text-white/90 leading-tight">Phion Rushandle</h1>

          <div className="flex items-center justify-center gap-2 mb-4 mt-1">
            <p className="text-zinc-400 font-semibold text-sm">@phy0n</p>
            <DiscordBadges />
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2 mb-8 px-4">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[13px] font-medium px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <FaMapMarkerAlt className="text-zinc-500 text-[12px]" />
              Singapore
            </div>
            <LocalTimeWeather />
            <ViewCounter />
          </div>

          <DiscordStatus />

          <div className="w-full space-y-3 mb-10">
            {links.map((link) => (
              <a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 active:scale-[0.98] ${link.color} border border-white/10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)] hover:border-white/25`}>
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-2 rounded-xl text-white">
                    {link.icon}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-[15px] tracking-wide text-white/95 leading-tight">{link.title}</span>
                    {link.subtitle && <span className="text-xs text-white/50 font-medium mt-0.5">{link.subtitle}</span>}
                  </div>
                </div>
                <FaArrowRight className="text-sm opacity-40 group-hover:opacity-100 transition-all" />
              </a>
            ))}
          </div>

          <div className="w-full relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-zinc-500 to-zinc-300 rounded-2xl blur opacity-20"></div>
            <Link
              href="/portfolio"
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-6 py-4.5 text-black transition-all duration-300 active:scale-[0.98] shadow-xl">
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-black/10" />
              </div>
              <FaGlobe className="text-xl" />
              <span className="font-bold text-lg tracking-tight">Enter Portfolio</span>
              <FaArrowRight className="text-sm opacity-70 transition-transform" />
            </Link>
          </div>
        </main>

        <aside className="hidden xl:flex w-[350px] flex-col gap-6 sticky top-24 pt-10 shrink-0">
          <SpotifyPlaylistWidget />
          <RandomImageWidget />
        </aside>

      </div>
    </div>
  );
}
