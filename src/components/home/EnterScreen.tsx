'use client';

import { useState, useRef, useEffect } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export default function EnterScreen() {
  const [entered, setEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isFading, setIsFading] = useState(false);

  const handleEnter = () => {
    setIsFading(true);
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    setTimeout(() => {
      setEntered(true);
    }, 500); // Small delay to allow fade out to start
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-1000 ${
          isFading ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer'
        }`}
        onClick={handleEnter}
      >
        <div className={`flex flex-col items-center justify-center gap-4 animate-pulse transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-white text-lg font-mono tracking-[0.2em] uppercase">
            Click anywhere to enter
          </p>
          <div className="w-12 h-[1px] bg-white/30" />
        </div>
      </div>

      {/* Background Video */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-80"
        >
          <source src="/video/background.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay to make text readable */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)]" />
      </div>

      {/* Audio Element */}
      <audio
        id="bg-audio"
        ref={audioRef}
        src="/music/music4.mp3"
        loop
        preload="auto"
      />

      {/* Music Toggle Button */}
      <div className={`xl:hidden fixed bottom-6 right-6 z-[90] transition-all duration-1000 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button 
          onClick={toggleAudio}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-full hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center group"
          title={isPlaying ? "Mute Music" : "Play Music"}
        >
          {isPlaying ? <FaVolumeUp className="text-xl" /> : <FaVolumeMute className="text-xl" />}
        </button>
      </div>
    </>
  );
}
