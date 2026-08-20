'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatBlogDate } from '@/lib/blog';
import { Users } from 'lucide-react';

export type BlogSidebarItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  image: string | null;
};

const MAX_SLUGS_PER_REQUEST = 80;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const BLOG_IMAGES_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BLOG_IMAGE_BUCKET ?? 'blog-images';

const joinUrl = (base: string, path: string) => {
  const normalizedBase = base.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const resolveImageSrc = (value: string) => {
  const raw = value.trim();
  if (!raw) return null;

  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:')
  ) {
    return raw;
  }

  if (raw.startsWith('/')) {
    if (raw.startsWith('/image/blogImage/')) {
      return raw;
    }
    if (raw.startsWith('/storage/v1/') && SUPABASE_URL) {
      return joinUrl(SUPABASE_URL, raw);
    }
    return raw;
  }

  if (raw.startsWith('storage/v1/') && SUPABASE_URL) {
    return joinUrl(SUPABASE_URL, raw);
  }

  if (raw.startsWith('blogs/') && SUPABASE_URL) {
    return joinUrl(SUPABASE_URL, `/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/${raw}`);
  }

  if (raw.startsWith('image/') || raw.startsWith('images/') || raw.startsWith('assets/')) {
    return `/${raw}`;
  }

  return `/${raw}`;
};

const normalizeSlug = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 140) return null;
  return trimmed;
};

export default function BlogSidebarList({ blogs }: { blogs: BlogSidebarItem[] }) {
  const [uniqueViews, setUniqueViews] = useState<Record<string, number>>({});
  const [brokenImages, setBrokenImages] = useState<Set<string>>(() => new Set());

  const markBroken = (id: string) => {
    setBrokenImages((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const slugs = useMemo(() => {
    const seen = new Set<string>();
    const values: string[] = [];

    blogs.forEach((blog) => {
      const slug = normalizeSlug(String(blog.slug || ''));
      if (!slug || seen.has(slug)) return;
      seen.add(slug);
      values.push(slug);
    });

    return values;
  }, [blogs]);

  useEffect(() => {
    if (slugs.length === 0) return;

    const controller = new AbortController();

    const fetchCounts = async () => {
      const mergedUniques: Record<string, number> = {};

      const chunks: string[][] = [];
      for (let i = 0; i < slugs.length; i += MAX_SLUGS_PER_REQUEST) {
        chunks.push(slugs.slice(i, i + MAX_SLUGS_PER_REQUEST));
      }

      try {
        for (const chunk of chunks) {
          const res = await fetch(`/api/view-count?slugs=${encodeURIComponent(chunk.join(','))}`, {
            cache: 'no-store',
            signal: controller.signal,
          });

          if (!res.ok) continue;
          const data = (await res.json()) as { uniques?: Record<string, number> };
          if (data?.uniques) Object.assign(mergedUniques, data.uniques);
        }

        if (!controller.signal.aborted) {
          setUniqueViews(mergedUniques);
        }
      } catch (err) {
        const e = err as { name?: string };
        if (e?.name === 'AbortError') return;
      }
    };

    void fetchCounts();
    return () => controller.abort();
  }, [slugs]);

  return (
    <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1 hide-scrollbar">
      {blogs.map((blog) => {
        const slug = String(blog.slug || '');
        const normalizedSlug = normalizeSlug(slug) ?? slug;
        const uniqueVisitors = uniqueViews[normalizedSlug] ?? 0;
        const imageSrc = blog.image ? resolveImageSrc(blog.image) : null;
        const showImage = Boolean(imageSrc) && !brokenImages.has(blog.id);

        return (
          <Link
            key={blog.id}
            href={`/blog/${encodeURIComponent(normalizedSlug)}`}
            className="group relative flex items-center gap-5 border-b border-[var(--home-border)] py-4 last:border-0 transition-colors duration-300">
            
            <div className="relative h-16 w-20 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-lg bg-[var(--home-bg)] border border-[var(--home-border)]">
              {showImage && imageSrc ? (
                <img
                  src={imageSrc}
                  alt={blog.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={() => markBroken(blog.id)}/>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold tracking-widest text-[var(--home-muted)]">
                  POST
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 py-1">
              <h4 className="text-sm sm:text-base font-bold text-[var(--home-ink)] group-hover:text-[var(--home-accent)] transition-colors duration-300 line-clamp-2">
                {blog.title}
              </h4>
              <p className="mt-2 flex flex-wrap items-center gap-3 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-[var(--home-muted)]">
                <span>{formatBlogDate(String(blog.date || ''))}</span>
                <span className="flex items-center gap-1.5 text-[var(--home-accent)]">
                  <Users className="h-3 w-3" />
                  {uniqueVisitors.toLocaleString()} views
                </span>
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
