'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'phion_visitor_id';

const createVisitorId = () => {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }
  }

  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
};

const getVisitorId = () => {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const created = createVisitorId();
    window.localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    return createVisitorId();
  }
};

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
    const visitorId = getVisitorId();

    sendAnalytics({
      visitorId,
      path: pathname,
      referrer: document.referrer || null,
    });
  }, [pathname]);

  return null;
}
