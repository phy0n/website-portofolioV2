'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Send, Trash2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

type ChatMessage = {
  id: number;
  createdAt: string;
  name: string;
  message: string;
};

const VISITOR_KEY = 'phion_visitor_id';
const NAME_KEY = 'phion_chat_name';

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

const formatClock = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const normalizeName = (value: string) => value.trim().slice(0, 40);
const normalizeMessage = (value: string) => value.trim().slice(0, 500);

function ChatPanel({
  titleTag,
  messages,
  loading,
  error,
  isAdmin,
  name,
  onNameChange,
  message,
  onMessageChange,
  onSend,
  sending,
  onDeleteMessage,
  onClose,
  showClose,
}: {
  titleTag: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  name: string;
  onNameChange: (next: string) => void;
  message: string;
  onMessageChange: (next: string) => void;
  onSend: () => void;
  sending: boolean;
  onDeleteMessage?: (id: number) => void;
  onClose?: () => void;
  showClose?: boolean;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const canSend = Boolean(name.trim()) && Boolean(message.trim()) && !sending;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[var(--home-accent)]" />
          <p className="text-sm font-semibold text-white">Chat</p>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-white/50">
            {titleTag}
          </span>
        </div>
        {showClose && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/70 transition hover:border-white/20 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4 hide-scrollbar">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-white/50">No messages yet. Be the first.</p>
        ) : (
          messages.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-white/80">{item.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">{formatClock(item.createdAt)}</p>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => onDeleteMessage?.(item.id)}
                      className="rounded-full border border-white/10 bg-black/40 p-1.5 text-white/60 transition hover:border-white/20 hover:text-white"
                      aria-label="Delete message"
                      title="Delete message">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-sm text-white/70 whitespace-pre-wrap break-words">{item.message}</p>
            </div>
          ))
        )}

        {error ? (
          <p className="text-xs text-red-300">
            {error}
          </p>
        ) : null}
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Name</p>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Anon"
              maxLength={40}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Message</p>
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  if (canSend) onSend();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/40">{message.length}/500</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatSidebar() {
  const pathname = usePathname();
  const hideChat = !pathname || pathname.startsWith('/admin');

  const [open, setOpen] = useState(false);
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
    try {
      const stored = window.localStorage.getItem(NAME_KEY);
      if (stored) setName(stored);
    } catch {
      // ignore
    }
  }, [hideChat]);

  useEffect(() => {
    if (hideChat) return;
    try {
      window.localStorage.setItem(NAME_KEY, normalizeName(name));
    } catch {
      // ignore
    }
  }, [name, hideChat]);

  useEffect(() => {
    if (hideChat) return;
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
    <>
      <aside className="fixed right-0 top-0 z-40 hidden h-screen w-80 flex-col border-l border-white/10 bg-black/85 backdrop-blur lg:flex">
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
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white backdrop-blur transition hover:border-white/20"
        aria-label="Open chat"
      >
        <MessageSquare className="h-4 w-4 text-[var(--home-accent)]" />
        Chat
      </button>

      <div className={`lg:hidden fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chat"
          className={`absolute bottom-0 left-0 right-0 h-[min(560px,85vh)] bg-black border-t border-white/10 shadow-2xl transition-transform duration-300 ${
            open ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
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
            onClose={() => setOpen(false)}
            showClose
          />
        </div>
      </div>
    </>
  );
}
