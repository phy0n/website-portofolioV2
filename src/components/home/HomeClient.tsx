'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Volume2, VolumeX } from 'lucide-react';

import ProfileSidebar from './ProfileSidebar';
import TabBar from './TabBar';
import AboutTab from './tabs/AboutTab';
import ConnectTab from './tabs/ConnectTab';
import type { DiscordStatus, HomeTab, RobloxProfile } from './types';

function TabFallback({ title }: { title: string }) {
  return (
    <div className="animate-slide-down">
      <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10">
        <p className="text-white/60 font-mono text-xs sm:text-sm">Loading {title}…</p>
      </div>
    </div>
  );
}

const GamesTab = dynamic(() => import('./tabs/GamesTab'), {
  ssr: false,
  loading: () => <TabFallback title="games" />,
});
const SkillsTab = dynamic(() => import('./tabs/SkillsTab'), {
  ssr: false,
  loading: () => <TabFallback title="skills" />,
});
const ExperienceTab = dynamic(() => import('./tabs/ExperienceTab'), {
  ssr: false,
  loading: () => <TabFallback title="experience" />,
});
const ProjectsTab = dynamic(() => import('./tabs/ProjectsTab'), {
  ssr: false,
  loading: () => <TabFallback title="projects" />,
});
const CertificatesTab = dynamic(() => import('./tabs/CertificatesTab'), {
  ssr: false,
  loading: () => <TabFallback title="certificates" />,
});
const ContactTab = dynamic(() => import('./tabs/ContactTab'), {
  ssr: false,
  loading: () => <TabFallback title="contact" />,
});

const PROFILE_SKILLS = ['Developer'];

