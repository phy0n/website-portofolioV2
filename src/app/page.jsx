'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Github, Instagram, Twitter, Linkedin, Code, Gamepad2, Music, Monitor, Heart, BookOpen, Briefcase, Award, Smile, Mail, Star, Zap, Coffee, Terminal, Cpu, MessageCircle, MousePointer, Phone, MapPin, Clock, CheckCircle, ExternalLink, User, Lightbulb, Target, Users, Palette, Database, Globe, Smartphone } from 'lucide-react';

const PersonalPortfolio = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentTrack, setCurrentTrack] = useState("YNW");
  const [activeTab, setActiveTab] = useState('about');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const experiences = [
    {
      role: "Website Developer",
      company: "Kh1ev Community",
      period: "2024 - 2025",
      description: "Working on the official website for Kh1ev Community, focusing on frontend development and user experience design.",
      status: "Current"
    },
  ];

  const projects = [
    {
      title: "Kh1ev Project",
      description: "This is my kh1ev community website",
      tags: ["React", "TailwindCSS", "TypeScript"],
      link: "https://kh1ev.my.id/",
      status: "Live",
      icon: <Monitor className="w-4 h-4" />
    },
  ];

  const hobbies = [
    { icon: <Code className="w-4 h-4" />, text: "Programming", color: "from-blue-500/20 to-cyan-500/20" },
    { icon: <Gamepad2 className="w-4 h-4" />, text: "Playing Game", color: "from-purple-500/20 to-pink-500/20" },
    { icon: <Music className="w-4 h-4" />, text: "Listening Music", color: "from-green-500/20 to-emerald-500/20" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Reading Comic", color: "from-orange-500/20 to-red-500/20" },
  ];

  const hardSkills = [
    { name: "React", level: 85, icon: <Code className="w-4 h-4" />, category: "Frontend" },
    { name: "Next.js", level: 80, icon: <Globe className="w-4 h-4" />, category: "Framework" },
    { name: "TailwindCSS", level: 90, icon: <Palette className="w-4 h-4" />, category: "Styling" },
  ];

  const softSkills = [
    { name: "Problem Solving", level: 90, icon: <Lightbulb className="w-4 h-4" />},
    { name: "Adaptability", level: 88, icon: <Target className="w-4 h-4" /> },
    { name: "Time Management", level: 82, icon: <Clock className="w-4 h-4" />},
    { name: "Creativity", level: 87, icon: <Palette className="w-4 h-4" />}
  ];

  const certificates = [
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

  const contactInfo = [
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

  const skills = ["Developer","Admin","Member"];

  const handleEnter = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setHasEntered(true);

    try {
      audioRef.current = new Audio('/music/music.mp3');
      audioRef.current.volume = volume / 100;
      audioRef.current.loop = true;

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.log("Auto-play failed:", err);
    }
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
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
        audioRef.current.play().catch(e => console.log("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    let interval;
    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * (audioRef.current.duration || 180);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const socialMedia = [
    {
      name: "Instagram",
      icon: <Instagram className="w-4 h-4" />,
      url: "https://www.instagram.com/ic.phionkhievrushandle/",
      color: "from-pink-500/20 to-red-500/20"
    },
    {
      name: "Discord Server",
      icon: <Globe className="w-4 h-4" />,
      url: "https://discord.gg/MwNE7Vfb6t/",
      color: "from-pink-500/20 to-red-500/20"
    },
  ];

  if (!hasEntered) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center" style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]"
               style={{
                 backgroundImage: `
                   linear-gradient(white 1px, transparent 1px),
                   linear-gradient(90deg, white 1px, transparent 1px) `,
                 backgroundSize: '50px 50px'
               }}>
          </div>

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

        <div className="relative z-10 text-center">
          {isLoading ? (
            <div className="space-y-6">
              <div className="relative">
                <div className="w-16 h-16 mx-auto border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 mx-auto border-2 border-transparent border-t-white/40 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
              </div>
              <div className="space-y-2">
                <p className="text-white/80 font-mono text-sm">Loading portfolio...</p>
                <p className="text-white/60 font-mono text-xs mb-5">Music will start automatically</p>
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="relative inline-block group">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-full animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-white/10 to-white/[0.05] rounded-full p-1 shadow-2xl border border-white/20 group-hover:border-white/30 transition-all duration-500">
                  <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden">
                      <Image
                        src="/image/phion.jpg"
                        alt="Profile Photo"
                        width={112}
                        height={112}
                        className="object-cover hover:scale-110 transition-transform duration-500"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent font-mono">
                      Welcome to
                    </span>
                  </h1>
                  <h2 className="text-xl md:text-3xl font-bold font-mono">
                    <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                      Phy0n Portofolio
                    </span>
                  </h2>
                </div>
                <p className="text-white/60 font-mono text-sm md:text-base max-w-md mx-auto">
                  Im Just Crazy People
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleEnter}
                  className="group relative px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300 hover:scale-105 transform font-mono text-white/80 hover:text-white cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <MousePointer className="w-4 h-4 sm:w-5 sm:h-5" />
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    </div>
                    <span className="text-sm sm:text-md font-medium">Click to Enter</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-white/[0.05] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace' }}>
      <div className="absolute inset-0 z-9 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          poster="/video/anime-bg-poster.jpg">
          <source src="/video/video.mp4 " type="video/mp4" />
        </video>
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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
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
                <div className="text-center lg:text-left lg:min-w-[250px] xl:min-w-[300px]">
                  <div className="relative inline-block mb-4 sm:mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-full animate-pulse"></div>
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-white/10 to-white/[0.05] rounded-full p-1 shadow-2xl border border-white/20 group-hover:border-white/30 transition-all duration-500">
                      <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden">
                          <Image
                            src="/image/phion.jpg"
                            alt="Profile Photo"
                            width={96}
                            height={96}
                            className="object-cover hover:scale-110 transition-transform duration-500"
                            priority
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-wide">
                      <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent font-mono">
                        Phy0n
                      </span>
                      <span className="text-white/50 text-sm sm:text-base md:text-lg ml-1 sm:ml-2 font-mono">#LoveYou.</span>
                    </h1>
                    <div className="flex items-center justify-center lg:justify-start gap-1 sm:gap-2 mb-2 sm:mb-4">
                      <span className="text-white/60 text-xs sm:text-sm font-mono">@Phy0n</span>
                      <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                      <span className="text-white/40 text-xs font-mono">Orang Gila</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-1 sm:gap-2 mb-4 sm:mb-6">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-white/80 rounded-full text-[10px] xs:text-xs sm:text-xs border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer font-mono">
                        <span className="text-white/40">&lt;</span>
                        {skill}
                        <span className="text-white/40">/&gt;</span>
                      </span>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 font-mono flex items-center gap-1 sm:gap-2">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                      connect.social
                    </h3>
                    <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6 font-mono">
                      {socialMedia.map((social, index) => (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group px-5 w-auto h-10 sm:w-auto sm:h-12 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-110 transform"
                          title={social.name}>
                          <div className="text-white/60 group-hover:text-white transition-colors duration-300 pr-3">
                            {social.icon}
                          </div>
                          <div className="text-xs sm:text-sm">
                            {social.name}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/15 transition-all duration-300 font-mono">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white/60 text-xs sm:text-sm font-mono">status:</span>
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                      The best revenge is to make yourself better
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex border-b border-white/10 mb-4 sm:mb-6 md:mb-8 overflow-x-auto">
                    {['about', 'skills', 'experience', 'projects', 'certificates', 'contact'].map((tab) => (
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
                    {activeTab === 'about' && (
                      <div className="space-y-4 sm:space-y-6 md:space-y-8">
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4 font-mono">
                            <span className="text-white/40">~/</span>about.md
                          </h2>
                          <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300 backdrop-blur-sm">
                            <p className="text-white/70 leading-relaxed font-mono text-xs sm:text-sm">
                              <span className="text-white/40">const</span> <span className="text-white">developer</span> = {'{'}
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">name:</span> <span className="text-green-400">"Panggil Aja Phy0n"</span>,
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">age:</span> <span className="text-green-400">"17 years old"</span>,
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">role:</span> <span className="text-green-400">"Frontend Developer"</span>,
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">passion:</span> <span className="text-green-400">"Make good website"</span>,
                              <br />
                              <span className="ml-3 sm:ml-4 text-white/40">status:</span> <span className="text-green-400">"Learning & Growing"</span>
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                            {hobbies.map((hobby, index) => (
                              <div
                                key={index}
                                className="group relative rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden bg-white/[0.02] backdrop-blur-sm">
                                <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm z-0"></div>
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
                      <div className="space-y-6 sm:space-y-8 font-mono">
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
                                    <h3 className="text-sm sm:text-base font-semibold text-white font-mono">{skill.name}</h3>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'experience' && (
                      <div>
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
                      <div>
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
                      <div>
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
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
                          <span className="text-white/40">~/</span>contact.json
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6 font-mono">
                          {contactInfo.map((contact, index) => (
                            <a
                              key={index}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden bg-white/[0.02] backdrop-blur-sm">
                              <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm z-0"></div>
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

              <div className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/15 transition-all duration-300 group">
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
                  <Music className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
                  <span className="text-white/80 font-mono text-xs sm:text-sm">now_playing.mp3</span>
                  <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
                  <span className="text-white/40 text-xs font-mono">{currentTrack}</span>
                </div>

                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.max(0, currentTime - 10);
                      }
                    }}
                    className="text-white/50 hover:text-white transition-all duration-200 hover:scale-110 transform p-1 sm:p-2 rounded-full hover:bg-white/[0.05]">
                    <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white hover:bg-white/90 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-105 transform group-hover:shadow-xl">
                    {isPlaying ? (
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black ml-0.5 sm:ml-1" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.min(audioRef.current.duration || 180, currentTime + 10);
                      }
                    }}
                    className="text-white/50 hover:text-white transition-all duration-200 hover:scale-110 transform p-1 sm:p-2 rounded-full hover:bg-white/[0.05]">
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-white/60 font-mono">
                    <span className="min-w-[35px] sm:min-w-[40px]">{formatTime(currentTime)}</span>
                    <div
                      onClick={handleSeek}
                      className="flex-1 bg-white/10 rounded-full h-1.5 sm:h-2 cursor-pointer hover:bg-white/15 transition-colors duration-200 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-white/80 to-white/60 h-1.5 sm:h-2 rounded-full transition-all duration-200 relative"
                        style={{ width: `${(currentTime / (audioRef.current?.duration || 180)) * 100}%` }}>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </div>
                    </div>
                    <span className="min-w-[35px] sm:min-w-[40px]">{formatTime(audioRef.current?.duration || 180)}</span>
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
    </div>
  );
};

export default PersonalPortfolio;
