'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { gsap } from 'gsap';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Connect', href: '/connect' },
  { label: 'Blog', href: '/blog' },
];

interface SiteShellProps {
  children: React.ReactNode;
  scopeRef?: React.Ref<HTMLDivElement>;
}

export default function SiteShell({ children, scopeRef }: SiteShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuTimeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useLayoutEffect(() => {
    if (!menuRef.current) return;

    const menuHeader = menuRef.current.querySelector('.js-menu-header');
    const menuItems = menuRef.current.querySelectorAll('.js-menu-item');

    menuTimeline.current = gsap
      .timeline({ paused: true })
      .set(menuRef.current, { autoAlpha: 0, xPercent: 100, pointerEvents: 'none' })
      .to(menuRef.current, {
        autoAlpha: 1,
        xPercent: 0,
        duration: 0.4,
        ease: 'power3.out',
        pointerEvents: 'auto',
      })
      .from(menuHeader, { y: -12, opacity: 0, duration: 0.3, ease: 'power2.out' }, '-=0.2')
      .from(menuItems, { y: 18, opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.15');

    return () => {
      menuTimeline.current?.kill();
      menuTimeline.current = null;
    };
  }, []);

  useEffect(() => {
    if (!menuTimeline.current) return;
    if (menuOpen) {
      menuTimeline.current.play();
    } else {
      menuTimeline.current.reverse();
    }
  }, [menuOpen]);

  return (
    <div ref={scopeRef} className="home-portfolio min-h-screen bg-[var(--home-bg)] text-[var(--home-ink)] font-nunito">
      <div className="relative isolate">
        <header className="js-nav fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:py-5">
            <a href="/" className="js-nav-logo text-sm font-semibold uppercase tracking-[0.35em] text-[var(--home-ink)]">
              Phy0n
            </a>
            <nav
              className="hidden flex-wrap items-center justify-end gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.28em] text-white md:flex"
              aria-label="Primary"
            >
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="js-nav-item rounded-full px-2 py-1 text-white transition hover:text-white/70"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="js-nav-toggle inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.35em] text-[var(--home-ink)] md:hidden"
            >
              Menu
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div
          ref={menuRef}
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur opacity-0 invisible"
          role="dialog"
          aria-modal="true"
          aria-hidden={!menuOpen}
        >
          <div className="relative flex h-full flex-col px-6 py-6">
            <div className="js-menu-header flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-white/10 p-2 text-[var(--home-ink)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-10 flex flex-col gap-6">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="js-menu-item flex items-center justify-between border-b border-white/10 pb-4 text-lg font-semibold text-[var(--home-ink)]"
                >
                  {item.label}
                  <span className="text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">Go</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <main data-page-content className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24">
          {children}
        </main>

        <footer className="relative z-10 overflow-hidden border-t border-white/10">
          <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-8 text-xs text-[var(--home-muted)]">
            Copyright {new Date().getFullYear()} Phy0n. All rights reserved.
          </div>
          <div className="mx-auto max-w-6xl px-4 pb-6 text-center">
            <p className="text-[clamp(6rem,24vw,18rem)] font-sans font-bold uppercase tracking-[0.12em] leading-none text-white">
              PHY0N
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
