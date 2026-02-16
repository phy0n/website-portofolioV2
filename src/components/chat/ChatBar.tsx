'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChatPanel, type ChatMessage } from './ChatSidebar';
import { getVisitorId } from '@/lib/visitor';

const NAME_KEY = 'phion_chat_name';

const normalizeName = (value: string) => value.trim().slice(0, 40);
const normalizeMessage = (value: string) => value.trim().slice(0, 500);

export default function ChatBar() {
  const pathname = usePathname();
  const hideChat = !pathname || pathname.startsWith('/admin');

  const isDesktop = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(min-width: 1024px)').matches;
  };

  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visitorId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return getVisitorId();
  }, []);

  useEffect(() => {
    if (hideChat) return;
    if (!isDesktop()) return;
    try {
      const stored = window.localStorage.getItem(NAME_KEY);
      if (stored) setName(stored);
    } catch {
      // ignore
    }
  }, [hideChat]);

  useEffect(() => {
    if (hideChat) return;
    if (!isDesktop()) return;
    try {
      window.localStorage.setItem(NAME_KEY, normalizeName(name));
    } catch {
      // ignore
    }
  }, [name, hideChat]);

  useEffect(() => {
    if (hideChat) return;
    if (!isDesktop()) return;
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
  }, [hideChat]);

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
    if (hideChat) return;
    if (!isDesktop()) return;
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
  }, [hideChat]);

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
    } catch {
      setError('Failed to delete the message. Try again.');
    }
  };

  const handleSend = async () => {
    if (sending) return;
    const safeName = normalizeName(name);
    const safeMessage = normalizeMessage(message);
    if (!safeName || !safeMessage) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: safeName, message: safeMessage, visitorId }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: ChatMessage | null;
        error?: string;
      };

      if (!res.ok || !data?.ok) {
        if (res.status === 429) {
          setError('Too fast. Please wait a moment.');
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
    } catch {
      setError('Failed to send the message. Try again.');
    } finally {
      setSending(false);
    }
  };

  if (hideChat) return null;

  return (
    <ChatPanel
      titleTag="Phion"
      messages={messages}
      loading={loading}
      error={error}
      isAdmin={isAdmin}
      name={name}
      onNameChange={setName}
      message={message}
      onMessageChange={setMessage}
      onSend={handleSend}
      sending={sending}
      onDeleteMessage={handleDelete}
    />
  );
}
