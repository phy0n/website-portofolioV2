'use client';

import BlogSidebarList from '@/app/blog/BlogSidebarList';
import React from 'react';
import { BookOpen } from 'lucide-react';
import { useHomeSidebarData } from './HomeSidebarDataProvider';

export default function LatestPostsCard({ className }: { className?: string }) {
  const { latestBlogs } = useHomeSidebarData();

  return (
    <section className={className}>
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-[var(--accent)]" />
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--muted)]">Latest Posts</p>
      </div>

      {latestBlogs === null ? (
        <div className="mt-3 text-sm text-[var(--muted)]">Loading...</div>
      ) : latestBlogs.length === 0 ? (
        <div className="mt-3 text-sm text-[var(--muted)]">No posts yet.</div>
      ) : (
        <div className="mt-3">
          <BlogSidebarList blogs={latestBlogs} />
        </div>
      )}
    </section>
  );
}

