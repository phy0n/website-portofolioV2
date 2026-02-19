'use client';

import Image from 'next/image';
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

const normalizeSlug = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 140) return null;
  return trimmed;
};

export default function BlogSidebarList({ blogs }: { blogs: BlogSidebarItem[] }) {
  const [uniqueViews, setUniqueViews] = useState<Record<string, number>>({});

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
    <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1 hide-scrollbar">
      {blogs.map((blog) => {
        const slug = String(blog.slug || '');
        const normalizedSlug = normalizeSlug(slug) ?? slug;
        const uniqueVisitors = uniqueViews[normalizedSlug] ?? 0;

        return (
          <Link
            key={blog.id}
            href={`/blog/${encodeURIComponent(normalizedSlug)}`}
            className="block rounded-2xl border border-white/10 bg-black/30 px-4 py-3 hover:border-white/20"
          >
            <div className="flex items-start gap-3">
              <div className="relative mt-0.5 h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[var(--home-soft)]">
                {blog.image ? (
                  <Image src={blog.image} alt={blog.title} fill sizes="48px" className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white/40">
                    BLOG
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/80 line-clamp-2">{blog.title}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/40">
                  <span>{formatBlogDate(String(blog.date || ''))}</span>
                  <span aria-hidden className="text-white/25">
                    •
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{uniqueVisitors.toLocaleString()}</span>
                  </span>
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
