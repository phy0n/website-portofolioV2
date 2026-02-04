'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Gamepad2, Home, Info, Menu, ShieldCheck, Sparkles, X } from 'lucide-react';
import { gsap } from 'gsap';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Connect', href: '/connect' },
  { label: 'Blog', href: '/blog' },
];

const SECTION_LINKS = [
  { label: 'About', href: '/#about', icon: Info },
  { label: 'Skills', href: '/#skills', icon: Sparkles },
  { label: 'Experience', href: '/#experience', icon: ShieldCheck },
  { label: 'Projects', href: '/#projects', icon: Home },
  { label: 'Certificates', href: '/#certificates', icon: ShieldCheck },
  { label: 'Latest', href: '/#latest', icon: BookOpen },
];

interface SiteShellProps {
  children: React.ReactNode;
  scopeRef?: React.Ref<HTMLDivElement>;
  contentMode?: 'contained' | 'full';
}

export default function SiteShell({ children, scopeRef, contentMode = 'contained' }: SiteShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarAvatarUrl, setSidebarAvatarUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuTimeline = useRef<gsap.core.Timeline | null>(null);
  const pathname = usePathname();
  const mainClassName =
    contentMode === 'full'
      ? 'relative z-10 pb-20 pt-24'
      : 'relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24';
  const showAdminDashboard = pathname === '/' && isAdmin;

  useEffect(() => {
    const schedule = (fn: () => void) => {
      const w = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
      if (w.requestIdleCallback) {
        w.requestIdleCallback(fn, { timeout: 1200 });
      } else {
        window.setTimeout(fn, 250);
      }
    };

    const fetchAvatar = async () => {
      try {
        const res = await fetch('/api/discord-avatar');
        const data = await res.json();
        setSidebarAvatarUrl(data.avatarUrl || null);
      } catch (err) {
        console.error('Failed to fetch sidebar avatar:', err);
      }
    };

    schedule(fetchAvatar);
  }, []);

  useEffect(() => {
    if (pathname !== '/') return;

    const controller = new AbortController();

    const checkAdminSession = async () => {
      try {
        const res = await fetch('/api/admin-session', { cache: 'no-store', signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { isAdmin?: boolean };
        setIsAdmin(Boolean(data.isAdmin));
      } catch (err) {
        const error = err as { name?: string };
        if (error?.name === 'AbortError') return;
      }
    };

    void checkAdminSession();
    return () => controller.abort();
  }, [pathname]);

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
        {/* Desktop left sidebar */}
        <aside className="js-nav fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-white/10 bg-black/85 backdrop-blur lg:flex">
          <div className="px-6 pt-6">
            <div className="mt-6 flex items-center justify-between">
              <Link
                href="/"
                className="js-nav-logo text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--home-muted)] transition hover:text-[var(--home-ink)]">
                Portfolio
              </Link>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)]">
                Main
              </span>
            </div>

            <Link href="/" className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 mt-5 transition hover:border-white/20">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[var(--home-soft)]">
                {sidebarAvatarUrl ? (
                  <Image src={sidebarAvatarUrl} alt="Profile avatar" fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--home-ink)]">
                    P
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white transition group-hover:text-white">Phy0n</p>
                <p className="truncate text-xs text-[var(--home-muted)]">@Phy0n</p>
              </div>
            </Link>

            <div className="border-t border-white/10">
              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Navigation</p>
                <nav className="mt-4 space-y-1" aria-label="Primary">
                  {NAV_LINKS.map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
                    const Icon = item.href === '/'
                      ? Home
                      : item.href === '/games'
                        ? Gamepad2
                        : item.href === '/connect'
                          ? Info
                          : BookOpen;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          'js-nav-item group flex items-center justify-between rounded-2xl border px-4 py-3 transition',
                          isActive
                            ? 'border-white/15 bg-white/[0.05] text-white'
                            : 'border-transparent bg-transparent text-[var(--home-muted)] hover:border-white/10 hover:bg-white/[0.03] hover:text-white',
                        ].join(' ')}>
                        <span className="flex items-center gap-3 text-sm font-semibold">
                          <Icon className="h-4 w-4 text-[var(--home-accent)]" />
                          {item.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.35em] text-white/40 transition group-hover:text-white/60">
                          Go
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          <div className="mt-8 px-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Sections</p>
            <div className="mt-4 grid gap-2">
              {SECTION_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="js-nav-item flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-[var(--home-muted)] transition hover:border-white/20 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-[var(--home-accent)]" />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Mobile top navbar */}
        <header className="js-nav fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:py-5">
            <Link
              href="/"
              className="js-nav-logo text-sm font-semibold uppercase tracking-[0.35em] text-[var(--home-ink)]"
            >
              Phy0n
            </Link>
            <nav
              className="hidden flex-wrap items-center justify-end gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.28em] text-white md:flex"
              aria-label="Primary"
            >
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="js-nav-item rounded-full px-2 py-1 text-white transition hover:text-white/70"
                >
                  {item.label}
                </Link>
              ))}
              {showAdminDashboard ? (
                <Link
                  href="/admin"
                  className="js-nav-item inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <ShieldCheck className="h-4 w-4 text-[var(--home-accent)]" />
                  Dashboard Admin
                </Link>
              ) : null}
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

        <div className="lg:pl-72">
        {showAdminDashboard ? (
          <Link
            href="/admin"
            className="fixed right-5 top-5 z-[55] hidden items-center gap-2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur transition hover:border-white/20 hover:bg-black/60 lg:inline-flex">
            <ShieldCheck className="h-4 w-4 text-[var(--home-accent)]" />
          </Link>
        ) : null}
        <div
          ref={menuRef}
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur opacity-0 invisible"
          role="dialog"
          aria-modal="true"
          aria-hidden={!menuOpen}>
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
            {showAdminDashboard ? (
              <div className="mt-auto pt-10 md:hidden">
                <a
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="js-menu-item inline-flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]">
                  <span className="inline-flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-[var(--home-accent)]" />
                    Dashboard Admin
                  </span>
                  <span className="text-xs uppercase tracking-[0.35em] text-white/60">Go</span>
                </a>
              </div>
            ) : null}
          </div>
        </div>

        <main data-page-content className={mainClassName}>
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
    </div>
  );
}
