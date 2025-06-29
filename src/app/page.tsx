'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Github, Instagram, Twitter, Linkedin, Code, Gamepad2, Music, Monitor, Heart, BookOpen, Briefcase, Award, Smile, Mail } from 'lucide-react';

const PersonalPortfolio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentTrack, setCurrentTrack] = useState("YNW");
  const [activeTab, setActiveTab] = useState('about');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const experiences = [
    {
      role: "Website Developer",
      company: "Kh1ev Community",
      period: "2024 - 2025",
      description: "Working on the official website for Kh1ev Community, focusing on frontend development and user experience design."
    },
  ];

  const projects = [
    {
      title: "Kh1ev Community Website",
      description: "A modern, responsive website for the Kh1ev Community, built with ReactJS",
      tags: ["React", "TailwindCSS", "TypeScript"],
      link: "https://kh1ev.my.id"
    },
  ];

  const hobbies = [
    { icon: <Code className="w-4 h-4" />, text: "Frontend Development" },
    { icon: <Gamepad2 className="w-4 h-4" />, text: "Playing Game" },
    { icon: <Music className="w-4 h-4" />, text: "Listening Music" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Reading Comic" },
    { icon: <Briefcase className="w-4 h-4" />, text: "Do something productive" }
  ];

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.01] to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 overflow-hidden hover:bg-white/[0.07] transition-all duration-500">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/3 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="text-center md:text-left">
                <div className="relative inline-block mb-4 group">
                  <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center shadow-lg border border-white/20 group-hover:border-white/30 transition-all duration-300">
                    <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                          <Image
                            src="/image/phion.jpg"
                            alt="Profile Photo"
                            width={64}
                            height={64}
                            className="object-cover"
                            priority/>
                        </div>
                      </div>
                    </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-black animate-pulse"></div>
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-2">Phy0n #Region</h1>
                <p className="text-white/60 mb-4">@phy0n</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6 cursor-pointer">
                  {["Frontend Developer"].map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs border border-white/20 hover:bg-white/15 transition-all duration-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex border-b border-white/20 mb-6">
                  {['about', 'experience', 'projects'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium relative transition-all duration-200 cursor-pointer ${
                        activeTab === tab 
                          ? 'text-white' 
                          : 'text-white/60 hover:text-white/80'
                      }`}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Tab Content */}
                <div className="min-h-[300px]">
                  {activeTab === 'about' && (
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4">About Me</h2>
                      <p className="text-white/70 mb-6 leading-relaxed">
                        Hola, my name is Phy0n, a passionate frontend developer with a love for creating beautiful and functional web applications. I just started my journey in web development and I'm excited to learn and grow in this field. I enjoy working with ReactJS, TailwindCSS, and TypeScript to build modern, responsive websites. In my free time, I love playing games, reading comics, and listening to music.
                      </p>
                      
                      <h3 className="text-white/60 text-sm uppercase tracking-wider mb-4 font-semibold">
                        Hobbies & Interests
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 cursor-pointer">
                        {hobbies.map((hobby, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-200 group">
                            <div className="text-white/50 group-hover:text-white transition-colors duration-200">
                              {hobby.icon}
                            </div>
                            <span className="text-sm">{hobby.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'experience' && (
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-6">Work Experience</h2>
                      <div className="space-y-6">
                        {experiences.map((exp, index) => (
                          <div
                            key={index}
                            className="relative pl-6 border-l border-white/20 hover:border-white/40 transition-all duration-200">
                            <div className="absolute -left-1.5 top-0 w-3 h-3 bg-white rounded-full"></div>
                            <h3 className="text-lg font-medium text-white">{exp.role}</h3>
                            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                              <span>{exp.company}</span>
                              <span>•</span>
                              <span>{exp.period}</span>
                            </div>
                            <p className="text-white/70 text-sm">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'projects' && (
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-6">Featured Projects</h2>
                      <div className="grid gap-4">
                        {projects.map((project, index) => (
                          <a
                            key={index}
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 group">
                            <h3 className="text-lg font-medium text-white mb-2 group-hover:text-white transition-colors duration-200">{project.title}</h3>
                            <p className="text-white/70 text-sm mb-3">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {project.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs border border-white/20">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Music Player */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300">
              <div className="flex items-center justify-center gap-4 mb-4">
                <button 
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.max(0, currentTime - 10);
                    }
                  }}
                  className="text-white/60 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                  <SkipBack className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 bg-white hover:bg-white/90 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 transform">
                  {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-1" />}
                </button>
                
                <button 
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.min(audioRef.current.duration || 180, currentTime + 10);
                    }
                  }}
                  className="text-white/60 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
                <span>{formatTime(currentTime)}</span>
                <div 
                  onClick={handleSeek}
                  className="flex-1 bg-white/20 rounded-full h-1 cursor-pointer hover:bg-white/30 transition-colors duration-200">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-200"
                    style={{ width: `${(currentTime / (audioRef.current?.duration || 180)) * 100}%` }}></div>
                </div>
                <span>{formatTime(audioRef.current?.duration || 180)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-white/60" />
                <div 
                  onClick={handleVolumeChange}
                  className="flex-1 bg-white/20 rounded-full h-1 cursor-pointer hover:bg-white/30 transition-colors duration-200">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-200"
                    style={{ width: `${volume}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-white/40 text-xs flex items-center justify-center gap-1">
                © {new Date().getFullYear()} by Phy0n
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalPortfolio;