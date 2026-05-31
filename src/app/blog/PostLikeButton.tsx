'use client';

import { Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getVisitorId } from '@/lib/visitor';

const LIKED_POSTS_KEY = 'phion_post_likes';

const readLikedPosts = () => {
  try {
    const raw = window.localStorage.getItem(LIKED_POSTS_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(parsed.map((value) => String(value)));
  } catch {
    return new Set<string>();
  }
};

const writeLikedPosts = (liked: Set<string>) => {
  try {
    window.localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(Array.from(liked)));
  } catch {
    // ignore
  }
};

export default function PostLikeButton({ postId }: { postId: string }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const visitorId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return getVisitorId();
  }, []);

  useEffect(() => {
    setLiked(readLikedPosts().has(postId));
  }, [postId]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCounts = async () => {
      try {
        const res = await fetch(`/api/post-likes?ids=${encodeURIComponent(postId)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { counts?: Record<string, number> };
        const next = data?.counts?.[postId];
        if (controller.signal.aborted) return;
        if (typeof next === 'number' && Number.isFinite(next)) {
          setLikes(next);
        }
      } catch (err) {
        const e = err as { name?: string };
        if (e?.name === 'AbortError') return;
      }
    };

    void loadCounts();
    return () => controller.abort();
  }, [postId]);

  const handleLike = async () => {
    if (liked || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/post-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, visitorId }),
        keepalive: true,
      });

      const data = (await res.json()) as { ok?: boolean; likes?: number };
      if (!res.ok || !data?.ok) return;

      setLiked(true);
      if (typeof data.likes === 'number' && Number.isFinite(data.likes)) {
        setLikes(data.likes);
      } else {
        setLikes((prev) => prev);
      }

      const likedPosts = readLikedPosts();
      likedPosts.add(postId);
      writeLikedPosts(likedPosts);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const buttonClassName = [
    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition',
    liked
      ? 'border-[var(--home-accent)]/30 bg-[var(--home-accent)]/10 text-[var(--home-accent)]'
      : 'border-[var(--home-border)] bg-[var(--home-soft)] text-[var(--home-ink)] opacity-70 hover:border-[var(--home-border)] hover:text-[var(--home-ink)]',
    loading ? 'opacity-60' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={liked || loading}
      aria-pressed={liked}
      className={buttonClassName}>
      <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
      <span className="tabular-nums">{likes.toLocaleString()}</span>
      <span className="sr-only">{liked ? 'Liked' : 'Like'}</span>
    </button>
  );
}

