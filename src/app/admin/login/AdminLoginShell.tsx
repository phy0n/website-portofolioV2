'use client';

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

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

export default function AdminLoginShell({ children }: { children: React.ReactNode }) {
  const pageRef = useRef<HTMLDivElement | null>(null);

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

      gsap.fromTo(node, fromVars, toVars);
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
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      mutationObserver.disconnect();
      observer.disconnect();
      gsap.killTweensOf(animatedNodes);
    };
  }, []);

  return (
    <div
      ref={pageRef}
      className="admin-login-root home-portfolio relative min-h-screen overflow-hidden bg-[var(--home-bg)] text-[var(--home-ink)] font-nunito"
      data-page-content
    >
      <style>{`
        .admin-login-root {
          --admin-login-panel: var(--home-bg);
          --admin-login-line: #2a2b30;
          --admin-login-muted: rgba(255, 255, 255, 0.55);
          isolation: isolate;
        }

        .admin-login-root::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: var(--home-bg);
          opacity: 1;
        }

        .minimal-root .admin-login-root .admin-login-back {
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          padding: 0 !important;
          border: 0 !important;
          background: var(--home-bg) !important;
          color: rgba(255, 255, 255, 0.58) !important;
          text-decoration: none !important;
          transition: color 180ms ease, transform 180ms ease !important;
        }

        .minimal-root .admin-login-root .admin-login-back:hover {
          color: #ffffff !important;
          transform: translateX(-2px);
          text-decoration: none !important;
        }

        .minimal-root .admin-login-root .admin-login-card {
          width: 100% !important;
          border: 1px solid var(--admin-login-line) !important;
          border-radius: 8px !important;
          background: var(--admin-login-panel) !important;
          padding: 2rem !important;
          box-shadow: 0 28px 110px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
          -webkit-backdrop-filter: none !important;
          backdrop-filter: none !important;
        }

        .admin-login-field {
          position: relative;
        }

        .admin-login-field-icon {
          position: absolute;
          left: 0.95rem;
          top: 50%;
          color: var(--admin-login-muted);
          transform: translateY(-50%);
          pointer-events: none;
        }

        .minimal-root .admin-login-root .admin-login-input {
          display: block !important;
          width: 100% !important;
          min-height: 3rem !important;
          border: 1px solid rgba(255, 255, 255, 0.13) !important;
          border-radius: 8px !important;
          background: var(--home-bg) !important;
          padding: 0.8rem 1rem 0.8rem 2.75rem !important;
          color: #ffffff !important;
          font-size: 0.875rem !important;
          outline: none !important;
          transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease !important;
        }

        .minimal-root .admin-login-root .admin-login-input::placeholder {
          color: rgba(255, 255, 255, 0.34);
        }

        .minimal-root .admin-login-root .admin-login-input:focus {
          border-color: rgba(209, 74, 74, 0.78) !important;
          background: var(--home-bg) !important;
          box-shadow: 0 0 0 3px rgba(209, 74, 74, 0.15) !important;
        }

        .minimal-root .admin-login-root .admin-login-message {
          display: flex !important;
          gap: 0.7rem !important;
          border: 1px solid rgba(209, 74, 74, 0.28) !important;
          border-radius: 8px !important;
          background: #1a1010 !important;
          padding: 0.85rem 0.95rem !important;
          color: rgba(255, 255, 255, 0.8) !important;
          font-size: 0.76rem !important;
          line-height: 1.45 !important;
          white-space: pre-wrap !important;
        }

        .minimal-root .admin-login-root .admin-login-submit {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.55rem !important;
          width: 100% !important;
          min-height: 3rem !important;
          border: 1px solid #ffffff !important;
          border-radius: 999px !important;
          background: #ffffff !important;
          padding: 0.8rem 1.2rem !important;
          color: #000000 !important;
          font-size: 0.875rem !important;
          font-weight: 800 !important;
          text-decoration: none !important;
          transition: background 180ms ease, border-color 180ms ease, opacity 180ms ease, transform 180ms ease !important;
        }

        .minimal-root .admin-login-root .admin-login-submit:hover:not(:disabled) {
          background: #e6e6e6 !important;
          border-color: #e6e6e6 !important;
          transform: translateY(-1px);
          text-decoration: none !important;
        }

        .minimal-root .admin-login-root .admin-login-submit:disabled {
          cursor: not-allowed !important;
          opacity: 0.62 !important;
        }
      `}</style>
      {children}
    </div>
  );
}
