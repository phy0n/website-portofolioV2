'use client';

import { useState, useRef, useEffect } from 'react';

import { FaVideo } from 'react-icons/fa';

const bgVideos = ['/video/background1.mp4', '/video/background2.mp4', '/video/background3.mp4'];

export default function EnterScreen() {
  const [entered, setEntered] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isFading, setIsFading] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    document.body.classList.remove('content-visible');
  }, []);

  useEffect(() => {
    if (!entered) return;

    const intervalId = setInterval(() => {
      setVideoIndex((prevIndex) => {
        const nextIdx = (prevIndex + 1) % bgVideos.length;

        if (videoRefs.current[nextIdx]) {
          videoRefs.current[nextIdx]?.play().catch(console.error);
        }

        setTimeout(() => {
          if (videoRefs.current[prevIndex]) {
            videoRefs.current[prevIndex]?.pause();
          }
        }, 1000);

        return nextIdx;
      });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [entered]);

  const handleEnter = () => {
    setIsFading(true);
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    if (videoRefs.current[videoIndex]) {
      videoRefs.current[videoIndex]?.play().catch(e => console.log('Video play failed:', e));
    }
    setTimeout(() => {
      setEntered(true);
    }, 500);

    setTimeout(() => {
      document.body.classList.add('content-visible');
    }, 2000);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-1000 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer'
          }`}
        onClick={handleEnter}>
        <div className={`flex flex-col items-center justify-center gap-4 animate-pulse transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-white text-xs sm:text-sm md:text-base font-mono tracking-[0.2em] uppercase text-center px-4">
            Click anywhere to enter
          </p>
          <div className="w-12 h-[1px] bg-white/30" />
        </div>
      </div>

      <div className={`fixed top-0 left-0 w-full h-[100vh] z-[-1] transition-opacity duration-1000 ${entered ? 'opacity-100' : 'opacity-0'}`}>
        {bgVideos.map((src, idx) => (
          <video
            key={src}
            ref={(el) => { videoRefs.current[idx] = el; }}
            loop
            muted
            playsInline
            preload="auto"
            className={`absolute top-0 left-0 w-full h-full object-cover scale-105 pointer-events-none transition-opacity duration-1000 ${videoIndex === idx ? 'opacity-100' : 'opacity-0'}`}>
            <source src={src} type="video/mp4" />
          </video>
        ))}
        <div className="absolute inset-0 bg-black/60 pointer-events-none transition-opacity duration-1000"></div>
      </div>
      <audio
        id="bg-audio"
        ref={audioRef}
        src="/music/music4.mp3"
        loop
        preload="auto"
      />

      {entered && (
        <button
          onClick={() => {
            const nextIdx = (videoIndex + 1) % bgVideos.length;
            setVideoIndex(nextIdx);
            videoRefs.current[nextIdx]?.play().catch(console.error);
            setTimeout(() => {
              videoRefs.current[videoIndex]?.pause();
            }, 1000);
          }}
          className="hidden md:flex cursor-pointer fixed bottom-8 right-8 z-[100] items-center gap-3 px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white/50 hover:text-white transition-all duration-500 shadow-2xl group"
          title="Switch Background">
          <FaVideo className="text-sm transition-transform duration-500 group-hover:scale-110" />
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase mt-[1px]">Next Scene</span>
        </button>
      )}

    </>
  );
}
