'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

export default function FocusClock() {
  const [time, setTime] = useState<Date | null>(null);
  const [view, setView] = useState<'clock' | 'stopwatch'>('clock');
  const [cursorVisible, setCursorVisible] = useState(true);

  // Hover states for explicit black/white styling
  const [isPlayHovered, setIsPlayHovered] = useState(false);
  const [isResetHovered, setIsResetHovered] = useState(false);
  const [isToggleHovered, setIsToggleHovered] = useState(false);

  // Stopwatch state (in-memory local state, resets on hard refresh)
  const [isSwRunning, setIsSwRunning] = useState(false);
  const [swElapsedMs, setSwElapsedMs] = useState(0);
  const swStartTimeRef = useRef<number>(0);
  const swTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Live Clock Interval
  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Stopwatch Start / Pause
  const handleStartPauseSw = useCallback(() => {
    if (isSwRunning) {
      setIsSwRunning(false);
      if (swTimerRef.current) clearInterval(swTimerRef.current);
    } else {
      setIsSwRunning(true);
      const start = Date.now() - swElapsedMs;
      swStartTimeRef.current = start;
      swTimerRef.current = setInterval(() => {
        setSwElapsedMs(Date.now() - start);
      }, 35);
    }
  }, [isSwRunning, swElapsedMs]);

  // Stopwatch Reset
  const handleResetSw = useCallback(() => {
    setIsSwRunning(false);
    if (swTimerRef.current) clearInterval(swTimerRef.current);
    setSwElapsedMs(0);
  }, []);

  // Clean up stopwatch on unmount
  useEffect(() => {
    return () => {
      if (swTimerRef.current) clearInterval(swTimerRef.current);
    };
  }, []);

  // Auto-hide cursor and controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setCursorVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setCursorVisible(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    }
  }, []);

  // Keyboard Shortcuts:
  // F: Fullscreen
  // S: Toggle between Clock & Stopwatch
  // Space: Start/Pause Stopwatch
  // R: Reset Stopwatch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 's' || e.key === 'S') {
        setView((prev) => (prev === 'clock' ? 'stopwatch' : 'clock'));
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleStartPauseSw();
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetSw();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStartPauseSw, handleResetSw, toggleFullscreen]);

  if (!time) {
    return <div className="min-h-screen w-full bg-[#000000]" />;
  }

  // Clock Formatting (in English)
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const dayName = DAYS[time.getDay()];
  const dateFormatted = `${MONTHS[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`;

  // Stopwatch Formatting
  const swTotalSeconds = Math.floor(swElapsedMs / 1000);
  const swHours = Math.floor(swTotalSeconds / 3600).toString().padStart(2, '0');
  const swMinutes = Math.floor((swTotalSeconds % 3600) / 60).toString().padStart(2, '0');
  const swSeconds = (swTotalSeconds % 60).toString().padStart(2, '0');
  const swCentiseconds = Math.floor((swElapsedMs % 1000) / 10).toString().padStart(2, '0');

  return (
    <div
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        toggleFullscreen();
      }}
      className={`min-h-screen w-full bg-[#000000] text-white flex flex-col items-center justify-center relative overflow-hidden select-none px-4 ${cursorVisible ? 'cursor-default' : 'cursor-none'
        }`}
    >
      {/* 1. CLOCK VIEW */}
      {view === 'clock' && (
        <div className="flex flex-col items-center justify-center text-center">
          {/* Day & Date in English */}
          <div className="text-white font-mono font-semibold tracking-[0.3em] uppercase text-lg sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-8">
            {dayName}, {dateFormatted}
          </div>

          {/* Huge Time */}
          <div className="text-white font-mono font-bold tracking-tight tabular-nums leading-none text-7xl sm:text-9xl md:text-[11rem] lg:text-[14rem] xl:text-[17rem]">
            <span>{hours}</span>
            <span className="mx-1 sm:mx-2 lg:mx-3 select-none">:</span>
            <span>{minutes}</span>
            <span className="mx-1 sm:mx-2 lg:mx-3 select-none">:</span>
            <span>{seconds}</span>
          </div>
        </div>
      )}

      {/* 2. STOPWATCH VIEW */}
      {view === 'stopwatch' && (
        <div className="flex flex-col items-center justify-center text-center">
          {/* Label */}
          <div className="text-white font-mono font-semibold tracking-[0.35em] uppercase text-lg sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-8">
            STOPWATCH
          </div>

          {/* Huge Stopwatch Time */}
          <div className="text-white font-mono font-bold tracking-tight tabular-nums leading-none text-7xl sm:text-9xl md:text-[11rem] lg:text-[14rem] xl:text-[17rem] flex items-baseline justify-center">
            <span>{swHours}</span>
            <span className="mx-1 sm:mx-2 lg:mx-3 select-none">:</span>
            <span>{swMinutes}</span>
            <span className="mx-1 sm:mx-2 lg:mx-3 select-none">:</span>
            <span>{swSeconds}</span>
            <span className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl ml-2 sm:ml-4 font-normal">
              .{swCentiseconds}
            </span>
          </div>

          {/* Stopwatch Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8 sm:mt-14">
            {/* Start / Pause Button - Pure white background with pitch black text */}
            <button
              onClick={handleStartPauseSw}
              onMouseEnter={() => setIsPlayHovered(true)}
              onMouseLeave={() => setIsPlayHovered(false)}
              style={{
                backgroundColor: isPlayHovered ? '#d4d4d8' : '#ffffff',
                color: '#000000',
              }}
              className="font-mono font-bold text-sm sm:text-base tracking-widest px-8 sm:px-10 py-3 sm:py-3.5 rounded-lg active:scale-95 transition-all cursor-pointer !no-underline hover:!no-underline"
            >
              <span style={{ color: '#000000' }} className="font-bold select-none">
                {isSwRunning ? 'PAUSE' : swElapsedMs > 0 ? 'RESUME' : 'START'}
              </span>
            </button>

            {/* Reset Button - Inverts cleanly on hover */}
            <button
              onClick={handleResetSw}
              disabled={swElapsedMs === 0}
              onMouseEnter={() => setIsResetHovered(true)}
              onMouseLeave={() => setIsResetHovered(false)}
              style={{
                backgroundColor: swElapsedMs > 0 && isResetHovered ? '#ffffff' : '#000000',
                color: swElapsedMs > 0 ? (isResetHovered ? '#000000' : '#ffffff') : 'rgba(255, 255, 255, 0.3)',
                borderColor: swElapsedMs > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
              }}
              className={`border-2 font-mono font-bold text-sm sm:text-base tracking-widest px-7 sm:px-9 py-3 sm:py-3.5 rounded-lg transition-all !no-underline hover:!no-underline ${swElapsedMs > 0 ? 'active:scale-95 cursor-pointer' : 'cursor-not-allowed'
                }`}
            >
              <span
                style={{
                  color: swElapsedMs > 0 ? (isResetHovered ? '#000000' : '#ffffff') : 'rgba(255, 255, 255, 0.3)',
                }}
                className="select-none font-bold"
              >
                RESET
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Small Toggle Button at Bottom-Right Corner */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-opacity duration-300 ${cursorVisible ? 'opacity-70 hover:opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <button
          onClick={() => setView((prev) => (prev === 'clock' ? 'stopwatch' : 'clock'))}
          onMouseEnter={() => setIsToggleHovered(true)}
          onMouseLeave={() => setIsToggleHovered(false)}
          style={{
            backgroundColor: isToggleHovered ? '#ffffff' : '#000000',
            color: isToggleHovered ? '#000000' : '#ffffff',
            borderColor: '#ffffff',
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md border font-mono text-xs tracking-widest uppercase transition-all cursor-pointer !no-underline hover:!no-underline"
        >
          {view === 'clock' ? (
            <>
              {isSwRunning && (
                <span
                  style={{ backgroundColor: isToggleHovered ? '#000000' : '#ffffff' }}
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                />
              )}
              <span style={{ color: isToggleHovered ? '#000000' : '#ffffff' }} className="font-semibold">
                STOPWATCH
              </span>
            </>
          ) : (
            <span style={{ color: isToggleHovered ? '#000000' : '#ffffff' }} className="font-semibold">
              CLOCK
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
