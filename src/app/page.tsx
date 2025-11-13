'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Instagram, Code, Gamepad2, Music, Monitor, Heart, BookOpen, Briefcase, Award, Mail, Star, Terminal, MapPin, Clock, Lightbulb, Target, Palette, Globe, MessageCircle, Eye, Volume2, VolumeX} from 'lucide-react';
import { FaTiktok, FaDiscord } from 'react-icons/fa';

interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
  status: string;
}

interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
  status: string;
  icon: React.ReactNode;
}

interface Hobby {
  icon: React.ReactNode;
  text: string;
  color: string;
}

interface Skill {
  name: string;
  level: number;
  icon: React.ReactNode;
  category?: string;
}

interface Certificate {
  title: string;
  issuer: string;
  date: string;
  status: string;
  description: string;
  image: string;
  icon: React.ReactNode;
}

interface ContactInfo {
  type: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface SocialMedia {
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

interface RobloxProfile {
  username: string;
  displayName: string;
  description: string;
  created: string;
  isBanned: boolean;
  avatarUrl: string;
  friendsCount?: number;
  followersCount?: number;
}

interface DiscordStatus {
  online: boolean;
  status: string;
  activity?: {
    name: string;
    details?: string | null;
    state?: string | null;
    largeImage?: string | null;
  } | null;
  customStatus?: string | null;
  spotify?: {
    song: string;
    artist: string;
    album: string;
  } | null;
}

const PersonalPortfolio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTrack, setCurrentTrack] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>('connect');
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [useVideo, setUseVideo] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [viewCount, setViewCount] = useState<number>(0);
  const [robloxProfile, setRobloxProfile] = useState<RobloxProfile | null>(null);
  const [robloxLoading, setRobloxLoading] = useState<boolean>(false);
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(null);

  const experiences: Experience[] = [
    {
      role: "Website Developer",
      company: "Kh1ev Community",
      period: "2024 - 2025",
      description: "Working on the official website for Kh1ev Community, focusing on frontend development and user experience design.",
      status: "Current"
    },
  ];

  const projects: Project[] = [
    {
      title: "Kh1ev Project",
      description: "This is my kh1ev community website",
      tags: ["React", "TailwindCSS", "TypeScript"],
      link: "https://kh1ev.my.id/",
      status: "Live",
      icon: <Monitor className="w-4 h-4" />
    },
  ];

