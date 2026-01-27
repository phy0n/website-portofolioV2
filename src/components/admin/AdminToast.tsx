'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type ToastTone = 'success' | 'error';

type AdminToastProps = {
  message?: string;
  tone?: ToastTone;
};

export default function AdminToast({ message, tone = 'success' }: AdminToastProps) {
  const [visible, setVisible] = useState(Boolean(message));
  const [currentMessage, setCurrentMessage] = useState(message ?? '');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();

  const clearQuery = () => {
    const params = new URLSearchParams(searchString);
    params.delete('success');
    params.delete('error');
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  useEffect(() => {
    if (!message) return;
    setCurrentMessage(message);
    setVisible(true);

    const hideTimer = window.setTimeout(() => setVisible(false), 2600);
    const clearTimer = window.setTimeout(() => clearQuery(), 3200);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearTimer);
    };
  }, [message, pathname, router, searchString]);

  useEffect(() => {
    if (message || visible) return;
    setCurrentMessage('');
  }, [message, visible]);

  if (!currentMessage) return null;

  const isError = tone === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-[0_15px_40px_rgba(0,0,0,0.25)] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
      } ${
        isError
          ? 'border-red-500/30 bg-red-500/10 text-red-100'
          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-50'
      }`}
    >
      <span className="inline-flex items-center gap-2">
        {isError ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        {currentMessage}
      </span>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          clearQuery();
        }}
        aria-label="Dismiss"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white/40 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
