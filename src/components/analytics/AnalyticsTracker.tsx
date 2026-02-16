'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getVisitorId } from '@/lib/visitor';

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
