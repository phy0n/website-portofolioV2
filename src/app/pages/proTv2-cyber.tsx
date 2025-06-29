'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Github, Instagram, Twitter, 
  Linkedin, Code, Gamepad2, Music, Monitor, Heart, BookOpen, Briefcase, 
  Award, Smile, Mail, Terminal, Zap, Cpu, Database, Globe, Rocket, 
  MessageCircle, Calendar, Download, ExternalLink, Star, MapPin, 
  Phone, Send, Eye, TrendingUp, Clock, Shield, Wifi, Battery
} from 'lucide-react';

const CyberpunkPortfolio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentTrack, setCurrentTrack] = useState("Cyberpunk Beats");
  const [activeTab, setActiveTab] = useState('terminal');
  const [isOnline, setIsOnline] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [terminalText, setTerminalText] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const fullTerminalText = `> Initializing portfolio system...
> Loading user data...
> Name: Phy0n #Region
> Status: ONLINE
> Location: Surabaya, Indonesia
> Specialization: Frontend Development
> Skills: React, TypeScript, TailwindCSS
> Current Project: Kh1ev Community Website
> System ready. Welcome to my digital domain.`;

  const skills = [
    { name: "React", level: 30, color: "from-blue-400 to-cyan-400" },
    { name: "Next.js", level: 20, color: "from-yellow-400 to-orange-400" },
    { name: "TypeScript", level: 25, color: "from-purple-400 to-pink-400" },
    { name: "TailwindCSS", level: 80, color: "from-green-400 to-emerald-400" },
    { name: "JavaScript", level: 60, color: "from-red-400 to-pink-400" },
    { name: "CSS", level: 65, color: "from-indigo-400 to-purple-400" }
  ];

  const projects = [
    {
      id: 1,
      title: "Kh1ev Community Website",
      description: "A modern, responsive website for the Kh1ev Community with advanced animations and interactive features.",
      tags: ["React", "TailwindCSS", "TypeScript", "Framer Motion"],
      link: "https://kh1ev.my.id",
      status: "LIVE",
      progress: 100,
      image: "/api/placeholder/300/200"
    },
  ];

  const achievements = [
    { icon: <Code className="w-5 h-5" />, title: "None", desc: "i dont have any achivement" },
  ];

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, label: "GitHub", url: "#", color: "hover:text-white" },
    { icon: <Instagram className="w-5 h-5" />, label: "Instagram", url: "#", color: "hover:text-pink-400" },
    { icon: <Twitter className="w-5 h-5" />, label: "Twitter", url: "#", color: "hover:text-blue-400" },
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", url: "#", color: "hover:text-blue-500" },
  ];

  const stats = [
    { label: "Projects", value: "2+", icon: <Briefcase className="w-4 h-4" /> },
    { label: "Experience", value: "1 Years", icon: <Calendar className="w-4 h-4" /> },
    { label: "Skills", value: "4+", icon: <Zap className="w-4 h-4" /> },
    { label: "Coffee", value: "∞", icon: <Heart className="w-4 h-4" /> }
  ];

  // Check for mobile on mount and resize
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

  // Matrix rain effect
  useEffect(() => {
    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const drops: number[] = [];
    const fontSize = isMobile ? 8 : 10;
    const columns = canvas.width / fontSize;
    
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0F4';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 35);
    return () => clearInterval(interval);
  }, [showMatrix, isMobile]);

  // Terminal typing effect
  useEffect(() => {
    if (activeTab === 'terminal') {
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullTerminalText.length) {
          setTerminalText(fullTerminalText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio('/music/cyberpunk-beats.mp3'); 
    audioRef.current.volume = volume / 100;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Audio controls
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
        setBatteryLevel(prev => Math.max(20, prev - 0.1));
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
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Matrix Background */}
      <canvas 
        id="matrix-canvas" 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ display: showMatrix ? 'block' : 'none' }}
      />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Header Bar - Responsive adjustments */}
      <div className="relative z-50 flex items-center justify-between p-3 sm:p-4 bg-black/50 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-cyan-400 font-mono text-xs sm:text-sm">PHY0N_TERMINAL_v2.1</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {!isMobile && (
            <>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                <span className="text-green-400">ONLINE</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                <span className="text-cyan-400">{batteryLevel.toFixed(0)}%</span>
              </div>
            </>
          )}
          <div className="text-xs sm:text-sm font-mono text-cyan-400">
            {isMobile ? 
              currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
              currentDateTime.toLocaleTimeString()}
          </div>
          <button 
            onClick={() => setShowMatrix(!showMatrix)}
            className="p-1 sm:p-2 hover:bg-cyan-500/20 rounded-lg transition-colors">
            <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Left Column - Profile */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 group">
              <div className="text-center mb-4 sm:mb-6">
                <div className="relative inline-block mb-3 sm:mb-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center shadow-2xl border-2 border-cyan-500/30 group-hover:border-cyan-500/50 transition-all duration-300">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-black/50 rounded-full flex items-center justify-center overflow-hidden border-2 border-cyan-500/20">
                      <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                        <Image
                          src="/image/phion.jpg"
                          alt="Profile Photo"
                          width={96}
                          height={96}
                          className="object-cover"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-400 rounded-full border-2 sm:border-4 border-black animate-pulse flex items-center justify-center">
                    <div className="w-1 h-1 sm:w-2 sm:h-2 bg-black rounded-full"></div>
                  </div>
                </div>
                
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                  Phy0n #Region
                </h1>
                <p className="text-cyan-400 mb-1 sm:mb-2 font-mono text-sm sm:text-base">@phy0n</p>
                <p className="text-gray-400 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  Surabaya, Indonesia
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-2 sm:p-3 bg-black/30 rounded-lg border border-cyan-500/20">
                    <div className="flex items-center justify-center gap-1 sm:gap-2 text-cyan-400 mb-1">
                      {stat.icon}
                      <span className="font-bold text-sm sm:text-lg">{stat.value}</span>
                    </div>
                    <span className="text-xs text-gray-400">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className={`w-8 h-8 sm:w-10 sm:h-10 bg-black/50 rounded-lg flex items-center justify-center border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 ${social.color} hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/25`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* Navigation Tabs - Responsive */}
            <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-1 sm:p-2 border border-cyan-500/30">
              <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                {[
                  { id: 'terminal', label: isMobile ? '' : 'Terminal', icon: <Terminal className="w-4 h-4" /> },
                  { id: 'projects', label: isMobile ? '' : 'Projects', icon: <Rocket className="w-4 h-4" /> },
                  { id: 'skills', label: isMobile ? '' : 'Skills', icon: <Zap className="w-4 h-4" /> },
                  { id: 'achievements', label: isMobile ? '' : 'Achievements', icon: <Award className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-500/50'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
              
              {/* Terminal Tab */}
              {activeTab === 'terminal' && (
                <div className="p-4 sm:p-6">
                  <div className="bg-black/50 rounded-lg p-3 sm:p-4 border border-cyan-500/30 font-mono text-xs sm:text-sm">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-cyan-400">
                      <Terminal className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>phy0n@portfolio:~$</span>
                      <div className="w-1 h-3 sm:w-2 sm:h-4 bg-cyan-400 animate-pulse"></div>
                    </div>
                    <pre className="text-green-400 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {terminalText}
                    </pre>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-black/30 rounded-lg border border-gray-700">
                      <h4 className="text-cyan-400 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Current Status</h4>
                      <p className="text-green-400 text-xs sm:text-sm">◉ ONLINE - Available for new projects</p>
                      <p className="text-yellow-400 text-xs sm:text-sm">◉ LEARNING - Exploring new technologies</p>
                      <p className="text-blue-400 text-xs sm:text-sm">◉ BUILDING - Working on exciting projects</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-black/30 rounded-lg border border-gray-700">
                      <h4 className="text-cyan-400 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">System Info</h4>
                      <p className="text-gray-400 text-xs sm:text-sm">OS: Web Developer v2.1</p>
                      <p className="text-gray-400 text-xs sm:text-sm">Language: TypeScript/React</p>
                      <p className="text-gray-400 text-xs sm:text-sm">Framework: Next.js</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-black/30 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                              <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">
                                {project.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.status === 'LIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                project.status === 'DEVELOPMENT' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}>
                                {project.status}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                              {project.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs border border-cyan-500/30">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <a href={project.link} className="ml-2 sm:ml-4 p-1 sm:p-2 hover:bg-cyan-500/20 rounded-lg transition-colors">
                            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                          </a>
                        </div>
                        
                        <div className="mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Progress: {project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1 sm:h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1 sm:h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                    {skills.map((skill, index) => (
                      <div key={index} className="p-3 sm:p-4 bg-black/30 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <h4 className="font-semibold text-white text-sm sm:text-base">{skill.name}</h4>
                          <span className="text-cyan-400 font-mono text-xs sm:text-sm">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
                          <div 
                            className={`bg-gradient-to-r ${skill.color} h-2 sm:h-3 rounded-full transition-all duration-1000 delay-${index * 100}`}
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30">
                    <h3 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">Currently Learning</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {["Backend Development"].map((tech, index) => (
                        <span key={index} className="px-2 py-1 sm:px-3 sm:py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs sm:text-sm border border-purple-500/30 hover:border-purple-500/50 transition-colors">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="p-4 sm:p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 group">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm sm:text-base mb-1 sm:mb-2">{achievement.title}</h4>
                            <p className="text-gray-400 text-xs sm:text-sm">{achievement.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Music Player - Responsive */}
            <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <Music className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Now Playing</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">{currentTrack}</p>
                  </div>
                </div>
                {!isMobile && (
                  <div className="flex items-center gap-1 sm:gap-2 text-cyan-400">
                    <div className="w-1 h-1 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">LIVE</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                <button 
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.max(0, currentTime - 10);
                    }
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-black/50 rounded-lg flex items-center justify-center text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-all duration-200 border border-gray-700 hover:border-cyan-500/50">
                  <SkipBack className="w-3 h-3 sm:w-5 sm:h-5" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 transform">
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-6 sm:h-6 text-black" /> : <Play className="w-4 h-4 sm:w-6 sm:h-6 text-black ml-0.5 sm:ml-1" />}
                </button>
                
                <button 
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.min(audioRef.current.duration || 180, currentTime + 10);
                    }
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-black/50 rounded-lg flex items-center justify-center text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-all duration-200 border border-gray-700 hover:border-cyan-500/50">
                  <SkipForward className="w-3 h-3 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-400 mb-3 sm:mb-4">
                <span className="font-mono text-xs sm:text-sm">{formatTime(currentTime)}</span>
                <div 
                  onClick={handleSeek}
                  className="flex-1 bg-gray-700 rounded-full h-1 sm:h-2 cursor-pointer hover:bg-gray-600 transition-colors duration-200 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1 sm:h-2 rounded-full transition-all duration-200 relative"
                    style={{ width: `${(currentTime / (audioRef.current?.duration || 180)) * 100}%` }}>
                    <div className="absolute right-0 top-0 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full transform -translate-y-0.5 shadow-lg"></div>
                  </div>
                </div>
                <span className="font-mono text-xs sm:text-sm">{formatTime(audioRef.current?.duration || 180)}</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Volume2 className="w-3 h-3 sm:w-5 sm:h-5 text-cyan-400" />
                <div 
                  onClick={handleVolumeChange}
                  className="flex-1 bg-gray-700 rounded-full h-1 sm:h-2 cursor-pointer hover:bg-gray-600 transition-colors duration-200 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1 sm:h-2 rounded-full transition-all duration-200 relative"
                    style={{ width: `${volume}%` }}>
                    <div className="absolute right-0 top-0 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full transform -translate-y-0.5 shadow-lg"></div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-mono w-6 sm:w-8">{volume}%</span>
              </div>

              {/* Audio Visualizer */}
              <div className="flex items-end justify-center gap-0.5 sm:gap-1 mt-3 sm:mt-4 h-8 sm:h-12">
                {Array.from({ length: isMobile ? 12 : 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full transition-all duration-150 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                    style={{
                      width: isMobile ? '2px' : '3px',
                      height: isPlaying ? `${Math.random() * (isMobile ? 20 : 40) + (isMobile ? 5 : 10)}px` : '4px',
                      animationDelay: `${i * 50}ms`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar - Responsive */}
        <div className="mt-4 sm:mt-8 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-2 sm:p-4 border border-cyan-500/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto w-full sm:w-auto">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-green-400 font-mono">SYS_ON</span>
              </div>
              {!isMobile && (
                <>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Cpu className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                    <span className="text-xs sm:text-sm text-gray-400">CPU: 45%</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Database className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                    <span className="text-xs sm:text-sm text-gray-400">Memory: 2.1GB</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    <span className="text-xs sm:text-sm text-gray-400">Network: Active</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {isMobile && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                  <span className="text-xs sm:text-sm text-cyan-400">{batteryLevel.toFixed(0)}%</span>
                </div>
              )}
              <div className="text-xs sm:text-sm text-gray-400 font-mono">
                Last updated: {currentDateTime.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-gray-500 text-xs sm:text-sm font-mono flex items-center justify-center gap-1 sm:gap-2">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            © {new Date().getFullYear()} Phy0n #Region | Secured by Cyberpunk Protocol v2.1
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
          </p>
        </div>
      </div>

      {/* Floating Action Button - Responsive */}
      <button className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 z-50 group">
        <Send className="w-4 h-4 sm:w-6 sm:h-6 text-black group-hover:rotate-12 transition-transform duration-300" />
      </button>

      {/* Ambient Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: isMobile ? 20 : 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        @keyframes matrix-rain {
          0% { transform: translateY(-100vh); opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        
        .animate-matrix {
          animation: matrix-rain 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CyberpunkPortfolio;