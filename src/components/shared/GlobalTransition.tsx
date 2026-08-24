'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';

export default function GlobalTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('#') &&
        target.getAttribute('target') !== '_blank'
      ) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

        e.preventDefault();
        if (pathname === href) return;

        setIsTransitioning(true);

        setTimeout(() => {
          router.push(href);
        }, 700);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [router, pathname]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] pointer-events-none flex flex-col overflow-hidden">
      <div
        className={`w-full h-1/2 bg-[#050505] transition-transform duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)]`}
        style={{ transform: isTransitioning ? 'translateY(0)' : 'translateY(-100%)' }}
      />
      <div
        className={`w-full h-1/2 bg-[#050505] transition-transform duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)]`}
        style={{ transform: isTransitioning ? 'translateY(0)' : 'translateY(100%)' }}
      />

      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ${isTransitioning ? 'opacity-100 scale-100 delay-[300ms]' : 'opacity-0 scale-95 delay-0'
          }`}>
        <div className="flex items-center gap-6">
          <div className="w-12 h-[1px] bg-white/40 overflow-hidden relative">
            <div className="absolute inset-0 bg-white animate-[shimmer_1s_infinite]"></div>
          </div>
          <span className="text-white text-xs font-bold tracking-[0.6em] uppercase">Phy0n</span>
          <div className="w-12 h-[1px] bg-white/40 overflow-hidden relative">
            <div className="absolute inset-0 bg-white animate-[shimmer_1s_infinite]"></div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
