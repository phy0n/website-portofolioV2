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
    <div className="overflow-hidden rounded-md border border-[var(--home-border)] bg-[var(--home-card)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="px-4 py-3">
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
          className="mt-2 w-full border-0 bg-transparent p-0 text-sm text-[var(--home-ink)] placeholder:text-[var(--home-muted)] opacity-35 outline-none"
        />
      </div>

      <div className="border-t border-[var(--home-border)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)]">Message</p>
          <p className="text-[10px] text-[var(--home-muted)]">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </p>
        </div>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(normalizeMessage(e.target.value));
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder="Write your message..."
          wrap="soft"
          rows={5}
          className="mt-3 max-h-60 min-h-44 w-full resize-none overflow-y-auto border-0 bg-transparent p-0 text-sm leading-relaxed text-[var(--home-ink)] placeholder:text-[var(--home-muted)] opacity-35 outline-none [overflow-wrap:anywhere] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin]"
        />
      </div>

      <input
        aria-hidden="true"
        tabIndex={-1}
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="hidden"
        autoComplete="off"
      />

      <div className="flex flex-col gap-3 border-t border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs leading-relaxed text-[var(--home-muted)]">
            {emailOk ? 'Reply by email.' : 'Add email to send.'}
          </p>
          {status === 'sent' ? (
            <p className="text-xs text-emerald-300" role="status">
              Sent. I&apos;ll reply soon.
            </p>
          ) : null}
          {status === 'error' && errorMessage ? (
            <p className="text-xs text-red-300" role="status">
              {errorMessage}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--home-ink)] transition hover:border-[var(--home-border)] hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50">
          <Send className="h-4 w-4" />
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
