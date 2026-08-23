'use client';

import { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaSpotify } from 'react-icons/fa';

export default function CustomMusicPlayerWidget() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = document.getElementById('bg-audio') as HTMLAudioElement;
    
    if (!audio) return;

    const updateState = () => {
      setIsPlaying(!audio.paused);
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    // Update state immediately in case audio is already playing
    updateState();

    audio.addEventListener('play', updateState);
    audio.addEventListener('pause', updateState);
    audio.addEventListener('timeupdate', updateState);
    audio.addEventListener('loadedmetadata', updateState);

    return () => {
      audio.removeEventListener('play', updateState);
      audio.removeEventListener('pause', updateState);
      audio.removeEventListener('timeupdate', updateState);
      audio.removeEventListener('loadedmetadata', updateState);
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
    <div className="w-full rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 p-4 shadow-xl overflow-hidden relative group">
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <FaSpotify className="text-[#1DB954] text-xl" />
        <span className="text-white/80 text-sm font-bold tracking-wide">Now Playing</span>
      </div>

      <div className="flex items-center gap-4 mb-5 relative z-10">
        <div className="w-16 h-16 rounded-lg overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
          <img src="/image/lazypaws.png" alt="Lazy Paws" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-white font-bold text-[16px] truncate leading-tight mb-1 hover:underline cursor-pointer">
            Lazy Paws
          </h4>
          <p className="text-zinc-400 text-[13px] truncate">
            Chill & Aesthetic Vibes
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          style={{
            background: `linear-gradient(to right, #1DB954 ${(progress / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(progress / (duration || 1)) * 100}%)`
          }}
          className="w-full h-1.5 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
        />
        <div className="flex justify-between items-center text-[11px] text-zinc-400 font-medium">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 relative z-10">
        <button 
          className="text-zinc-400 hover:text-white transition-colors"
          onClick={() => {
            const audio = document.getElementById('bg-audio') as HTMLAudioElement;
            if(audio) audio.currentTime = 0;
          }}
        >
          <FaStepBackward className="text-lg" />
        </button>
        
        <button 
          onClick={togglePlay}
          className="w-12 h-12 flex items-center justify-center bg-white !text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl pl-1" />}
        </button>
        
        <button 
          className="text-zinc-400 hover:text-white transition-colors"
          onClick={() => {
            const audio = document.getElementById('bg-audio') as HTMLAudioElement;
            if(audio) {
              audio.currentTime = 0;
              if (audio.paused) audio.play();
            }
          }}
        >
          <FaStepForward className="text-lg" />
        </button>
      </div>
    </div>
  );
}
