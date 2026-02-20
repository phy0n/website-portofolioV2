'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getVisitorId } from '@/lib/visitor';

const DEDUPE_KEY = 'phion_analytics_last_event';
const DEDUPE_WINDOW_MS = 5000;

const sendAnalytics = (payload: { visitorId: string; path: string; referrer: string | null }) => {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics', blob);
    return;
  }

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
};

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    try {
      const raw = window.sessionStorage.getItem(DEDUPE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { path?: unknown; ts?: unknown };
        const lastPath = typeof parsed?.path === 'string' ? parsed.path : '';
        const lastTs = typeof parsed?.ts === 'number' ? parsed.ts : 0;
        if (lastPath === pathname && lastTs > 0 && Date.now() - lastTs < DEDUPE_WINDOW_MS) {
          return;
        }
      }

      window.sessionStorage.setItem(DEDUPE_KEY, JSON.stringify({ path: pathname, ts: Date.now() }));
    } catch {
      // Ignore sessionStorage failures.
    }

    const visitorId = getVisitorId();

    sendAnalytics({
      visitorId,
      path: pathname,
      referrer: document.referrer || null,
    });
  }, [pathname]);

  return null;
}
