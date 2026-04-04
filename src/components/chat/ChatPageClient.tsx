'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChatPanel, type ChatMessage } from '@/components/chat/ChatSidebar';
import { CHAT_AUTHOR_NAME, normalizeChatMessage, normalizeChatName } from '@/lib/chat';
import { getVisitorId } from '@/lib/visitor';

const NAME_KEY = 'phion_chat_name';

export default function ChatPageClient() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visitorId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return getVisitorId();
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(NAME_KEY);
      if (stored) setName(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (isAdmin) return;
      window.localStorage.setItem(NAME_KEY, normalizeChatName(name));
    } catch {
      // ignore
    }
  }, [name, isAdmin]);

  useEffect(() => {
    const controller = new AbortController();

    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin-session', { cache: 'no-store', signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { isAdmin?: boolean };
        setIsAdmin(Boolean(data?.isAdmin));
      } catch (err) {
        const e = err as { name?: string };
        if (e?.name === 'AbortError') return;
      }
    };

    void checkAdmin();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setName(CHAT_AUTHOR_NAME);
  }, [isAdmin]);

  const fetchMessages = async (signal?: AbortSignal) => {
    try {
      setError(null);
      const res = await fetch('/api/chat?limit=60', { cache: 'no-store', signal });
      const data = (await res.json()) as { ok?: boolean; messages?: ChatMessage[]; error?: string };
      if (!res.ok || !data?.ok) {
        setError('Chat is having issues. Try refreshing.');
        setLoading(false);
        return;
      }
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setLoading(false);
    } catch (err) {
      const e = err as { name?: string };
      if (e?.name === 'AbortError') return;
      setError('Chat is having issues. Try refreshing.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const schedule = (fn: () => void) => {
      const w = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
      if (w.requestIdleCallback) {
        w.requestIdleCallback(fn, { timeout: 1200 });
      } else {
        window.setTimeout(fn, 250);
      }
    };

    schedule(() => {
      void fetchMessages(controller.signal);
    });

    const interval = window.setInterval(() => {
      void fetchMessages(controller.signal);
    }, 6000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete chat message?')) return;

    setError(null);

    try {
      const res = await fetch(`/api/chat?id=${encodeURIComponent(String(id))}`, { method: 'DELETE', cache: 'no-store' });
      const data = (await res.json().catch(() => null)) as { ok?: boolean };
      if (!res.ok || !data?.ok) {
        setError('Failed to delete the message. Try again.');
        return;
      }
      setMessages((prev) => prev.filter((item) => item.id !== id));
      setReplyTo((current) => (current?.id === id ? null : current));
    } catch {
      setError('Failed to delete the message. Try again.');
    }
  };

  const handleTogglePin = async (id: number, pinned: boolean) => {
    if (!isAdmin) return;
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'PATCH',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pinned }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean };
      if (!res.ok || !data?.ok) {
        setError('Failed to update pinned message. Try again.');
        return;
      }
      await fetchMessages();
    } catch {
      setError('Failed to update pinned message. Try again.');
    }
  };

  const handleSend = async () => {
    if (sending) return;
    const safeName = normalizeChatName(name);
    const safeMessage = normalizeChatMessage(message);
    if (!safeName || !safeMessage) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: safeName, message: safeMessage, visitorId, replyToId: replyTo?.id ?? null }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: ChatMessage | null;
        error?: string;
      };

      if (!res.ok || !data?.ok) {
        if (res.status === 429) {
          setError('Too fast. Please wait a moment.');
        } else if (data?.error === 'RESERVED_NAME') {
          setError(`"${CHAT_AUTHOR_NAME}" is reserved for Author.`);
        } else if (data?.error === 'INVALID_NAME') {
          setError('Please enter a name (max 40 chars).');
        } else if (data?.error === 'INVALID_MESSAGE') {
          setError('Please write a message (max 500 chars).');
        } else if (data?.error === 'LINKS_NOT_ALLOWED') {
          setError('Links are not allowed in public chat.');
        } else if (data?.error === 'BLOCKED_CONTENT') {
          setError('Message blocked by moderation.');
        } else {
          setError('Failed to send the message. Try again.');
        }
        return;
      }

      const inserted = data?.message;
      if (inserted && typeof inserted === 'object') {
        setMessages((prev) => [...prev, inserted]);
      } else {
        await fetchMessages();
      }

      setMessage('');
      setReplyTo(null);
    } catch {
      setError('Failed to send the message. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-sans font-semibold text-[var(--home-ink)]">Chat</h1>
          <p className="text-sm text-[var(--home-muted)]">Public room. Be respectful.</p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{isAdmin ? 'Admin' : 'Community'}</p>
      </div>

      <div className="h-[min(78vh,820px)] overflow-hidden rounded-3xl border border-white/10 bg-black/20">
        <ChatPanel
          titleTag="Phion"
          messages={messages}
          loading={loading}
          error={error}
          isAdmin={isAdmin}
          replyTo={replyTo}
          onReplyToChange={setReplyTo}
          name={name}
          onNameChange={setName}
          message={message}
          onMessageChange={setMessage}
          onSend={handleSend}
          sending={sending}
          onTogglePinMessage={handleTogglePin}
          onDeleteMessage={handleDelete}
        />
      </div>
    </div>
  );
}