  const hobbies: Hobby[] = [
    { icon: <Code className="w-4 h-4" />, text: "Programming", color: "from-blue-500/20 to-cyan-500/20" },
    { icon: <Gamepad2 className="w-4 h-4" />, text: "Playing Game", color: "from-purple-500/20 to-pink-500/20" },
    { icon: <Music className="w-4 h-4" />, text: "Listening Music", color: "from-green-500/20 to-emerald-500/20" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Reading Comic", color: "from-orange-500/20 to-red-500/20" },
  ];

  const hardSkills: Skill[] = [
    { name: "Web Developer", level: 85, icon: <Code className="w-4 h-4" />, category: "Fullstack" },
  ];

  const softSkills: Skill[] = [
    { name: "Problem Solving", level: 90, icon: <Lightbulb className="w-4 h-4" /> },
    { name: "Adaptability", level: 88, icon: <Target className="w-4 h-4" /> },
    { name: "Time Management", level: 82, icon: <Clock className="w-4 h-4" /> },
    { name: "Creativity", level: 87, icon: <Palette className="w-4 h-4" /> }
  ];

  const certificates: Certificate[] = [
    {
      title: "Intro to Software Engineering",
      issuer: "RevoU",
      date: "2024",
      status: "Completed",
      description: "Just Intro to Software Engineering",
      image: "/image/certificates/certificate1.png",
      icon: <Award className="w-4 h-4" />
    },
  ];

  const contactInfo: ContactInfo[] = [
    {
      type: "Discord Account",
      value: "Phy0n",
      icon: <Mail className="w-4 h-4" />,
      color: "from-red-500/20 to-pink-500/20"
    },
    {
      type: "Location",
      value: "Surabaya, Indonesia",
      icon: <MapPin className="w-4 h-4" />,
      color: "from-blue-500/20 to-cyan-500/20"
    },
  ];

  const skills: string[] = ["Developer"];

  const socialMedia: SocialMedia[] = [
    {
      name: "Instagram",
      icon: <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: "https://www.instagram.com/phionrushandle/",
      color: "from-pink-500 to-red-500"
    },
    {
      name: "TikTok",
      icon: <FaTiktok className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: "https://www.tiktok.com/@phy0n",
      color: "from-black to-cyan-500"
    },
    {
      name: "Discord Server",
      icon: <FaDiscord className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: "https://discord.gg/MwNE7Vfb6t",
      color: "from-indigo-500 to-blue-500"
    },
  ];

  const fetchRobloxProfile = async (userId?: string) => {
    setRobloxLoading(true);
    try {
      const targetUserId = userId || '8883015179'; // Default user ID
      
      // Fetch from our API route to avoid CORS issues
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
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;

    if (connection) {
      if (connection.effectiveType === '4g' && !connection.saveData) {
        setUseVideo(true);
      }
    } else {
      setUseVideo(true);
    }

    const fetchAvatar = async () => {
      try {
        const res = await fetch('/api/discord-avatar');
        const data = await res.json();
        setAvatarUrl(data.avatarUrl || null);
      } catch (err) {
        console.error('Failed to fetch avatar:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();

    // Fetch Discord status
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

    fetchDiscordStatus();

    // Update Discord status every 30 seconds
    const statusInterval = setInterval(fetchDiscordStatus, 30000);

    // Initialize view counter with unique IP tracking
    const initViewCounter = async () => {
      try {
        // Get current count from localStorage
        const storedCount = parseInt(localStorage.getItem('portfolio-views') || '0');
        
        // Check with API if this is a new visitor
        const response = await fetch(`/api/view-count?current=${storedCount}`);
        const data = await response.json();
        
        if (!data.error) {
          // Update count based on API response
          setViewCount(data.count);
          localStorage.setItem('portfolio-views', data.count.toString());
        } else {
          // Fallback to stored count if API fails
          setViewCount(storedCount);
        }
      } catch (err) {
        console.error('Failed to fetch view count:', err);
        // Fallback to stored count
        const storedCount = parseInt(localStorage.getItem('portfolio-views') || '0');
        setViewCount(storedCount);
      }
    };

    initViewCounter();

    // Setup audio with auto-play
    try {
      audioRef.current = new Audio('/music/music3.mp3'); 
      audioRef.current.loop = true;

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });

      // Auto-play music
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("Auto-play prevented:", err);
          // Some browsers block auto-play, will need user interaction
        });
    } catch (err) {
      console.log("Audio setup failed:", err);
    }

    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
      clearInterval(statusInterval);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e: Error) => console.log("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Video play error:", e));
    }
  }, []);

  // Auto-load Roblox profile when Games tab is opened
  useEffect(() => {
    if (activeTab === 'games' && !robloxProfile && !robloxLoading) {
      fetchRobloxProfile();
    }
  }, [activeTab]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = (): void => setIsPlaying(!isPlaying);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * (audioRef.current.duration || 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace' }}>
      <div className="absolute inset-0 z-9 overflow-hidden">
        {useVideo ? (
          <video 
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-50">
            <source src="/video/video.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/video/anime-bg-poster.jpg"
              alt="Background"
              fill
              className="object-cover opacity-50"
              priority
            />
          </div>
        )}
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(white 1px, transparent 1px),
              linear-gradient(90deg, white 1px, transparent 1px) `,
            backgroundSize: '50px 50px'
          }}>
        </div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-white/[0.02] to-white/[0.05] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-white/[0.03] to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-white/[0.01] via-white/[0.02] to-transparent rounded-full blur-3xl"></div>

        {!isMobile && (
          <div
            className="absolute w-32 h-32 bg-white/[0.02] rounded-full blur-2xl transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: mousePosition.x - 64,
              top: mousePosition.y - 64,
            }}>
          </div>
        )}
      </div>

      {/* Control Buttons - Fixed Top Right */}
      <div className="fixed top-3 sm:top-4 right-3 sm:right-6 z-50 flex items-center gap-2 sm:gap-3">
        {/* View Counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/10 hover:border-white/20 transition-all duration-300">
          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
          <span className="text-white/80 font-mono text-xs sm:text-sm font-medium">{viewCount.toLocaleString()}</span>
        </div>

        {/* Music Toggle */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 sm:p-3 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/10 hover:border-white/30 hover:bg-white/[0.1] transition-all duration-300 hover:scale-110 transform group">
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
                <div className="text-left lg:text-left lg:min-w-[250px] xl:min-w-[300px]">
                  {/* Avatar */}
                  <div className="relative inline-block mb-4 sm:mb-6 group animate-stagger">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-full animate-pulse"></div>
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-white/10 to-white/[0.05] rounded-full p-1 shadow-2xl border border-white/20 group-hover:border-white/30 transition-all duration-500 animate-glow-pulse">
                      <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center overflow-hidden border border-white/10 relative">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden">
                          {avatarUrl && (
                            <Image
                              src={avatarUrl}
                              alt="Profile Photo"
                              width={96}
                              height={96}
                              className="object-cover hover:scale-110 transition-transform duration-500"
                              priority
                            />
                          )}
                        </div>
                      </div>
                      {discordStatus && (
                        <div className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-[3px] border-[#1a1b1e] ${
                          discordStatus.status === 'online' ? 'bg-green-500' :
                          discordStatus.status === 'idle' ? 'bg-yellow-500' :
                          discordStatus.status === 'dnd' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></div>
                      )}
                    </div>
                  </div>

                  {/* Name and username below avatar */}
                  <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-wide animate-slide-down">
                      <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent font-mono animate-gradient">
                        Phy0n
                      </span>
                      <span className="text-white/50 text-sm sm:text-base md:text-lg ml-1 sm:ml-2 font-mono">#LoveYou.</span>
                    </h1>
                    <div className="flex items-center justify-start gap-1 sm:gap-2 mb-2 sm:mb-4 animate-slide-down" style={{ animationDelay: '150ms' }}>
                      <span className="text-white/60 text-xs sm:text-sm font-mono">@Phy0n</span>
                      <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                      <span className="text-white/40 text-xs font-mono">Orang Gila</span>
                    </div>
                  </div>

                  {/* Developer tag below name/username */}
                  <div className="flex flex-wrap justify-start gap-1 sm:gap-2 mb-4 sm:mb-6 animate-stagger" style={{ animationDelay: '200ms' }}>
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-white/80 rounded-full text-[10px] xs:text-xs sm:text-xs border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer font-mono animate-fade-in"
                        style={{ animationDelay: `${index * 80}ms` }}>
                        <span className="text-white/40">&lt;</span>
                        {skill}
                        <span className="text-white/40">/&gt;</span>
                      </span>
                    ))}
                  </div>

                  {/* Custom Status */}
                  {discordStatus && discordStatus.customStatus && !discordStatus.activity && !discordStatus.spotify && (
                    <div className="mb-4 sm:mb-6 bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/15 transition-all duration-300 font-mono animate-stagger" style={{ animationDelay: '120ms' }}>
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
                        <span className="text-white/60 text-[10px] xs:text-xs sm:text-sm font-mono">status:</span>
                      </div>
                      <p className="text-white/80 text-[10px] xs:text-xs sm:text-sm leading-relaxed">
                        {discordStatus.customStatus}
                      </p>
                    </div>
                  )}

                  {/* Discord Activity Status */}
                  {discordStatus && discordStatus.activity && (
                    <div className="mb-4 sm:mb-6 bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/15 transition-all duration-300 font-mono animate-stagger" style={{ animationDelay: '140ms' }}>
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
                        <span className="text-white/60 text-[10px] xs:text-xs sm:text-sm font-mono">playing:</span>
                      </div>
                      <p className="text-white/80 text-[10px] xs:text-xs sm:text-sm font-bold mb-1">
                        {discordStatus.activity.name}
                      </p>
                      {discordStatus.activity.details && (
                        <p className="text-white/60 text-[10px] xs:text-xs leading-relaxed">
                          {discordStatus.activity.details}
                        </p>
                      )}
                      {discordStatus.activity.state && (
                        <p className="text-white/50 text-[10px] xs:text-xs leading-relaxed">
                          {discordStatus.activity.state}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Spotify Status */}
                  {discordStatus && discordStatus.spotify && (
                    <div className="mb-4 sm:mb-6 bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/15 transition-all duration-300 font-mono animate-stagger" style={{ animationDelay: '160ms' }}>
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <Music className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        <span className="text-white/60 text-[10px] xs:text-xs sm:text-sm font-mono">listening to:</span>
                      </div>
                      <p className="text-white/80 text-[10px] xs:text-xs sm:text-sm font-bold mb-1">
                        {discordStatus.spotify.song}
                      </p>
                      <p className="text-white/60 text-[10px] xs:text-xs">
                        by {discordStatus.spotify.artist}
                      </p>
                    </div>
                  )}

                  <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/15 transition-all duration-300 font-mono animate-stagger" style={{ animationDelay: '180ms' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white/60 text-xs sm:text-sm font-mono">motivation:</span>
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                      The best revenge is to make yourself better
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex border-b border-white/10 mb-4 sm:mb-6 md:mb-8 overflow-x-auto hide-scrollbar animate-stagger" style={{ animationDelay: '100ms' }}>
                    {['connect', 'about', 'games', 'skills', 'experience', 'projects', 'certificates', 'contact'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-mono font-medium relative transition-all duration-300 whitespace-nowrap cursor-pointer ${
                          activeTab === tab
                            ? 'text-white'
                            : 'text-white/50 hover:text-white/80'
                        }`}>
                        <span className="text-white/40">{activeTab === tab ? '>' : ''}</span>
                        {tab}
                        {activeTab === tab && (
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/60 to-white/30 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
                    {activeTab === 'connect' && (
                      <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-slide-down">
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4 font-mono">
                            <span className="text-white/40">~/</span>connect.links
                          </h2>
                          <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300">
                            <p className="text-white/70 leading-relaxed font-mono text-xs sm:text-sm mb-6">
                              Connect with me on social media! 🚀
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 md:mb-6 font-mono flex items-center gap-1 sm:gap-2">
                            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                            social.links
                          </h3>
                          <div className="grid grid-cols-1 gap-3 sm:gap-4 animate-stagger" style={{ animationDelay: '220ms' }}>
                            {socialMedia.map((social, index) => (
                              <a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden bg-white/[0.02] cursor-pointer animate-fade-in"
                                style={{ animationDelay: `${index * 80}ms` }}>
                                <div className="absolute inset-0 bg-black/10 transition-all duration-300 z-0"></div>
                                <div className="relative flex items-center gap-3 sm:gap-4 z-10">
                                  <div className="p-2 sm:p-4 bg-white/[0.05] rounded-lg border border-white/10 group-hover:bg-white/[0.08] group-hover:scale-110 transition-all duration-300">
                                    <div className="text-white/60 group-hover:text-white transition-colors duration-300 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                                      {social.icon}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-white text-xs sm:text-base font-bold font-mono group-hover:text-white transition-colors duration-300">
                                      {social.name}
                                    </h3>
                                    <p className="text-white/60 text-xs sm:text-sm font-mono mt-1">
                                      Click to visit →
                                    </p>
                                  </div>
                                  <div className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                                    <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'games' && (
                      <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-slide-down">
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4 font-mono">
                            <span className="text-white/40">~/</span>games.data
                          </h2>
                          <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                              <Gamepad2 className="w-5 h-5 text-white/60" />
                              <p className="text-white/70 leading-relaxed font-mono text-xs sm:text-sm">
                                My Gaming Profiles
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 md:mb-6 font-mono flex items-center gap-1 sm:gap-2">
                            <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            roblox.profile
                          </h3>
                          <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300">
                            {robloxLoading ? (
                              <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                                <p className="text-white/60 font-mono text-sm">Loading Roblox profile...</p>
                              </div>
                            ) : robloxProfile ? (
                              <div className="space-y-3 sm:space-y-4">
                                {/* Profile Picture & Name/Username - Horizontal */}
                                <div className="flex items-start gap-3 sm:gap-4">
                                  {/* Profile Picture - Left */}
                                  <div className="flex-shrink-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden border-2 border-white/20 bg-white/[0.02] shadow-lg">
                                      {robloxProfile.avatarUrl && (
                                        <Image
                                          src={robloxProfile.avatarUrl}
                                          alt="Roblox Avatar"
                                          width={112}
                                          height={112}
                                          className="object-cover w-full h-full"
                                          unoptimized
                                        />
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Display Name & Username - Right */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-white text-base sm:text-lg md:text-xl font-bold font-mono mb-1 truncate">
                                      {robloxProfile.displayName}
                                    </h3>
                                    <p className="text-white/60 text-xs sm:text-sm font-mono truncate">
                                      @{robloxProfile.username}
                                    </p>
                                  </div>
                                </div>

                                {/* Bio/Description - Full Width */}
                                {robloxProfile.description && (
                                  <div className="bg-white/[0.02] rounded-lg p-3 sm:p-4 border border-white/10">
                                    <p className="text-white/70 text-[10px] xs:text-xs sm:text-sm font-mono leading-relaxed">
                                      {robloxProfile.description}
                                    </p>
                                  </div>
                                )}

                                {/* View Profile Button - Full Width on Mobile */}
                                <a 
                                  href="https://www.roblox.com/users/8883015179/profile"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 rounded-lg text-white/60 hover:text-white text-xs sm:text-sm font-mono transition-all duration-300 text-center">
                                  View Profile →
                                </a>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-white/60 font-mono text-sm">Failed to load profile</p>
                                <button
                                  onClick={() => fetchRobloxProfile()}
                                  className="mt-4 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 rounded-lg text-white/80 font-mono text-sm transition-all duration-300">
                                  Retry
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'about' && (
                      <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-slide-down">
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4 font-mono">
                            <span className="text-white/40">~/</span>about.md
                          </h2>
                          <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300">
                            <p className="text-white/70 leading-relaxed font-mono text-xs sm:text-sm">
                              <span className="text-white/40">const</span> <span className="text-white">developer</span> = {'{'}
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">name:</span> <span className="text-green-400">Panggil Aja Phion</span>,
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">gender:</span> <span className="text-green-400">Man</span>,
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">age:</span> <span className="text-green-400">18 years old</span>,
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">role:</span> <span className="text-green-400">Fullstack Developer</span>,
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">passion:</span> <span className="text-green-400">Make good things</span>,
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">status:</span> <span className="text-green-400">Learning & Growing</span>
                              <br />
                              {'}'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 md:mb-6 font-mono flex items-center gap-1 sm:gap-2">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                            interests.json
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 animate-stagger" style={{ animationDelay: '200ms' }}>
                            {hobbies.map((hobby, index) => (
                              <div
                                key={index}
                                className="group relative rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden bg-white/[0.02] animate-fade-in"
                                style={{ animationDelay: `${index * 80}ms` }}>
                                <div className="absolute inset-0 bg-black/10 transition-all duration-300 z-0"></div>
                                <div className="relative flex items-center gap-2 sm:gap-3 z-10">
                                  <div className="p-2 bg-white/[0.05] rounded-lg border border-white/10 group-hover:bg-white/[0.08] transition-colors duration-300">
                                    {hobby.icon}
                                  </div>
                                  <span className="text-xs sm:text-sm font-mono text-white/80 group-hover:text-white transition-colors duration-300">
                                    {hobby.text}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'skills' && (
                      <div className="space-y-6 sm:space-y-8 font-mono animate-slide-down">
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
                            <span className="text-white/40">~/</span>hard_skills.json
                          </h2>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {hardSkills.map((skill, index) => (
                              <div key={index} className="bg-white/[0.02] rounded-lg p-3 sm:p-4 border border-white/10 hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300 group">
                                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                                  <div className="p-2 bg-white/[0.05] rounded-lg border border-white/10 group-hover:bg-white/[0.08] transition-colors duration-300">
                                    {skill.icon}
                                  </div>
                                  <div>
                                    <h3 className="text-xs sm:text-sm font-semibold text-white font-mono">{skill.name}</h3>
                                    <p className="text-white/50 text-xs">{skill.category}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
                            <span className="text-white/40">~/</span>soft_skills.json
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {softSkills.map((skill, index) => (
                              <div key={index} className="bg-white/[0.02] rounded-lg p-3 sm:p-4 border border-white/10 hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300 group">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white/[0.05] rounded-lg border border-white/10 group-hover:bg-white/[0.08] transition-colors duration-300">
                                    {skill.icon}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-xs sm:text-base font-semibold text-white font-mono">{skill.name}</h3>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'experience' && (
                      <div className="animate-slide-down">
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
                          <span className="text-white/40">~/</span>experience.log
                        </h2>
                        <div className="space-y-4 sm:space-y-6">
                          {experiences.map((exp, index) => (
                            <div
                              key={index}
                              className="relative bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300 group">
                              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-mono border border-green-500/30">
                                  {exp.status}
                                </span>
                              </div>
                              <div className="mb-3 sm:mb-4">
                                <h3 className="text-base sm:text-lg font-semibold text-white font-mono">{exp.role}</h3>
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white/60 font-mono mt-1">
                                  <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span>{exp.company}</span>
                                  <span className="text-white/40">•</span>
                                  <span>{exp.period}</span>
                                </div>
                              </div>
                              <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-mono">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'projects' && (
                      <div className="animate-slide-down">
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
                          <span className="text-white/40">~/</span>projects/
                        </h2>
                        <div className="grid gap-4 sm:gap-6">
                          {projects.map((project, index) => (
                            <a
                              key={index}
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block group bg-white/[0.02] hover:bg-white/[0.04] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden">
                              <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <h3 className="text-base sm:text-lg font-semibold text-white font-mono group-hover:text-white transition-colors duration-300">
                                    {project.title}
                                  </h3>
                                </div>
                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-mono border border-blue-500/30">
                                  {project.status}
                                </span>
                              </div>
                              <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed font-mono">{project.description}</p>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {project.tags.map((tag, i) => (
                                  <span key={i} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/[0.05] text-white/70 rounded-full text-xs border border-white/10 font-mono">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'certificates' && (
                      <div className="animate-slide-down">
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
                          <span className="text-white/40">~/</span>certificates/
                        </h2>
                        <div className="grid gap-4 sm:gap-6">
                          {certificates.map((cert, index) => (
                            <div key={index} className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="flex-1">
                                  <h3 className="text-base sm:text-lg font-semibold text-white font-mono">{cert.title}</h3>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60 font-mono mt-1 mb-2">
                                    <span>{cert.issuer}</span>
                                    <span className="text-white/40">•</span>
                                    <span>{cert.date}</span>
                                    <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">
                                      {cert.status}
                                    </span>
                                  </div>
                                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-mono">{cert.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'contact' && (
                      <div className="animate-slide-down">
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
                          <span className="text-white/40">~/</span>contact.json
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6 font-mono">
                          {contactInfo.map((contact, index) => (
                            <a
                              key={index}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden bg-white/[0.02]">
                              <div className="absolute inset-0 bg-black/10 transition-all duration-300 z-0"></div>
                              <div className="relative flex items-center gap-3 sm:gap-4 z-10">
                                <div className="p-2 sm:p-2.5 bg-white/[0.05] rounded-lg border border-white/10 group-hover:bg-white/[0.08] transition-colors duration-300">
                                  {contact.icon}
                                </div>
                                <div>
                                  <p className="text-white/60 text-xs sm:text-sm font-mono">{contact.type}</p>
                                  <h3 className="text-white text-sm sm:text-base font-medium">{contact.value}</h3>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
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
};

export default PersonalPortfolio;