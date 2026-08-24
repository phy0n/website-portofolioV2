import Image from 'next/image';
import Link from 'next/link';
import { getSiteProfile } from '@/lib/site-profile';
import { FaInstagram, FaTiktok, FaDiscord, FaGlobe, FaBook, FaBlog, FaUsers, FaGithub, FaCode, FaDumbbell, FaMusic, FaFilm, FaCoffee, FaMapMarkerAlt, FaYoutube, FaFire } from 'react-icons/fa';
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
import CustomMusicPlayerWidget from '@/components/home/CustomMusicPlayerWidget';
import MinecraftProfileWidget from '@/components/home/MinecraftProfileWidget';
import ValorantProfileWidget from '@/components/home/ValorantProfileWidget';
import EnterScreen from '@/components/home/EnterScreen';
import EnterPortfolioButton from '@/components/home/EnterPortfolioButton';
import GamesPlayedWidget from '@/components/home/GamesPlayedWidget';

export default async function Page() {
  const { profileImageUrl } = await getSiteProfile();

  const links = [
    {
      title: 'Instagram',
      subtitle: '@phy0n.me',
      url: 'https://instagram.com/phy0n.me',
      icon: <FaInstagram className="text-3xl text-white drop-shadow-md" />,
      color: 'transition-all duration-300',
    },
    {
      title: 'TikTok',
      subtitle: '@phy0n',
      url: 'https://www.tiktok.com/@phy0n',
      icon: <FaTiktok className="text-3xl text-white drop-shadow-md" />,
      color: 'transition-all duration-300',
    },
    {
      title: 'YouTube',
      subtitle: '@PhionRushandle',
      url: 'https://youtube.com/@PhionRushandle',
      icon: <FaYoutube className="text-3xl text-white drop-shadow-md" />,
      color: 'transition-all duration-300',
    },
    {
      title: 'Github',
      subtitle: '@phy0n',
      url: 'https://github.com/phy0n',
      icon: <FaGithub className="text-3xl text-white drop-shadow-md" />,
      color: 'transition-all duration-300',
    },
    {
      title: 'Discord Server',
      subtitle: 'discord.gg/kh1ev',
      url: 'https://discord.gg/MwNE7Vfb6t',
      icon: <FaDiscord className="text-3xl text-white drop-shadow-md" />,
      color: 'transition-all duration-300',
    },
    {
      title: 'Personal Blog',
      subtitle: 'phy0n.site/blog',
      url: 'https://phy0n.site/blog',
      icon: <FaBook className="text-3xl text-white drop-shadow-md" />,
      color: 'transition-all duration-300',
    },
    {
      title: 'Kh1ev Community',
      subtitle: 'kh1ev.my.id',
      url: 'https://kh1ev.my.id/',
      icon: <FaFire className="text-3xl text-white drop-shadow-md" />,
      color: 'transition-all duration-300',
    },

    {
      title: 'Roblox Profile',
      subtitle: '@Phy0nn',
      url: 'https://www.roblox.com/users/8883015179/profile',
      icon: <SiRoblox className="text-3xl text-white drop-shadow-md" />,
      color: 'transition-all duration-300',
    },
    {
      title: 'SociaBuzz',
      subtitle: 'Support & Donate',
      url: 'https://sociabuzz.com/phionne/tribe',
      icon: <FaCoffee className="text-3xl text-white drop-shadow-md" />,
      color: 'transition-all duration-300',
    },
  ];

  return (
    <>
      <EnterScreen />
      <div className="min-h-screen relative flex flex-col items-center py-16 px-4 overflow-hidden bg-transparent text-white font-nunito selection:bg-white/20">
        <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col xl:flex-row justify-center items-start gap-8 mt-8 opacity-0 translate-y-12 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] [.content-visible_&]:opacity-100 [.content-visible_&]:translate-y-0">
          <aside className="hidden xl:flex w-[350px] flex-col gap-6 sticky top-24 pt-10 shrink-0">
            {/* <DiscordServerWidget /> */}
            {/* <RobloxProfileWidget /> */}
            {/* <GamesPlayedWidget /> */}
            {/* <MinecraftProfileWidget /> */}
          </aside>

          <main className="w-full max-w-[440px] flex flex-col items-center mx-auto shrink-0">
            <DiscordProfile fallbackImageUrl={profileImageUrl ?? ''} />

            <h1 className="text-3xl font-bold tracking-tight mb-0.5 text-center text-white/90 leading-tight">Phion Rushandle</h1>

            <div className="flex items-center justify-center gap-2 mb-4 mt-1">
              <p className="text-white font-semibold text-sm">@phy0n</p>
              <DiscordBadges />
            </div>

            <div className="flex flex-nowrap justify-center items-center gap-1.5 sm:gap-2 mb-8 px-2 w-full max-w-full overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-[11px] sm:text-[13px] font-medium px-3 sm:px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 whitespace-nowrap shrink-0">
                <FaMapMarkerAlt className="text-white/70 text-[10px] sm:text-[12px]" />
                Singapore
              </div>
              <LocalTimeWeather />
              <ViewCounter />
            </div>

            <div className="w-full flex flex-col mb-8 px-2">
              <div className="w-full flex flex-col overflow-hidden">
                <DiscordStatus />
                <CustomMusicPlayerWidget />
              </div>
            </div>

            <div className="w-full flex justify-center mb-10 px-1 sm:px-2">
              <div className="flex flex-nowrap items-center justify-center gap-1 sm:gap-1.5 p-2">
                {links.map((link) => (
                  <a
                    key={link.title}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`cursor-pointer group relative flex flex-shrink-0 items-center justify-center w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-xl transition-all duration-300 active:scale-[0.98] ${link.color}`}>
                    <div className="flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-300 scale-[0.75] sm:scale-[0.85]">
                      {link.icon}
                    </div>
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0d0d0d] border border-white/10 text-white/90 text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl z-50">
                    {link.title}
                  </span>
                </a>
              ))}
              </div>
            </div>

            <div className="w-full relative">
              <EnterPortfolioButton />
            </div>
            <div className="xl:hidden w-full mt-8 flex flex-col gap-6">
              {/* <GamesPlayedWidget /> */}
            </div>
          </main>

          <aside className="hidden xl:flex w-[350px] flex-col gap-6 sticky top-24 pt-10 shrink-0">
            {/* <SpotifyPlaylistWidget /> */}
            {/* <RandomImageWidget /> */}
            {/* <ValorantProfileWidget /> */}
          </aside>

        </div>
      </div>
    </>
  );
}
