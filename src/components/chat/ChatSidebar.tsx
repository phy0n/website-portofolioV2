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
    const isAuthor = role === 'author';
    const stamp = formatStamp(item.createdAt);
    const replyTarget = item.replyToId ? messageById.get(item.replyToId) : null;
    
    const Actions = () => (
      <div className={`flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isAuthor ? 'flex-row-reverse' : 'flex-row'} self-center mb-1 mx-2`}>
        {onReplyToChange ? (
          <button type="button" onClick={() => onReplyToChange(item)} className="rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition" title="Reply">
            <CornerUpLeft className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {isAdmin && onTogglePinMessage ? (
          <button type="button" onClick={() => onTogglePinMessage(item.id, !item.isPinned)} className={`rounded-full p-1.5 transition ${item.isPinned ? 'text-[var(--home-accent)] hover:bg-[var(--home-accent)]/10' : 'text-white/40 hover:bg-white/10 hover:text-white'}`} title={item.isPinned ? 'Unpin' : 'Pin'}>
            <Pin className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {isAdmin ? (
          <button type="button" onClick={() => onDeleteMessage?.(item.id)} className="rounded-full p-1.5 text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    );

    return (
      <div key={item.id} className={`group flex w-full ${isAuthor ? 'justify-end' : 'justify-start'} mb-5`}>
        {isAuthor && <Actions />}
        <div className={`relative flex flex-col max-w-[85%] sm:max-w-[75%] ${isAuthor ? 'items-end' : 'items-start'}`}>
          <div className={`flex items-center gap-2 mb-1.5 px-1 ${isAuthor ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className={`text-[11px] font-bold tracking-wide ${isAuthor ? 'text-[var(--home-accent)]' : 'text-white/80'}`}>
              {item.name}
            </span>
            {isAuthor && <Crown className="h-3 w-3 text-[var(--home-accent)]" />}
            {item.isPinned && <Pin className="h-3 w-3 text-[var(--home-accent)]" />}
            <span className="text-[9px] text-white/30 uppercase tracking-widest">{stamp}</span>
          </div>

          <div className={`relative px-4 py-3 shadow-sm ${
            isAuthor 
              ? 'bg-[var(--home-accent)] text-white rounded-[20px] rounded-tr-[4px] shadow-[0_4px_20px_rgba(var(--home-accent-rgb),0.2)]' 
              : 'bg-[#181820] border border-white/5 text-white/90 rounded-[20px] rounded-tl-[4px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
          }`}>
            {item.replyToId ? (
              <div className={`mb-3 pl-3 border-l-2 ${isAuthor ? 'border-white/40 text-white/90' : 'border-[var(--home-accent)]/50 text-white/70'} text-xs bg-black/10 p-2 rounded-r-lg`}>
                <p className="font-semibold mb-0.5">{replyTarget?.name ?? 'Unknown'}</p>
                <p className="line-clamp-2 opacity-80 leading-relaxed">{replyTarget?.message ?? 'Message not available.'}</p>
              </div>
            ) : null}
            <p className="whitespace-pre-wrap break-words text-[13px] sm:text-sm leading-relaxed">
              {item.message}
            </p>
          </div>
        </div>
        {!isAuthor && <Actions />}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-[#0a0a0f] px-5 py-4 shrink-0">
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

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar bg-[#0f0f15]">
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

      <div className="border-t border-white/5 bg-[#0a0a0f] px-4 py-4 shrink-0">
        {replyTo && onReplyToChange ? (
          <div className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#181820] px-4 py-3">
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={isAdmin ? CHAT_AUTHOR_NAME : 'Name'}
            maxLength={40}
            disabled={isAdmin}
            className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[var(--home-accent)] focus:bg-white/10 transition-colors disabled:cursor-not-allowed disabled:opacity-70 sm:w-44"
          />

          <div className="w-full flex-1">
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Message…"
              maxLength={500}
              rows={1}
              className="w-full resize-none rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[var(--home-accent)] focus:bg-white/10 transition-colors overflow-hidden leading-snug"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (canSend) onSend();
                }
              }}
            />
          </div>

          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--home-accent)] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 shadow-[0_0_15px_rgba(var(--home-accent-rgb),0.3)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-28"
          >
            <Send className="h-4 w-4" />
            {sending ? '...' : 'Send'}
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between text-[10px] text-white/40">
          <p>{message.length}/500</p>
          <p className="hidden sm:block">Enter to send</p>
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
