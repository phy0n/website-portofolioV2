'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';

export default function GlobalGsap({ children }: { children: React.ReactNode }) {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!scopeRef.current) return;
    if (pathname.startsWith('/admin')) return;

    const ctx = gsap.context(() => {
      const pageContent = scopeRef.current?.querySelectorAll<HTMLElement>('[data-page-content]');
      const revealTargets = scopeRef.current?.querySelectorAll<HTMLElement>('[data-gsap="reveal"]');

      if (pageContent && pageContent.length > 0) {
        gsap.fromTo(
          pageContent,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.45, ease: 'power2.out', clearProps: 'opacity' }
        );
      } else {
        gsap.fromTo(
          scopeRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.45, ease: 'power2.out', clearProps: 'opacity' }
        );
      }

      if (revealTargets && revealTargets.length > 0) {
        gsap.from(revealTargets, {
          y: 18,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.08,
          clearProps: 'opacity,transform',
        });
      }
    }, scopeRef);

    return () => ctx.revert();
  }, [pathname]);

  return <div ref={scopeRef}>{children}</div>;
}
