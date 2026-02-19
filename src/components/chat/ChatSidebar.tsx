'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CornerUpLeft, Crown, MessageSquare, Pin, Send, Trash2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { CHAT_AUTHOR_NAME, getChatRoleForName, normalizeChatMessage, normalizeChatName } from '@/lib/chat';
import { getVisitorId } from '@/lib/visitor';

export type ChatMessage = {
  id: number;
  createdAt: string;
  name: string;
  message: string;
  replyToId: number | null;
  isPinned: boolean;
  pinnedAt: string | null;
};

const NAME_KEY = 'phion_chat_name';

const formatStamp = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} • ${timePart}`;
};

export function ChatPanel({
  titleTag,
  messages,
  loading,
  error,
  isAdmin,
  replyTo,
  onReplyToChange,
  name,
  onNameChange,
  message,
  onMessageChange,
  onSend,
  sending,
  onTogglePinMessage,
  onDeleteMessage,
  onClose,
  showClose,
}: {
  titleTag: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  replyTo?: ChatMessage | null;
  onReplyToChange?: (next: ChatMessage | null) => void;
  name: string;
  onNameChange: (next: string) => void;
  message: string;
  onMessageChange: (next: string) => void;
  onSend: () => void;
  sending: boolean;
  onTogglePinMessage?: (id: number, pinned: boolean) => void;
  onDeleteMessage?: (id: number) => void;
  onClose?: () => void;
  showClose?: boolean;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const messageById = useMemo(() => {
    const map = new Map<number, ChatMessage>();
    for (const item of messages) {
      map.set(item.id, item);
    }
    return map;
  }, [messages]);

  const pinnedMessages = useMemo(() => messages.filter((item) => Boolean(item.isPinned)), [messages]);
  const regularMessages = useMemo(() => messages.filter((item) => !item.isPinned), [messages]);

  const canSend = Boolean(name.trim()) && Boolean(message.trim()) && !sending;

  const renderMessageCard = (item: ChatMessage) => {
    const role = getChatRoleForName(item.name);
    const roleLabel = role === 'author' ? 'Author' : 'Viewers';
    const stamp = formatStamp(item.createdAt);
    const replyTarget = item.replyToId ? messageById.get(item.replyToId) : null;
    const messageClassName = [
      role === 'author' ? 'border-yellow-400/15 bg-yellow-500/[0.04]' : 'border-white/10 bg-black/20',
      item.isPinned ? 'ring-1 ring-[var(--home-accent)]/25' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div key={item.id} className={['rounded-2xl border px-4 py-3', messageClassName].join(' ')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <p
                className={[
                  'truncate text-sm font-semibold',
                  role === 'author' ? 'text-yellow-100' : 'text-white/90',
                ].join(' ')}
              >
                {item.name}
              </p>
              <span
                className={[
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em]',
                  role === 'author'
                    ? 'border-yellow-400/20 bg-yellow-500/[0.08] text-yellow-100'
                    : 'border-white/10 bg-white/[0.04] text-white/50',
                ].join(' ')}
              >
                {roleLabel}
              </span>
              {role === 'author' ? <Crown className="h-3.5 w-3.5 text-yellow-200/80" /> : null}
              {item.isPinned ? <Pin className="h-3.5 w-3.5 text-[var(--home-accent)]" /> : null}
              {stamp ? <span className="whitespace-nowrap text-[11px] text-white/40">{stamp}</span> : null}
            </div>

            {item.replyToId ? (
              <div className="mt-2 border-l border-white/10 pl-3">
                <p className="text-xs font-semibold text-white/60">{replyTarget?.name ?? 'Unknown'}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/50 line-clamp-2">
                  {replyTarget?.message ?? 'Message not available.'}
                </p>
              </div>
            ) : null}

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/70">{item.message}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {onReplyToChange ? (
              <button
                type="button"
                onClick={() => onReplyToChange(item)}
                className="rounded-full p-2 text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Reply"
                title="Reply"
              >
                <CornerUpLeft className="h-4 w-4" />
              </button>
            ) : null}

            {isAdmin && onTogglePinMessage ? (
              <button
                type="button"
                onClick={() => onTogglePinMessage(item.id, !item.isPinned)}
                className="rounded-full p-2 text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                aria-label={item.isPinned ? 'Unpin message' : 'Pin message'}
                title={item.isPinned ? 'Unpin message' : 'Pin message'}
              >
                <Pin className={['h-4 w-4', item.isPinned ? 'text-[var(--home-accent)]' : ''].join(' ')} />
              </button>
            ) : null}

            {isAdmin ? (
              <button
                type="button"
                onClick={() => onDeleteMessage?.(item.id)}
                className="rounded-full p-2 text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Delete message"
                title="Delete message"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
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

      {pinnedMessages.length > 0 && !loading ? (
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/50">
            <Pin className="h-4 w-4 text-[var(--home-accent)]" />
            Pinned
          </div>
          <div className="mt-3 space-y-3">{pinnedMessages.map(renderMessageCard)}</div>
        </div>
      ) : null}

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 hide-scrollbar">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : pinnedMessages.length === 0 && regularMessages.length === 0 ? (
          <p className="text-sm text-white/50">No messages yet. Be the first.</p>
        ) : (
          regularMessages.map(renderMessageCard)
        )}

        {error ? (
          <p className="text-xs text-red-300">
            {error}
          </p>
        ) : null}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        {replyTo && onReplyToChange ? (
          <div className="mb-3 flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Reply</p>
              <p className="mt-1 truncate text-xs text-white/70">
                {replyTo.name}: {replyTo.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onReplyToChange(null)}
              className="rounded-full p-2 text-white/50 transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Cancel reply"
              title="Cancel reply"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={isAdmin ? CHAT_AUTHOR_NAME : 'Name'}
            maxLength={40}
            disabled={isAdmin}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-70 sm:w-44"
          />

          <div className="w-full flex-1">
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Message…"
              maxLength={500}
              rows={2}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (canSend) onSend();
                }
              }}
            />
            <div className="mt-1 flex items-center justify-between text-[10px] text-white/40">
              <p>{message.length}/500</p>
              <p className="hidden sm:block">Enter to send</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50 sm:w-28"
          >
            <Send className="h-4 w-4" />
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatSidebar() {
  const pathname = usePathname();
  const hideChat = !pathname || pathname.startsWith('/admin');

  const isDesktop = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(min-width: 1024px)').matches;
  };

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
    if (isDesktop()) return;
    try {
      const stored = window.localStorage.getItem(NAME_KEY);
      if (stored) setName(stored);
    } catch {
      // ignore
    }
  }, [hideChat]);

  useEffect(() => {
    if (hideChat) return;
    if (isDesktop()) return;
    try {
      if (isAdmin) return;
      window.localStorage.setItem(NAME_KEY, normalizeChatName(name));
    } catch {
      // ignore
    }
  }, [name, hideChat, isAdmin]);

  useEffect(() => {
    if (hideChat) return;
    if (isDesktop()) return;
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

  useEffect(() => {
    if (!isAdmin) return;
    if (hideChat) return;
    if (isDesktop()) return;
    setName(CHAT_AUTHOR_NAME);
  }, [isAdmin, hideChat]);

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
    if (isDesktop()) return;
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
    const safeName = normalizeChatName(name);
    const safeMessage = normalizeChatMessage(message);
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
        } else if (data?.error === 'RESERVED_NAME') {
          setError(`"${CHAT_AUTHOR_NAME}" is reserved for Author.`);
        } else if (data?.error === 'INVALID_NAME') {
          setError('Please enter a name (max 40 chars).');
        } else if (data?.error === 'INVALID_MESSAGE') {
          setError('Please write a message (max 500 chars).');
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
