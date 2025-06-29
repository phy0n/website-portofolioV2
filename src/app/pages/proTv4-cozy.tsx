'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Github, Instagram, Twitter, Linkedin, Code, Gamepad2, Music, Monitor, Heart, BookOpen, Briefcase, Award, Smile, Mail, MapPin, Calendar, Download, ExternalLink, Star, Activity, Coffee, Zap, Sparkles, Headphones, Moon, Sun } from 'lucide-react';

const PersonalPortfolio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentTrack, setCurrentTrack] = useState("Lofi Chill Beats");
  const [activeTab, setActiveTab] = useState('about');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const experiences = [
    {
      role: "Website Developer",
      company: "Kh1ev Community",
      period: "2024 - Present",
      description: "Crafting beautiful, responsive websites with modern technologies. Focusing on user experience and clean code architecture.",
      status: "Current",
      icon: "🚀"
    },
  ];

  const projects = [
    {
      title: "Kh1ev Community Website",
      description: "A modern, responsive community website built with love and attention to detail. Features include smooth animations, dark mode, and mobile-first design.",
      tags: ["React", "TailwindCSS", "TypeScript", "Framer Motion"],
      link: "https://kh1ev.my.id",
      status: "Live",
      stars: 12,
      emoji: "🌟"
    },
  ];

  const skills = [
    { name: "React", level: 85, category: "Frontend", emoji: "⚛️", color: "from-blue-400 to-cyan-300" },
    { name: "TypeScript", level: 75, category: "Language", emoji: "📘", color: "from-blue-500 to-indigo-400" },
    { name: "TailwindCSS", level: 90, category: "Styling", emoji: "🎨", color: "from-teal-400 to-blue-400" },
    { name: "Next.js", level: 70, category: "Framework", emoji: "▲", color: "from-gray-600 to-gray-800" },
  ];

  const hobbies = [
    { icon: <Code className="w-5 h-5" />, text: "Frontend Development", color: "from-emerald-400 to-teal-300", emoji: "💻" },
    { icon: <Gamepad2 className="w-5 h-5" />, text: "Gaming Adventures", color: "from-purple-400 to-pink-300", emoji: "🎮" },
    { icon: <Music className="w-5 h-5" />, text: "Lofi Music Lover", color: "from-rose-400 to-pink-300", emoji: "🎵" },
    { icon: <BookOpen className="w-5 h-5" />, text: "Manga Reading", color: "from-orange-400 to-red-300", emoji: "📚" },
    { icon: <Briefcase className="w-5 h-5" />, text: "Building Cool Stuff", color: "from-indigo-400 to-purple-300", emoji: "🛠️" },
    { icon: <Coffee className="w-5 h-5" />, text: "Coffee Enthusiast", color: "from-amber-400 to-orange-300", emoji: "☕" }
  ];

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, label: "GitHub", url: "#", color: "hover:text-gray-300", bg: "hover:bg-gray-800" },
    { icon: <Instagram className="w-5 h-5" />, label: "Instagram", url: "#", color: "hover:text-pink-400", bg: "hover:bg-pink-500/10" },
    { icon: <Twitter className="w-5 h-5" />, label: "Twitter", url: "#", color: "hover:text-blue-400", bg: "hover:bg-blue-500/10" },
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", url: "#", color: "hover:text-blue-500", bg: "hover:bg-blue-600/10" },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Interactive Cursor Effect */}
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl transition-all duration-500 ease-out"
          style={{
            left: `${mousePosition.x / 15}px`,
            top: `${mousePosition.y / 15}px`,
          }}
        ></div>
        
        {/* Sparkles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full animate-pulse opacity-30"
            style={{
              left: `${20 + (i * 5)}%`,
              top: `${10 + (i * 6)}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl w-full">
        {/* Main Container */}
        <div 
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 overflow-hidden transition-all duration-700 relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 mb-10">
              {/* Profile Section */}
              <div className="text-center lg:text-left lg:w-80">
                <div className="relative inline-block mb-8 group">
                  {/* Profile Picture */}
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full flex items-center justify-center shadow-2xl border border-white/20 group-hover:border-white/40 transition-all duration-500 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="w-28 h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center overflow-hidden border border-white/20 relative z-10">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">P</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Mood Badge */}
                  <div className="absolute -top-3 -left-3 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full border border-white/30">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✨</span>
                      <span className="text-xs text-white/90 font-medium">Coding</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                      Phy0n 
                      <span className="text-purple-300 font-normal text-xl ml-2">#Creative</span>
                    </h1>
                    <p className="text-purple-200 mb-3 font-medium text-lg">@phy0n</p>
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-white/70 text-sm">
                      <MapPin className="w-4 h-4 text-pink-300" />
                      <span>Indonesia 🇮🇩</span>
                      <span>•</span>
                      <Calendar className="w-4 h-4 text-purple-300" />
                      <span>Joined 2024</span>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                    {["Frontend Developer", "React Enthusiast", "Coffee Lover"].map((skill, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white/90 rounded-full text-sm border border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300 font-medium backdrop-blur-sm hover:scale-105">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center lg:justify-start gap-4 mb-8">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110 ${social.color} ${social.bg} backdrop-blur-sm`}
                        title={social.label}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <button className="w-full lg:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform">
                      <Download className="w-5 h-5" />
                      Download CV
                    </button>
                    <button className="w-full lg:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white rounded-xl border border-white/30 hover:border-white/50 hover:bg-white/20 transition-all duration-300 font-semibold backdrop-blur-sm">
                      <Mail className="w-5 h-5" />
                      Get In Touch
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="flex-1">
                {/* Tab Navigation */}
                <div className="flex border-b border-white/20 mb-10 relative overflow-x-auto">
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
                  {['about', 'experience', 'projects', 'skills'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-8 py-4 text-sm font-semibold relative transition-all duration-300 cursor-pointer group whitespace-nowrap ${
                        activeTab === tab 
                          ? 'text-white' 
                          : 'text-white/60 hover:text-white/90'
                      }`}>
                      <span className="relative z-10 capitalize">{tab}</span>
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                      )}
                      <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  ))}
                </div>
                
                {/* Tab Content */}
                <div className="min-h-[500px]">
                  {activeTab === 'about' && (
                    <div className="space-y-10">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          About Me
                        </h2>
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                          <p className="text-white/90 mb-6 leading-relaxed text-lg">
                            Hey there! 👋 I'm <span className="text-purple-300 font-semibold">Phy0n</span>, a passionate frontend developer who loves crafting beautiful and functional web experiences. My journey in web development started recently, but I'm already deeply in love with the endless possibilities of code and creativity.
                          </p>
                          <p className="text-white/80 leading-relaxed text-lg mb-6">
                            I specialize in <span className="text-pink-300 font-medium">ReactJS</span>, <span className="text-blue-300 font-medium">TailwindCSS</span>, and <span className="text-indigo-300 font-medium">TypeScript</span> to build modern, responsive, and user-friendly applications. Every line of code I write is infused with attention to detail and a passion for perfection.
                          </p>
                          <p className="text-white/70 leading-relaxed text-lg">
                            When I'm not coding, you'll find me exploring new technologies, reading manga, or vibing to some lofi beats with a cup of coffee in hand. ☕✨
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-white/90 text-sm uppercase tracking-wider mb-8 font-bold flex items-center gap-3">
                          <Heart className="w-5 h-5 text-red-400" />
                          What I Love Doing
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {hobbies.map((hobby, index) => (
                            <div 
                              key={index}
                              className="group relative overflow-hidden bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10 cursor-pointer hover:scale-105 transform">
                              <div className={`absolute inset-0 bg-gradient-to-r ${hobby.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                              <div className="relative z-10 flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${hobby.color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm`}>
                                  {hobby.icon}
                                </div>
                                <div>
                                  <span className="text-2xl mb-2 block">{hobby.emoji}</span>
                                  <span className="text-white/90 group-hover:text-white transition-colors duration-300 font-medium text-lg">{hobby.text}</span>
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
                      <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        Work Experience
                      </h2>
                      <div className="space-y-8">
                        {experiences.map((exp, index) => (
                          <div
                            key={index}
                            className="relative bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10 group hover:scale-102 transform">
                            <div className="absolute -left-4 top-10 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-4 border-slate-900 flex items-center justify-center">
                              <span className="text-sm">{exp.icon}</span>
                            </div>
                            <div className="ml-8">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-2xl font-semibold text-white group-hover:text-purple-200 transition-colors duration-300 mb-2">{exp.role}</h3>
                                  <div className="flex items-center gap-4 text-white/70 mb-3">
                                    <span className="font-medium text-lg">{exp.company}</span>
                                    <span>•</span>
                                    <span>{exp.period}</span>
                                  </div>
                                </div>
                                <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30 backdrop-blur-sm">
                                  {exp.status}
                                </span>
                              </div>
                              <p className="text-white/80 leading-relaxed text-lg">{exp.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'projects' && (
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                          <Code className="w-5 h-5 text-white" />
                        </div>
                        Featured Projects
                      </h2>
                      <div className="grid gap-8">
                        {projects.map((project, index) => (
                          <a
                            key={index}
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 group relative overflow-hidden hover:scale-102 transform">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-3xl"></div>
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                  <span className="text-3xl">{project.emoji}</span>
                                  <div>
                                    <h3 className="text-2xl font-semibold text-white group-hover:text-purple-200 transition-colors duration-300 mb-2">{project.title}</h3>
                                    <ExternalLink className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors duration-300" />
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                                    {project.status}
                                  </span>
                                  <div className="flex items-center gap-2 text-yellow-400">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-medium">{project.stars}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-white/80 mb-6 leading-relaxed text-lg">{project.description}</p>
                              <div className="flex flex-wrap gap-3">
                                {project.tags.map((tag, i) => (
                                  <span key={i} className="px-4 py-2 bg-white/10 text-white/80 rounded-full text-sm border border-white/20 font-medium hover:bg-white/20 transition-colors duration-300">
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
                      <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        Technical Skills
                      </h2>
                      <div className="space-y-8">
                        {skills.map((skill, index) => (
                          <div key={index} className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10 group">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 bg-gradient-to-r ${skill.color} rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg`}>
                                  {skill.emoji}
                                </div>
                                <div>
                                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-200 transition-colors duration-300">{skill.name}</h3>
                                  <span className="text-white/60 text-sm font-medium">{skill.category}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-white/90">{skill.level}%</span>
                                <div className="text-white/50 text-sm mt-1">Proficiency</div>
                              </div>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                              <div 
                                className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                                style={{ width: `${skill.level}%` }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                              </div>
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
            <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-8 border border-white/20 hover:border-white/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <Headphones className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Now Playing</h3>
                      <p className="text-purple-200">{currentTrack}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="p-3 bg-white/5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors duration-300">
                      {isDarkMode ? <Moon className="w-5 h-5 text-purple-300" /> : <Sun className="w-5 h-5 text-yellow-300" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 mb-6">
                  <button 
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.max(0, currentTime - 10);
                      }
                    }}
                    className="p-3 bg-white/5 rounded-xl border border-white/20 hover:bg-white/10 hover:border-white/30 transition-colors duration-300 text-purple-300 hover:text-white">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={togglePlay}
                    className="p-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                    {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.min(audioRef.current.duration || 180, currentTime + 10);
                      }
                    }}
                    className="p-3 bg-white/5 rounded-xl border border-white/20 hover:bg-white/10 hover:border-white/30 transition-colors duration-300 text-purple-300 hover:text-white">
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
                  <span>{formatTime(currentTime)}</span>
                  <div 
                    onClick={handleSeek}
                    className="flex-1 bg-white/10 rounded-full h-2 cursor-pointer hover:bg-white/20 transition-colors duration-300 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-200 relative"
                      style={{ width: `${(currentTime / (audioRef.current?.duration || 180)) * 100}%` }}>
                      <div className="absolute right-0 top-0 w-3 h-3 bg-white rounded-full transform -translate-y-0.5 shadow-lg"></div>
                    </div>
                  </div>
                  <span>{formatTime(audioRef.current?.duration || 180)}</span>
                </div>

                <div className="flex items-center gap-4">
                  <Volume2 className="w-5 h-5 text-purple-300" />
                  <div 
                    onClick={handleVolumeChange}
                    className="flex-1 bg-white/10 rounded-full h-2 cursor-pointer hover:bg-white/20 transition-colors duration-300 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-200 relative"
                      style={{ width: `${volume}%` }}>
                      <div className="absolute right-0 top-0 w-3 h-3 bg-white rounded-full transform -translate-y-0.5 shadow-lg"></div>
                    </div>
                  </div>
                  <span className="text-sm text-white/70 w-10">{volume}%</span>
                </div>

                {/* Visualizer */}
                <div className="flex items-end justify-center gap-1 mt-8 h-16">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-t from-purple-400 to-pink-400 rounded-full transition-all duration-150 ${
                        isPlaying ? 'animate-pulse' : ''
                      }`}
                      style={{
                        width: '4px',
                        height: isPlaying ? `${Math.random() * 40 + 10}px` : '8px',
                        animationDelay: `${i * 50}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/60 text-sm">
          <p className="flex items-center justify-center gap-2">
            <span>© {new Date().getFullYear()} Phy0n</span>
            <span>•</span>
            <span>Made with ❤️ and React</span>
            <span>•</span>
            <span>v1.0.0</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalPortfolio;