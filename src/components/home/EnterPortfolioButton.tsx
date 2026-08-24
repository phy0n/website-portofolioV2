'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { FaGlobe } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa6';

export default function EnterPortfolioButton() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <a
      href="/portfolio"
      className="cursor-pointer group relative flex w-fit mx-auto items-center justify-center gap-3 overflow-hidden rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-8 py-3.5 text-white transition-all duration-300 active:scale-[0.98] shadow-xl hover:border-white/30">

      <FaGlobe className="text-lg text-white/80" />
      <span className="font-bold tracking-wide text-[14px]">Enter Portfolio</span>
      <FaArrowRight className="text-sm opacity-80 transition-transform duration-300 group-hover:translate-x-1" />

    </a>
  );
}