export default function HomeClient() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<HomeTab>('connect');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [useVideo, setUseVideo] = useState<boolean>(true);
  const [videoReady, setVideoReady] = useState<boolean>(false);
  const [videoSourceIndex, setVideoSourceIndex] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cursorGlowRef = useRef<HTMLDivElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [robloxProfile, setRobloxProfile] = useState<RobloxProfile | null>(null);
  const [robloxLoading, setRobloxLoading] = useState<boolean>(false);
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(null);

  const VIDEO_SOURCES = ['/video/video.mp4', '/video/video2.mp4'] as const;

  const fetchRobloxProfile = async (userId?: string) => {
    setRobloxLoading(true);
    try {
      const targetUserId = userId || '8883015179';
      const response = await fetch(`/api/roblox-profile?userId=${targetUserId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile = await response.json();
      setRobloxProfile(profile);
    } catch (err) {
      console.error('Failed to fetch Roblox profile:', err);
      setRobloxProfile(null);
    } finally {
      setRobloxLoading(false);
    }
  };

  useEffect(() => {
    // User requested background video always.
    const allowVideo = true;

    // Defer mounting the video until the browser is idle so UI shows immediately.
    const schedule = (fn: () => void) => {
      const w = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
      if (w.requestIdleCallback) {
        w.requestIdleCallback(fn, { timeout: 1500 });
      } else {
        window.setTimeout(fn, 300);
      }
    };

    // Enable video immediately; only defer secondary work.
    setUseVideo(allowVideo);

    const fetchAvatar = async () => {
      try {
        const res = await fetch('/api/discord-avatar');
        const data = await res.json();
        setAvatarUrl(data.avatarUrl || null);
      } catch (err) {
        console.error('Failed to fetch avatar:', err);
      }
    };

    const fetchDiscordStatus = async () => {
      try {
        const res = await fetch('/api/discord-status');
        const data = await res.json();
        if (!data.error) {
          setDiscordStatus(data);
        }
      } catch (err) {
        console.error('Failed to fetch Discord status:', err);
      }
    };

    // Defer network calls so the main UI can paint first.
    schedule(() => {
      fetchAvatar();
      fetchDiscordStatus();
    });

    const statusInterval = window.setInterval(fetchDiscordStatus, 30000);

    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    // Prefetch other tab chunks when idle to avoid blank/slow tab switches.
    schedule(() => {
      import('./tabs/GamesTab');
      import('./tabs/SkillsTab');
      import('./tabs/ExperienceTab');
      import('./tabs/ProjectsTab');
      import('./tabs/CertificatesTab');
      import('./tabs/ContactTab');
    });

    return () => {
      window.removeEventListener('resize', checkIfMobile);
      clearInterval(statusInterval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    let rafId: number | null = null;
    let latestX = 0;
    let latestY = 0;

    const apply = () => {
      rafId = null;
      const el = cursorGlowRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${latestX - 64}px, ${latestY - 64}px, 0)`;
    };

    const handleMouseMove = (e: MouseEvent): void => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(apply);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((e: Error) => console.log('Audio play error:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    setVideoReady(false);
  }, [useVideo]);

  useEffect(() => {
    if (!useVideo) return;
    const video = videoRef.current;
    if (!video) return;
    // Ensure the browser starts fetching and attempts autoplay.
    try {
      video.load();
    } catch {
      // ignore
    }

    video.play().catch((e) => console.log('Video play error:', e));

    // Fallback: some browsers/dev setups don't fire loaded events reliably.
    const t = window.setTimeout(() => setVideoReady(true), 1500);
    return () => window.clearTimeout(t);
  }, [useVideo, videoSourceIndex]);

  useEffect(() => {
    if (activeTab === 'games' && !robloxProfile && !robloxLoading) {
      fetchRobloxProfile();
    }
  }, [activeTab, robloxLoading, robloxProfile]);

  return (
    <div
      className="min-h-screen bg-black relative overflow-hidden"
      style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace' }}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Lightweight fallback while video buffers (no image overlay) */}
        <div
          className={`absolute inset-0 w-full h-full bg-black transition-opacity duration-500 ${
            useVideo && videoReady ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Mount heavy video only when allowed and fade in when ready */}
        {useVideo && (
          <video
            key={videoSourceIndex}
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedData={() => setVideoReady(true)}
            onPlaying={() => setVideoReady(true)}
            onError={() => {
              console.warn('Background video failed to load/play:', VIDEO_SOURCES[videoSourceIndex]);
              const nextIndex = videoSourceIndex + 1;
              if (nextIndex < VIDEO_SOURCES.length) {
                setVideoReady(false);
                setVideoSourceIndex(nextIndex);
              } else {
                setUseVideo(false);
              }
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              videoReady ? 'opacity-50' : 'opacity-0'
            }`}
          >
            <source src={VIDEO_SOURCES[videoSourceIndex]} type="video/mp4" />
          </video>
        )}
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(white 1px, transparent 1px),
              linear-gradient(90deg, white 1px, transparent 1px) `,
            backgroundSize: '50px 50px',
          }}
        ></div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-white/[0.02] to-white/[0.05] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-white/[0.03] to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-white/[0.01] via-white/[0.02] to-transparent rounded-full blur-3xl"></div>

        {!isMobile && (
          <div
            ref={cursorGlowRef}
            className="absolute w-32 h-32 bg-white/[0.02] rounded-full blur-2xl transition-transform duration-200 ease-out pointer-events-none"
            style={{
              transform: 'translate3d(-9999px, -9999px, 0)',
              willChange: 'transform',
            }}
          ></div>
        )}
      </div>

      {/* Control Buttons - Fixed Top Right */}
      <div className="fixed top-3 sm:top-4 right-3 sm:right-6 z-50 flex items-center gap-2 sm:gap-3">
        {/* Music Toggle */}
        <button
          onClick={() => {
            const nextPlaying = !isPlaying;
            if (nextPlaying && !audioRef.current) {
              try {
                audioRef.current = new Audio('/music/music3.mp3');
                audioRef.current.loop = true;
              } catch (err) {
                console.log('Audio setup failed:', err);
              }
            }
            setIsPlaying(nextPlaying);
          }}
          className="p-2 sm:p-3 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/10 hover:border-white/30 hover:bg-white/[0.1] transition-all duration-300 hover:scale-110 transform group"
        >
          {isPlaying ? (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 group-hover:text-white transition-colors duration-300" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 group-hover:text-white/80 transition-colors duration-300" />
          )}
        </button>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 pt-15 sm:pt-24">
        <div className="max-w-6xl w-full">
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-t-2xl border border-white/10 border-b-0 p-2 sm:p-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500/80 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500/80 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500/80 rounded-full"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-white/60 text-xs sm:text-sm font-mono">~/Phy0n/portfolio</span>
              </div>
              <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-white/40" />
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl rounded-b-2xl shadow-2xl border border-white/10 border-t-0 overflow-hidden">
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-6 sm:mb-8">
                <ProfileSidebar avatarUrl={avatarUrl} discordStatus={discordStatus} skills={PROFILE_SKILLS} />

                <div className="flex-1">
                  <TabBar activeTab={activeTab} onChange={setActiveTab} />

                  <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
                    {activeTab === 'connect' && <ConnectTab />}
                    {activeTab === 'about' && <AboutTab />}
                    {activeTab === 'games' && (
                      <GamesTab robloxLoading={robloxLoading} robloxProfile={robloxProfile} onRetry={() => fetchRobloxProfile()} />
                    )}
                    {activeTab === 'skills' && <SkillsTab />}
                    {activeTab === 'experience' && <ExperienceTab />}
                    {activeTab === 'projects' && <ProjectsTab />}
                    {activeTab === 'certificates' && <CertificatesTab />}
                    {activeTab === 'contact' && <ContactTab />}
                  </div>
                </div>
              </div>

              <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-white/40 text-xs font-mono">
                  <span>© {new Date().getFullYear()} Phy0n</span>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <span>Always #W1thyou</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

