'use client';

import { useState, useRef } from 'react';

export default function EnterScreen() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleEnter = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch((err) => console.error("Audio play failed:", err));
    }

    setIsFading(true);
    setTimeout(() => {
      setHasEntered(true);
    }, 1000);
  };

  if (hasEntered) {
    return (
      <audio ref={audioRef} loop>
        <source src="/music/music.mp3" type="audio/mpeg" />
      </audio>
    );
  }

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/music/music.mp3" type="audio/mpeg" />
      </audio>

      <div
        onClick={handleEnter}
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black cursor-pointer transition-opacity duration-1000 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex flex-col items-center justify-center gap-4 animate-pulse">
          <p className="text-white text-lg font-mono tracking-[0.2em] uppercase">
            Click anywhere to enter
          </p>
          <div className="w-12 h-[1px] bg-white/30" />
        </div>
      </div>
    </>
  );
}
