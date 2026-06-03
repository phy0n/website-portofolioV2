'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target || !target.href) return;

      const url = new URL(target.href);
      const isExternal = url.origin !== window.location.origin;
      const isHash = url.hash && url.pathname === window.location.pathname;
      const isSamePage = url.pathname === window.location.pathname;
      const isTargetBlank = target.target === '_blank';
      if (isExternal || isHash || isTargetBlank || isSamePage) {
        return;
      }

      e.preventDefault();
      
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      
      const href = url.pathname + url.search + url.hash;
      
      if (containerRef.current) {
        containerRef.current.style.display = 'flex';
        containerRef.current.style.pointerEvents = 'auto';

        gsap.killTweensOf([containerRef.current, shapeRef.current, textRef.current]);
        gsap.set([shapeRef.current, textRef.current], { autoAlpha: 0 });
        gsap.to(containerRef.current, { 
          yPercent: 0, 
          duration: 0.5, 
          ease: 'power3.inOut',
          onComplete: () => {
            router.push(href);
          }
        });
      } else {
        router.push(href);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [router]);

  useEffect(() => {
    isNavigatingRef.current = false;
    if (!containerRef.current || !shapeRef.current || !textRef.current) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = previousOverflow;
        if (containerRef.current) {
          containerRef.current.style.pointerEvents = 'none';
          containerRef.current.style.display = 'none';
        }
      },
    });

    gsap.set(containerRef.current, { yPercent: 0, display: 'flex' });
    gsap.set(shapeRef.current, { width: '8px', height: '8px', borderRadius: '50%', autoAlpha: 0, scale: 0 });
    gsap.set(textRef.current, { autoAlpha: 0, y: 10 });

    tl.to(shapeRef.current, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)', delay: 0.2 })
      .to(shapeRef.current, { width: '100%', borderRadius: '4px', duration: 0.6, ease: 'power3.inOut' })
      .to(shapeRef.current, { height: '1px', duration: 0.3, ease: 'power2.inOut' }, '-=0.2')
      .to(textRef.current, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1')
      .to([shapeRef.current, textRef.current], { autoAlpha: 0, y: -10, duration: 0.4, ease: 'power2.in', stagger: 0.1 }, '+=0.2')
      .to(containerRef.current, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' });

    return () => {
      tl.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, [pathname]); 

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white pointer-events-none"
      style={{ display: 'none' }} >
      <div className="flex flex-col items-center justify-center w-full max-w-[200px] gap-6">
        <div ref={shapeRef} className="bg-white" />
        <div ref={textRef} className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/80">
          Loading
        </div>
      </div>
    </div>
  );
}
