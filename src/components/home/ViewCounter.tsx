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
    <div className="flex items-center gap-1.5 text-zinc-400 text-[13px] font-medium px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:text-white hover:bg-white/10 transition-all cursor-default">
      <FaEye className="text-[14px]" />
      <span className="tabular-nums tracking-wide">{views.toLocaleString()}</span>
    </div>
  );
}
