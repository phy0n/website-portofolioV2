'use client';

import BlogSidebarList from '@/app/blog/BlogSidebarList';
import React from 'react';
import { BookOpen } from 'lucide-react';
import { useHomeSidebarData } from './HomeSidebarDataProvider';

export default function LatestPostsCard({ className }: { className?: string }) {
  const { latestBlogs } = useHomeSidebarData();

  return (
    <div className={['rounded-2xl border border-white/10 bg-black/30 p-5', className].filter(Boolean).join(' ')}>
      <div className="js-reveal flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[var(--home-accent)]" />
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Latest Posts</p>
        </div>
        <span className="text-xs tabular-nums text-[var(--home-muted)]">{latestBlogs?.length ?? 0}</span>
      </div>

      {latestBlogs === null ? (
        <div className="js-reveal mt-4 text-sm text-[var(--home-muted)]">Loading...</div>
      ) : latestBlogs.length === 0 ? (
        <div className="js-reveal mt-4 text-sm text-[var(--home-muted)]">No posts yet.</div>
      ) : (
        <BlogSidebarList blogs={latestBlogs} />
      )}
    </div>
  );
}

