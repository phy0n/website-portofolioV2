'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Menu, MessageSquare, Sparkles, X } from 'lucide-react';
import gsap from 'gsap';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Post', href: '/blog' },
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
  const [ctaOpen, setCtaOpen] = useState(false);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const navOpen = navOpenFor === pathname;
  const closeNav = () => setNavOpenFor(null);
  const toggleNav = () => setNavOpenFor((current) => (current === pathname ? null : pathname));
  const toggleCta = () => setCtaOpen((current) => !current);
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
        setCtaOpen(false);
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

  useEffect(() => {
    if (!ctaOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const node = event.target instanceof Node ? event.target : null;
      if (!node) return;
      if (ctaRef.current && ctaRef.current.contains(node)) return;
      setCtaOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [ctaOpen]);

  const showStickyCta = Boolean(pathname && !pathname.startsWith('/admin'));

  return (
    <div ref={scopeRef} className="home-portfolio min-h-screen bg-[var(--home-bg)] text-[var(--home-ink)] font-nunito">
      <div className="relative isolate">
        <header className="js-nav fixed left-0 right-0 top-0 z-40 px-4 pt-5 animate-slide-down">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur transition hover:border-white/20"
              aria-label="Go to home"
            >
              <div className="relative hidden h-8 w-8 overflow-hidden rounded-full border border-white/15 bg-white/[0.06] sm:block">
                {navAvatarErrored ? (
                  <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/90">
                    {NAV_AVATAR_FALLBACK}
                  </span>
                ) : (
                  <Image
                    key={resolvedNavAvatarSrc}
                    src={resolvedNavAvatarSrc}
                    alt="Navbar avatar"
                    fill
                    sizes="32px"
                    className="object-cover"
                    onError={() => setNavAvatarErrorSrc(resolvedNavAvatarSrc)}
                  />
                )}
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/80">{NAV_BRAND}</span>
            </Link>

            <button
              type="button"
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={navOpen}
              onClick={toggleNav}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/80 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur transition hover:border-white/20 hover:text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </span>
            </button>
          </div>
        </header>

        <nav
          ref={navOverlayRef}
          aria-hidden={!navOpen}
          className="fixed inset-0 z-50 flex items-center bg-black/95 backdrop-blur-sm opacity-0 pointer-events-none"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closeNav();
          }}
        >
          <ul
            ref={navListRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 sm:gap-6 sm:px-10"
          >
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
                      isActive ? 'text-white' : 'text-white/55 hover:text-white',
                    ].join(' ')}
                  >
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
                    pathname?.startsWith('/admin') ? 'text-white' : 'text-white/55 hover:text-white',
                  ].join(' ')}
                >
                  Admin
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>

        <div ref={pageRef} data-page-content className="animate-page-fade" key={pathname}>
          <main className={mainClassName}>{children}</main>

          <footer className="relative z-10 overflow-hidden border-t border-white/10">
            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 pt-8 text-xs text-[var(--home-muted)]">
              Copyright {new Date().getFullYear()} Phy0n. All rights reserved.
            </div>
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 text-center">
              <p className="text-[clamp(6rem,24vw,18rem)] font-sans font-bold uppercase tracking-[0.12em] leading-none text-white">
                PHY0N
              </p>
            </div>
          </footer>
        </div>

        {showStickyCta ? (
          <div ref={ctaRef} className="fixed bottom-6 right-6 z-40 hidden sm:block">
            <div
              className={[
                'flex h-12 items-center overflow-hidden rounded-full border border-white/10 bg-black/70 text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur transition-all duration-300 motion-reduce:transition-none',
                ctaOpen ? 'w-[min(92vw,440px)]' : 'w-12',
              ].join(' ')}
            >
              <button
                type="button"
                aria-label={ctaOpen ? 'Close quick actions' : 'Open quick actions'}
                aria-expanded={ctaOpen}
                onClick={toggleCta}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center text-white/80 transition hover:text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                  {ctaOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </span>
              </button>

              <div
                className={[
                  'flex min-w-0 flex-1 items-center justify-center gap-2 px-2 transition-opacity duration-200 motion-reduce:transition-none',
                  ctaOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
                ].join(' ')}
              >
                <a
                  href="mailto:phymee@proton.me?subject=Hire%20me"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  aria-label="Hire me via email"
                >
                  <Mail className="h-4 w-4 text-[var(--home-accent)]" />
                  Hire
                </a>
                <Link
                  href="/connect"
                  onClick={() => setCtaOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  aria-label="Open contact page"
                >
                  <Sparkles className="h-4 w-4 text-[var(--home-accent)]" />
                  Contact
                </Link>
                <Link
                  href="/chat"
                  onClick={() => setCtaOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  aria-label="Open chat page"
                >
                  <MessageSquare className="h-4 w-4 text-[var(--home-accent)]" />
                  Chat
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
