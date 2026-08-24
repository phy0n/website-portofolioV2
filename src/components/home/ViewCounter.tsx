'use client';

import { useEffect, useState, useRef } from 'react';
import { FaEye } from 'react-icons/fa';
import { incrementAndGetViews } from '@/actions/views';

export default function ViewCounter() {
  const [views, setViews] = useState<number | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Increment and get views on mount
    incrementAndGetViews().then((count) => {
      setViews(count);
    });
  }, []);

  if (views === null) return null;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-[11px] sm:text-[13px] font-medium px-3 sm:px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 cursor-default whitespace-nowrap shrink-0">
      <FaEye className="text-white/70 text-[10px] sm:text-[12px]" />
      <span className="tabular-nums tracking-wide">{views.toLocaleString()}</span>
    </div>
  );
}
