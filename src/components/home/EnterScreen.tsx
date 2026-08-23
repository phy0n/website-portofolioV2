'use client';

import { useState, useRef } from 'react';

export default function EnterScreen() {
  const [entered, setEntered] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Play video after mount to avoid blocking page load
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log('Video play failed:', e));
    }
  }, []);

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
          <p className="text-white text-xs sm:text-sm md:text-base font-mono tracking-[0.2em] uppercase text-center px-4">
            Click anywhere to enter
          </p>
          <div className="w-12 h-[1px] bg-white/30" />
        </div>
      </div>

      {/* Main Content Background Video */}
      <div className={`fixed top-0 left-0 w-full h-[100vh] z-[-1] transition-opacity duration-1000 ${entered ? 'opacity-100' : 'opacity-0'}`}>
        <video 
          ref={videoRef}
          loop 
          muted 
          playsInline 
          preload="none"
          className="absolute top-0 left-0 w-full h-full object-cover scale-105 pointer-events-none"
        >
          <source src="/video/background.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay specifically for the video */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none transition-opacity duration-1000"></div>
      </div>

      {/* Audio Element */}
      <audio
        id="bg-audio"
        ref={audioRef}
        src="/music/music4.mp3"
        loop
        preload="auto"
      />

    </>
  );
}
