'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Github, Instagram, Twitter, Linkedin, Code, Gamepad2, Music, Monitor, Heart, BookOpen, Briefcase, Award, Smile, Mail, MapPin, Calendar, Download, ExternalLink, Star, Activity, Coffee, Zap, Sparkles } from 'lucide-react';

const PersonalPortfolio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentTrack, setCurrentTrack] = useState("YNW");
  const [activeTab, setActiveTab] = useState('about');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
      title: "Kh1ev Community Website",
      description: "A modern, responsive website for the Kh1ev Community, built with ReactJS",
      tags: ["React", "TailwindCSS", "TypeScript"],
      link: "https://kh1ev.my.id",
      status: "Live",
      stars: 12
    },
  ];

  const skills = [
    { name: "React", level: 85, category: "Frontend" },
    { name: "TypeScript", level: 75, category: "Language" },
    { name: "TailwindCSS", level: 90, category: "Styling" },
    { name: "Next.js", level: 70, category: "Framework" },
  ];

  const hobbies = [
    { icon: <Code className="w-4 h-4" />, text: "Frontend Development", color: "from-blue-400 to-cyan-400" },
    { icon: <Gamepad2 className="w-4 h-4" />, text: "Playing Game", color: "from-purple-400 to-pink-400" },
    { icon: <Music className="w-4 h-4" />, text: "Listening Music", color: "from-green-400 to-emerald-400" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Reading Comic", color: "from-orange-400 to-red-400" },
    { icon: <Briefcase className="w-4 h-4" />, text: "Do something productive", color: "from-indigo-400 to-purple-400" },
    { icon: <Coffee className="w-4 h-4" />, text: "Coffee Enthusiast", color: "from-amber-400 to-orange-400" }
  ];

  const socialLinks = [
    { icon: <Github className="w-4 h-4" />, label: "GitHub", url: "#", color: "hover:text-gray-300" },
    { icon: <Instagram className="w-4 h-4" />, label: "Instagram", url: "#", color: "hover:text-pink-400" },
    { icon: <Twitter className="w-4 h-4" />, label: "Twitter", url: "#", color: "hover:text-blue-400" },
    { icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn", url: "#", color: "hover:text-blue-500" },
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('/music/music.mp3'); 
    audioRef.current.volume = volume / 100;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
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
    let interval: NodeJS.Timeout;
    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * (audioRef.current.duration || 180);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.min(100, Math.max(0, Math.round(pos * 100)));
    setVolume(newVolume);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-white/[0.02] rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: `${mousePosition.x / 10}px`,
            top: `${mousePosition.y / 10}px`,
          }}
        ></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/[0.015] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.005] to-transparent"></div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Main Card */}
        <div 
          className="bg-white/[0.03] backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/[0.08] overflow-hidden hover:bg-white/[0.04] transition-all duration-700 relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
          
          {/* Floating Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/[0.03] to-transparent rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-white/[0.02] to-transparent rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              {/* Profile Section */}
              <div className="text-center lg:text-left lg:w-80">
                <div className="relative inline-block mb-6 group">
                  <div className="w-28 h-28 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center shadow-2xl border border-white/10 group-hover:border-white/20 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-full"></div>
                    <div className="w-24 h-24 bg-black/40 rounded-full flex items-center justify-center overflow-hidden border border-white/10 relative z-10">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-lg font-semibold">
                          P
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-3 border-black animate-pulse shadow-lg">
                    <div className="w-full h-full rounded-full bg-green-400 animate-ping opacity-75"></div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute -top-2 -left-2 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-white/80 font-medium">Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                      Phy0n 
                      <span className="text-white/60 font-normal text-xl ml-2">#Region</span>
                    </h1>
                    <p className="text-white/60 mb-2 font-medium">@phy0n</p>
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-white/50 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Indonesia</span>
                      <span>•</span>
                      <Calendar className="w-4 h-4" />
                      <span>Joined 2024</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                    {["Frontend Developer", "React Enthusiast"].map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-white/10 to-white/5 text-white/80 rounded-full text-xs border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all duration-300 font-medium backdrop-blur-sm">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center lg:justify-start gap-3">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        className={`w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10 hover:scale-110 ${social.color}`}
                        title={social.label}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>

                  {/* Download CV Button */}
                  <button className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 text-white rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all duration-300 font-medium backdrop-blur-sm group">
                    <Download className="w-4 h-4 group-hover:animate-bounce" />
                    Download CV
                  </button>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="flex-1">
                {/* Enhanced Tab Navigation */}
                <div className="flex border-b border-white/10 mb-8 relative">
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  {['about', 'experience', 'projects', 'skills'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-sm font-semibold relative transition-all duration-300 cursor-pointer group ${
                        activeTab === tab 
                          ? 'text-white' 
                          : 'text-white/50 hover:text-white/80'
                      }`}>
                      <span className="relative z-10">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                      )}
                      <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  ))}
                </div>
                
                {/* Enhanced Tab Content */}
                <div className="min-h-[400px]">
                  {activeTab === 'about' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-blue-400" />
                          About Me
                        </h2>
                        <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                          <p className="text-white/80 mb-6 leading-relaxed text-base">
                            Hola, my name is Phy0n, a passionate frontend developer with a love for creating beautiful and functional web applications. I just started my journey in web development and I'm excited to learn and grow in this field. I enjoy working with ReactJS, TailwindCSS, and TypeScript to build modern, responsive websites.
                          </p>
                          <p className="text-white/70 leading-relaxed">
                            In my free time, I love playing games, reading comics, and listening to music. I'm always eager to learn new technologies and improve my skills.
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-white/80 text-sm uppercase tracking-wider mb-6 font-bold flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          Hobbies & Interests
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {hobbies.map((hobby, index) => (
                            <div 
                              key={index}
                              className="group relative overflow-hidden bg-white/[0.02] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.03] cursor-pointer">
                              <div className={`absolute inset-0 bg-gradient-to-r ${hobby.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                              <div className="relative z-10 flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${hobby.color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                                  {hobby.icon}
                                </div>
                                <span className="text-white/80 group-hover:text-white transition-colors duration-300 font-medium">{hobby.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'experience' && (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-green-400" />
                        Work Experience
                      </h2>
                      <div className="space-y-6">
                        {experiences.map((exp, index) => (
                          <div
                            key={index}
                            className="relative bg-white/[0.02] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.03] group">
                            <div className="absolute -left-2 top-8 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-black"></div>
                            <div className="ml-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-100 transition-colors duration-300">{exp.role}</h3>
                                  <div className="flex items-center gap-3 text-white/60 mb-2">
                                    <span className="font-medium">{exp.company}</span>
                                    <span>•</span>
                                    <span>{exp.period}</span>
                                  </div>
                                </div>
                                <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/20">
                                  {exp.status}
                                </span>
                              </div>
                              <p className="text-white/70 leading-relaxed">{exp.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'projects' && (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                        <Code className="w-6 h-6 text-purple-400" />
                        Featured Projects
                      </h2>
                      <div className="grid gap-6">
                        {projects.map((project, index) => (
                          <a
                            key={index}
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white/[0.02] rounded-2xl p-6 border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-3xl"></div>
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-100 transition-colors duration-300">{project.title}</h3>
                                  <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors duration-300" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/20">
                                    {project.status}
                                  </span>
                                  <div className="flex items-center gap-1 text-yellow-400">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="text-xs font-medium">{project.stars}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-white/70 mb-4 leading-relaxed">{project.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag, i) => (
                                  <span key={i} className="px-3 py-1 bg-white/5 text-white/70 rounded-full text-xs border border-white/10 font-medium">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'skills' && (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        Technical Skills
                      </h2>
                      <div className="space-y-6">
                        {skills.map((skill, index) => (
                          <div key={index} className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.03]">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                                <span className="text-white/50 text-sm">{skill.category}</span>
                              </div>
                              <span className="text-white/80 font-bold">{skill.level}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${skill.level}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Music Player */}
            <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                      <Music className="w-6 h-6 text-white/80" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Now Playing</h3>
                      <p className="text-white/60 text-sm">{currentTrack}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-6 bg-gradient-to-t from-blue-400 to-purple-400 rounded-full ${
                            isPlaying ? 'animate-pulse' : ''
                          }`}
                          style={{ animationDelay: `${i * 0.2}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 mb-6">
                  <button 
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.max(0, currentTime - 10);
                      }
                    }}
                    className="text-white/60 hover:text-white transition-all duration-200 hover:scale-110 transform p-2 rounded-full hover:bg-white/5">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={togglePlay}
                    className="w-14 h-14 bg-gradient-to-r from-white/90 to-white hover:from-white hover:to-white/90 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 transform relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                    {isPlaying ? <Pause className="w-6 h-6 text-black relative z-10" /> : <Play className="w-6 h-6 text-black ml-1 relative z-10" />}
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.min(audioRef.current.duration || 180, currentTime + 10);
                      }
                    }}
                    className="text-white/60 hover:text-white transition-all duration-200 hover:scale-110 transform p-2 rounded-full hover:bg-white/5">
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span className="font-mono">{formatTime(currentTime)}</span>
                    <div 
                      onClick={handleSeek}
                      className="flex-1 bg-white/10 rounded-full h-2 cursor-pointer hover:bg-white/20 transition-colors duration-200 relative overflow-hidden group">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-200 relative"
                        style={{ width: `${(currentTime / (audioRef.current?.duration || 180)) * 100}%` }}>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </div>
                    </div>
                    <span className="font-mono">{formatTime(audioRef.current?.duration || 180)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-white/60" />
                    <div 
                      onClick={handleVolumeChange}
                      className="flex-1 bg-white/10 rounded-full h-2 cursor-pointer hover:bg-white/20 transition-colors duration-200 relative overflow-hidden group">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-200 relative"
                        style={{ width: `${volume}%` }}>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </div>
                    </div>
                    <span className="text-xs text-white/60 font-mono w-8">{volume}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="text-center mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>Made with passion</span>
                </div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  <span>Fueled by coffee</span>
                </div>
              </div>
              <p className="text-white/30 text-xs font-medium">
                © {new Date().getFullYear()} Phy0n • All rights reserved • Crafted with ❤️
              </p>
            </div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-20">
          <button className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-110 group">
            <Mail className="w-5 h-5 text-white/80 group-hover:text-white" />
          </button>
          <button className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-110 group">
            <Activity className="w-5 h-5 text-white/80 group-hover:text-white" />
          </button>
        </div>

        {/* Custom Cursor Effect */}
        <div 
          className="fixed pointer-events-none z-50 w-6 h-6 border border-white/30 rounded-full transition-all duration-300 ease-out"
          style={{
            left: `${mousePosition.x - 12}px`,
            top: `${mousePosition.y - 12}px`,
            opacity: isHovered ? 1 : 0,
            transform: `scale(${isHovered ? 1.5 : 1})`,
          }}
        >
          <div className="w-2 h-2 bg-white/50 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default PersonalPortfolio;