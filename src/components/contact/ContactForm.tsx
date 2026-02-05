'use client';

import React, { useMemo, useState } from 'react';
import { Send } from 'lucide-react';

const MAX_MESSAGE_LENGTH = 2000;

const isValidEmail = (value: string) => {
  const email = value.trim();
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const normalizeMessage = (value: string) =>
  value.replace(/\r\n/g, '\n').slice(0, MAX_MESSAGE_LENGTH);

export default function ContactForm({ source }: { source?: 'home' | 'connect' | 'other' }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailOk = useMemo(() => isValidEmail(email), [email]);
  const messageOk = useMemo(() => Boolean(message.trim()), [message]);
  const canSend = emailOk && messageOk && !sending;

  const handleSend = async () => {
    if (!canSend) return;

    setSending(true);
    setStatus('idle');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          source: source ?? 'other',
          company,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!res.ok || !data?.ok) {
        setStatus('error');
        setErrorMessage('Failed to send your message. Please try again.');
        return;
      }

      setStatus('sent');
      setMessage('');
    } catch {
      setStatus('error');
      setErrorMessage('Failed to send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)]">Email</p>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder="email@domain.com"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[var(--home-ink)] placeholder:text-white/30 outline-none focus:border-white/20"
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)]">Message</p>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(normalizeMessage(e.target.value));
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder={emailOk ? 'Write your message...' : 'Enter a valid email first'}
            rows={3}
            disabled={!emailOk}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-[var(--home-ink)] placeholder:text-white/30 outline-none focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[var(--home-muted)]">
              {emailOk ? 'Ready when you are.' : 'Enter a valid email first to type your message.'}
            </p>
            <p className="text-[10px] text-[var(--home-muted)]">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </p>
          </div>
        </div>
      </div>

      <input
        aria-hidden="true"
        tabIndex={-1}
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="hidden"
        autoComplete="off"
      />

      {status === 'sent' ? (
        <p className="text-xs text-emerald-300" role="status">
          Sent! I&apos;ll reply to your email.
        </p>
      ) : null}

      {status === 'error' && errorMessage ? (
        <p className="text-xs text-red-300" role="status">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--home-ink)] transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {sending ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
