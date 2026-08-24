'use client';

import { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaSpotify } from 'react-icons/fa';

export default function CustomMusicPlayerWidget() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let pollInterval: NodeJS.Timeout;

    const updateState = () => {
      if (!audio) return;
      setIsPlaying(!audio.paused);
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const attachListeners = () => {
      audio = document.getElementById('bg-audio') as HTMLAudioElement;
      if (audio) {
        if (pollInterval) clearInterval(pollInterval);
        
        updateState();
        audio.addEventListener('play', updateState);
        audio.addEventListener('pause', updateState);
        audio.addEventListener('timeupdate', updateState);
        audio.addEventListener('loadedmetadata', updateState);
      }
    };

    attachListeners();
    if (!audio) {
      pollInterval = setInterval(attachListeners, 500);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (audio) {
        audio.removeEventListener('play', updateState);
        audio.removeEventListener('pause', updateState);
        audio.removeEventListener('timeupdate', updateState);
        audio.removeEventListener('loadedmetadata', updateState);
      }
    };
  }, []);

  const togglePlay = () => {
    const audio = document.getElementById('bg-audio') as HTMLAudioElement;
    if (audio) {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById('bg-audio') as HTMLAudioElement;
    if (audio) {
      const newTime = Number(e.target.value);
      audio.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-full p-5 overflow-hidden relative group flex items-center gap-4 transition-colors duration-300">
      
      {/* Album Art */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
        <img src="/image/lazypaws.png" alt="Lazy Paws" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
      </div>

      {/* Track Info & Progress */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
        <div className="flex items-center gap-2">
          <FaSpotify className="text-[#1DB954] text-xs flex-shrink-0" />
          <h4 className="text-white/90 font-bold text-[13px] truncate leading-none">
            Lazy Paws
          </h4>
        </div>
        <p className="text-white/50 text-[11px] truncate leading-none">
          Chill & Aesthetic Vibes
        </p>

        {/* Minimal Progress */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-white/40 font-medium w-6">{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            style={{
              background: `linear-gradient(to right, #ffffff ${(progress / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(progress / (duration || 1)) * 100}%)`
            }}
            className="flex-1 h-[2px] rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-150 transition-all"
          />
          <span className="text-[9px] text-white/40 font-medium w-6 text-right">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Play/Pause Button */}
      <button 
        onClick={togglePlay}
        className="cursor-pointer w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white/10 text-white rounded-full transition-all duration-300 active:scale-95 hover:bg-white/20"
      >
        {isPlaying ? <FaPause className="text-[13px]" /> : <FaPlay className="text-[13px] pl-0.5" />}
      </button>

    </div>
  );
}
