'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Menu, MessageSquare, Sparkles, X } from 'lucide-react';
import gsap from 'gsap';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Chat', href: '/chat' },
  { label: 'Connect', href: '/connect' },
];

const NAV_AVATAR_SRC = '/image/profile.png';
const NAV_AVATAR_FALLBACK = 'P';
const NAV_BRAND = 'PHY0N';
const REVEAL_SELECTOR = [
  '[data-gsap="reveal"]',
  '.js-reveal',
  'section',
  'article',
  'aside',
  'form',
  'figure',
  'footer',
  'div',
  'img',
  '[class~="border"]',
  '.rounded-3xl',
  '.rounded-2xl',
  '.rounded-xl',
  '.rounded-lg',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'p',
  'li',
  'blockquote',
].join(', ');
const REVEAL_ANIMATION_CLASS = 'animate-slide-up';

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
};

interface SiteShellProps {
  children: React.ReactNode;
  scopeRef?: React.Ref<HTMLDivElement>;
  contentMode?: 'contained' | 'full';
  navAvatarSrc?: string | null;
}

export default function SiteShell({
  children,
  scopeRef,
  contentMode = 'contained',
  navAvatarSrc,
}: SiteShellProps) {
  const pathname = usePathname();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const navOverlayRef = useRef<HTMLElement | null>(null);
  const navListRef = useRef<HTMLUListElement | null>(null);
  const navTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const [navOpenFor, setNavOpenFor] = useState<string | null>(null);
  const [navAvatarErrorSrc, setNavAvatarErrorSrc] = useState<string | null>(null);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const navOpen = navOpenFor === pathname;
  const closeNav = () => setNavOpenFor(null);
  const toggleNav = () => setNavOpenFor((current) => (current === pathname ? null : pathname));
  const resolvedNavAvatarSrc = navAvatarSrc || NAV_AVATAR_SRC;
  const navAvatarErrored = navAvatarErrorSrc === resolvedNavAvatarSrc;
  const mainClassName =
    contentMode === 'full'
      ? 'relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-24'
      : 'relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-24';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.key === 'Escape') {
        setNavOpenFor(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin-session', { cache: 'no-store', signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { isAdmin?: boolean };
        setIsAdminSession(Boolean(data?.isAdmin));
      } catch (err) {
        const e = err as { name?: string };
        if (e?.name === 'AbortError') return;
      }
    };

    void checkAdmin();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [navOpen]);

  useEffect(() => {
    const overlay = navOverlayRef.current;
    const list = navListRef.current;
    if (!overlay || !list) return;

    navTimelineRef.current?.kill();
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    navTimelineRef.current = timeline;

    const isDesktop = window.matchMedia?.('(min-width: 640px)')?.matches;
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-nav-item]'));

    if (navOpen) {
      timeline.set(overlay, { pointerEvents: 'auto' });
      timeline.to(overlay, { autoAlpha: 1, duration: 0.2 }, 0);

      if (isDesktop) {
        timeline.fromTo(
          list,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.32 },
          0.06
        );
      } else {
        timeline.fromTo(list, { x: 96, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.32 }, 0.06);
      }

      if (items.length > 0) {
        timeline.fromTo(
          items,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06 },
          0.12
        );
      }
    } else {
      if (items.length > 0) {
        timeline.to(items, { autoAlpha: 0, y: -12, duration: 0.16, stagger: { each: 0.04, from: 'end' } }, 0);
      }

      if (isDesktop) {
        timeline.to(list, { autoAlpha: 0, y: -12, duration: 0.22 }, 0.05);
      } else {
        timeline.to(list, { x: 96, autoAlpha: 0, duration: 0.22 }, 0.05);
      }
      timeline.to(overlay, { autoAlpha: 0, duration: 0.18 }, 0.12);
      timeline.set(overlay, { pointerEvents: 'none' });
    }

    return () => {
      timeline.kill();
    };
  }, [navOpen, pathname]);

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const animatedNodes: HTMLElement[] = [];
    const isTransformed = (node: HTMLElement) => window.getComputedStyle(node).transform !== 'none';

    const reveal = (node: HTMLElement) => {
      if (node.classList.contains(REVEAL_ANIMATION_CLASS)) return;
      animatedNodes.push(node);

      const tag = node.tagName.toLowerCase();
      const distance = prefersReducedMotion ? 12 : 22;
      const duration = prefersReducedMotion ? 0.55 : 0.85;
      const eased = prefersReducedMotion ? 'power2.out' : 'power3.out';

      const fromVars: gsap.TweenVars = { autoAlpha: 0 };
      const allowTransform = !isTransformed(node);
      if (allowTransform) {
        fromVars.y = distance;
        if (tag === 'div' || tag === 'section' || tag === 'article' || tag === 'aside') {
          fromVars.scale = prefersReducedMotion ? 1 : 0.985;
          fromVars.filter = prefersReducedMotion ? 'none' : 'blur(10px)';
        } else if (tag.startsWith('h')) {
          fromVars.filter = prefersReducedMotion ? 'none' : 'blur(8px)';
        } else if (tag === 'img' || tag === 'figure') {
          fromVars.scale = prefersReducedMotion ? 1 : 1.02;
          fromVars.filter = prefersReducedMotion ? 'none' : 'blur(8px)';
        }
      }

      const toVars: gsap.TweenVars = {
        autoAlpha: 1,
        duration,
        ease: eased,
        onComplete: () => {
          node.classList.add(REVEAL_ANIMATION_CLASS);
          gsap.set(node, { clearProps: 'opacity,transform,visibility,filter' });
        },
      };

      if (allowTransform) {
        toVars.y = 0;
      }
      if (allowTransform && typeof fromVars.scale === 'number') {
        toVars.scale = 1;
      }
      if (allowTransform && typeof fromVars.filter === 'string') {
        toVars.filter = 'blur(0px)';
      }

      gsap.fromTo(
        node,
        fromVars,
        toVars
      );
    };

    const revealAll = () => {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
      animatedNodes.push(...nodes);

      gsap.fromTo(
        nodes,
        { autoAlpha: 0, y: prefersReducedMotion ? 12 : 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: prefersReducedMotion ? 0.55 : 0.85,
          ease: prefersReducedMotion ? 'power2.out' : 'power3.out',
          stagger: prefersReducedMotion ? 0.015 : 0.03,
          onComplete: () => {
            for (const node of nodes) node.classList.add(REVEAL_ANIMATION_CLASS);
            gsap.set(nodes, { clearProps: 'opacity,transform,visibility,filter' });
          },
        }
      );
    };

    if (!('IntersectionObserver' in window)) {
      revealAll();
      return () => {
        gsap.killTweensOf(animatedNodes);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const node = entry.target;
          if (!(node instanceof HTMLElement)) continue;
          reveal(node);
          observer.unobserve(node);
        }
      },
      { root: null, rootMargin: '0px 0px 10% 0px', threshold: 0 }
    );

    const seen = new WeakSet<Element>();
    let rafId: number | null = null;

    const scan = () => {
      rafId = null;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
      for (const node of nodes) {
        if (seen.has(node)) continue;
        seen.add(node);

        if (node.classList.contains(REVEAL_ANIMATION_CLASS)) continue;

        observer.observe(node);
      }
    };

    const scheduleScan = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(scan);
    };

    scan();

    const mutationObserver = new MutationObserver(scheduleScan);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      mutationObserver.disconnect();
      observer.disconnect();
      gsap.killTweensOf(animatedNodes);
    };
  }, [pathname]);



  return (
    <div ref={scopeRef} className="home-portfolio min-h-screen bg-[var(--home-bg)] text-[var(--home-ink)] font-nunito">
      <div className="relative isolate">
        <header className="js-nav fixed left-0 right-0 top-0 z-40 px-4 sm:px-8 xl:px-12 pt-5 animate-slide-down pointer-events-none">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between pointer-events-auto">
            <Link
              href="/"
              className="inline-flex items-center sm:gap-3 rounded-full border border-[var(--home-border)] bg-[var(--home-bg)] p-1.5 sm:px-4 sm:py-2 text-[var(--home-ink)] transition hover:border-[var(--home-ink)]"
              aria-label="Go to home">
              <div className="relative h-9 w-9 sm:h-8 sm:w-8 overflow-hidden rounded-full border border-[var(--home-border)] bg-[var(--home-bg)]">
                {navAvatarErrored ? (
                  <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--home-ink)] opacity-90">
                    {NAV_AVATAR_FALLBACK}
                  </span>
                ) : (
                  <Image
                    key={resolvedNavAvatarSrc}
                    src={resolvedNavAvatarSrc}
                    alt="Navbar avatar"
                    fill
                    sizes="36px"
                    className="object-cover"
                    onError={() => setNavAvatarErrorSrc(resolvedNavAvatarSrc)}
                  />
                )}
              </div>
              <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--home-ink)] opacity-80">{NAV_BRAND}</span>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                aria-label={navOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={navOpen}
                onClick={toggleNav}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-bg)] text-[var(--home-ink)] opacity-80 hover:opacity-100 transition hover:border-[var(--home-ink)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-bg)]">
                  {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </span>
              </button>
            </div>
          </div>
        </header>

        <nav
          ref={navOverlayRef}
          aria-hidden={!navOpen}
          className="fixed inset-0 z-50 flex items-center bg-[var(--home-bg)] opacity-0 pointer-events-none"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closeNav();
          }}>
          <ul
            ref={navListRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 sm:gap-6 sm:px-10">
            {NAV_LINKS.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

              return (
                <li key={item.href} data-nav-item>
                  <Link
                    href={item.href}
                    onClick={closeNav}
                    className={[
                      'block w-fit font-sans font-semibold leading-[0.95] tracking-tight transition',
                      'text-[clamp(2.75rem,8vw,6rem)]',
                      isActive ? 'text-[var(--home-ink)]' : 'text-[var(--home-muted)] hover:text-[var(--home-ink)]',
                    ].join(' ')}>
                    {item.label}
                  </Link>
                </li>
              );
            })}

            {isAdminSession ? (
              <li data-nav-item className="pt-4">
                <Link
                  href="/admin"
                  onClick={closeNav}
                  className={[
                    'block w-fit font-sans font-semibold leading-[0.95] tracking-tight transition',
                    'text-[clamp(1.85rem,5vw,3.25rem)]',
                    pathname?.startsWith('/admin') ? 'text-[var(--home-ink)]' : 'text-[var(--home-muted)] hover:text-[var(--home-ink)]',
                  ].join(' ')}>
                  Admin
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>

        <div ref={pageRef} data-page-content className="animate-page-fade" key={pathname}>
          <main className={mainClassName}>{children}</main>

          <footer className="relative z-10 flex flex-col items-center justify-center overflow-hidden border-t border-[var(--home-border)] pb-8 pt-12 sm:pb-12">
            <div className="mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <p className="text-[clamp(6rem,24vw,18rem)] font-sans font-bold uppercase leading-none tracking-[0.12em] text-[var(--home-ink)] opacity-90">
                PHY0N
              </p>
            </div>
            <div className="relative z-10 mx-auto mt-6 w-full max-w-7xl px-4 text-center text-xs text-[var(--home-muted)] sm:px-6 lg:px-8">
              Copyright {new Date().getFullYear()} Phy0n. All rights reserved.
            </div>
          </footer>
        </div>


      </div>
    </div>
  );
}
