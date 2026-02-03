'use client';

import { useCallback, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type ToastTone = 'success' | 'error';

type AdminToastProps = {
  message?: string;
  tone?: ToastTone;
};

export default function AdminToast({ message, tone = 'success' }: AdminToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const clearQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('success');
    params.delete('error');
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!message) return;
    const clearTimer = window.setTimeout(() => clearQuery(), 3200);

    return () => {
      window.clearTimeout(clearTimer);
    };
  }, [clearQuery, message]);

  if (!message) return null;

  const isError = tone === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-[0_15px_40px_rgba(0,0,0,0.25)] transition-all duration-300 ${
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
        {message}
      </span>
      <button
        type="button"
        onClick={() => {
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
