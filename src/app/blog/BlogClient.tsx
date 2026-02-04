'use client';

import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  Eye,
  Quote,
  Tags,
  X,
} from 'lucide-react';
import { formatBlogDate, readingTimeMinutes } from '@/lib/blog';
import { readReadingList, toggleReadingListSlug } from '@/components/blog/readingList';

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[] | null;
  image: string | null;
  featured: boolean;
  is_published?: boolean | null;
}

interface DailyQuote {
  id: string;
  date: string;
  text: string;
  author?: string | null;
}

type SortMode = 'newest' | 'oldest' | 'featured';

const formatQuoteDate = (dateKey: string) => {
  const [yyyy, mm, dd] = dateKey.split('-').map(Number);
  if (!yyyy || !mm || !dd) return dateKey;
  return new Date(Date.UTC(yyyy, mm - 1, dd)).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

export default function BlogClient({
  blogs,
  quotes,
  viewCounts,
}: {
  blogs: Blog[];
  quotes: DailyQuote[];
  viewCounts?: Record<string, number>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [savedOnly, setSavedOnly] = useState(false);
  const [isQuotesOpen, setIsQuotesOpen] = useState(false);
  const [readingList, setReadingList] = useState<Set<string>>(() => readReadingList());
  const [fetchedViewCounts, setFetchedViewCounts] = useState<Record<string, number> | null>(null);
  const deferredQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const visibleBlogs = useMemo(() => {
    return blogs.filter((blog) => blog.is_published !== false);
  }, [blogs]);

  const resolvedViewCounts = useMemo(() => {
    return { ...(viewCounts ?? {}), ...(fetchedViewCounts ?? {}) };
  }, [fetchedViewCounts, viewCounts]);

  const viewCountSlugs = useMemo(() => {
    const slugs = visibleBlogs
      .map((blog) => String(blog.slug || '').trim())
      .filter(Boolean);

    return Array.from(new Set(slugs));
  }, [visibleBlogs]);

  useEffect(() => {
    if (viewCountSlugs.length === 0) return;
    const controller = new AbortController();

    const fetchViewCounts = async () => {
      try {
        const mergedCounts: Record<string, number> = {};
        const chunkSize = 80;

        for (let index = 0; index < viewCountSlugs.length; index += chunkSize) {
          const chunk = viewCountSlugs.slice(index, index + chunkSize);
          if (chunk.length === 0) continue;

          const res = await fetch(`/api/view-count?slugs=${encodeURIComponent(chunk.join(','))}`, {
            cache: 'force-cache',
            signal: controller.signal,
          });
          if (!res.ok) continue;
          const data = (await res.json()) as { counts?: Record<string, number> };
          if (!data?.counts) continue;
          Object.assign(mergedCounts, data.counts);
        }

        setFetchedViewCounts(mergedCounts);
      } catch (err) {
        const error = err as { name?: string };
        if (error?.name === 'AbortError') return;
      }
    };

    void fetchViewCounts();
    return () => controller.abort();
  }, [viewCountSlugs]);

  const tags = useMemo(() => {
    const uniqueTags = new Set<string>();
    visibleBlogs.forEach((blog) => {
      (blog.tags ?? []).forEach((tag) => {
        const normalized = String(tag || '').trim();
        if (normalized) uniqueTags.add(normalized);
      });
    });
    return Array.from(uniqueTags);
  }, [visibleBlogs]);

  const readingTimeById = useMemo(() => {
    const map = new Map<string, number>();
    visibleBlogs.forEach((blog) => {
      map.set(blog.id, readingTimeMinutes(blog.content || ''));
    });
    return map;
  }, [visibleBlogs]);

  const savedBlogs = useMemo(() => {
    if (readingList.size === 0) return [];
    return [...visibleBlogs]
      .filter((blog) => readingList.has(blog.slug))
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .slice(0, 4);
  }, [readingList, visibleBlogs]);

  const featuredBlogs = useMemo(() => {
    return [...visibleBlogs]
      .filter((blog) => blog.featured)
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .slice(0, 3);
  }, [visibleBlogs]);

  const sortedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id.localeCompare(a.id);
    });
  }, [quotes]);

  useEffect(() => {
    if (!isQuotesOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsQuotesOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isQuotesOpen]);

  const filteredBlogs = useMemo(() => {
    let result = visibleBlogs;

    if (normalizedQuery) {
      result = result.filter((blog) => {
        const haystack = [
          blog.title,
          blog.excerpt,
          blog.author,
          blog.category,
          ...(blog.tags ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }

    if (selectedTag) {
      result = result.filter((blog) => (blog.tags ?? []).includes(selectedTag));
    }

    if (savedOnly) {
      result = result.filter((blog) => readingList.has(blog.slug));
    }

    const sorted = [...result];
    if (sortMode === 'oldest') {
      sorted.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    } else if (sortMode === 'featured') {
      sorted.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return String(b.date || '').localeCompare(String(a.date || ''));
      });
    } else {
      sorted.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    }

    return sorted;
  }, [
    visibleBlogs,
    normalizedQuery,
    selectedTag,
    savedOnly,
    readingList,
    sortMode,
  ]);

  const totalWords = useMemo(() => {
    return visibleBlogs.reduce((sum, blog) => {
      return sum + blog.content.split(/\s+/).length;
    }, 0);
  }, [visibleBlogs]);
  const totalStories = visibleBlogs.length;
  const showFeaturedSection =
    featuredBlogs.length > 0 &&
    !normalizedQuery &&
    !selectedTag &&
    !savedOnly;

  return (
    <div className="relative">
      <section className="relative border-b border-white/10" data-gsap="reveal">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-12 md:py-16">
          <div className="grid lg:grid-cols-4 gap-6 xs:gap-8">
            <div className="lg:col-span-3 space-y-3 xs:space-y-4">
              <div className="flex items-center gap-2 xs:gap-3">
                <div className="h-px w-8 xs:w-10 sm:w-12 bg-[var(--home-accent)]"></div>
                <span className="text-[10px] xs:text-xs text-[var(--home-muted)] uppercase tracking-widest">Life Pages</span>
              </div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Phion story
              </h1>

              <p className="text-sm xs:text-base sm:text-lg text-[var(--home-muted)] max-w-2xl leading-relaxed">
                AboutYou and the blue sky.
              </p>
            </div>
            <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3 xs:gap-4">
              <div className="group relative bg-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-[var(--home-accent)] p-4 xs:p-5 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="text-2xl xs:text-3xl font-bold text-white mb-1">{totalStories}</div>
                  <div className="text-[10px] xs:text-xs text-[var(--home-muted)] uppercase tracking-wider">Total Stories</div>
                </div>
              </div>
              <div className="group relative bg-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-[var(--home-accent)] p-4 xs:p-5 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="text-2xl xs:text-3xl font-bold text-white mb-1">{totalWords.toLocaleString()}</div>
                  <div className="text-[10px] xs:text-xs text-[var(--home-muted)] uppercase tracking-wider">Total Words</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 xs:mt-10 space-y-4 xs:space-y-6">
            <div className="grid gap-3 md:grid-cols-12">
              <div className="relative md:col-span-6">
                <input
                  type="text"
                  placeholder="Search stories, author, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 focus:border-[var(--home-accent)] px-4 xs:px-5 py-3 xs:py-3.5 text-xs xs:text-sm text-white placeholder-[var(--home-muted)] focus:outline-none transition-colors"
                />
                <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--home-muted)]" />
              </div>
              <div className="md:col-span-3">
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  className="w-full bg-white/[0.02] border border-white/10 focus:border-[var(--home-accent)] px-4 xs:px-5 py-3 xs:py-3.5 text-[10px] xs:text-xs text-white/80 focus:outline-none transition-colors admin-select"
                  aria-label="Sort stories"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="featured">Featured</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={() => setSavedOnly((prev) => !prev)}
                  className={`w-full px-4 xs:px-5 py-3 xs:py-3.5 text-[10px] xs:text-xs border transition-all flex items-center justify-between ${
                    savedOnly
                      ? 'border-[var(--home-accent)] bg-[var(--home-accent)]/10 text-[var(--home-accent)]'
                      : 'border-white/10 bg-white/[0.02] text-[var(--home-muted)] hover:border-white/20 hover:text-white'
                  }`}
                  aria-pressed={savedOnly}
                >
                  <span className="inline-flex items-center gap-2">
                    {savedOnly ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                    Saved only
                  </span>
                  <span className="text-white/40">{readingList.size}</span>
                </button>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 xs:gap-3">
                <span className="inline-flex items-center gap-2 px-3 xs:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs border border-white/10 text-[var(--home-muted)]">
                  <Tags className="h-4 w-4" />
                  Tags
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 xs:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs border transition-all ${
                    !selectedTag
                      ? 'border-[var(--home-accent)] bg-[var(--home-accent)]/10 text-[var(--home-accent)]'
                      : 'border-white/10 text-[var(--home-muted)] hover:border-white/10 hover:text-[var(--home-muted)]'
                  }`}
                >
                  All
                </button>
                {tags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 xs:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs border transition-all ${
                      selectedTag === tag
                        ? 'border-[var(--home-accent)] bg-[var(--home-accent)]/10 text-[var(--home-accent)]'
                        : 'border-white/10 text-[var(--home-muted)] hover:border-white/10 hover:text-[var(--home-muted)]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 xs:pt-10 sm:pt-12" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <p className="text-xs xs:text-sm text-[var(--home-muted)]">
            {filteredBlogs.length === totalStories
              ? `Showing all ${totalStories} stories`
              : `Found ${filteredBlogs.length} of ${totalStories} stories`}
          </p>
          {(searchQuery || selectedTag || savedOnly || sortMode !== 'newest') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
                setSavedOnly(false);
                setSortMode('newest');
              }}
              className="text-xs xs:text-sm text-[var(--home-accent)] hover:text-[var(--home-accent)] transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 xs:py-8 pb-16 xs:pb-20 sm:pb-24" data-gsap="reveal">
          <div className="grid lg:grid-cols-12 gap-6 xs:gap-8 items-start">
          <div className="lg:col-span-8 space-y-10">
            {showFeaturedSection && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Featured</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Top picks</h2>
                  </div>
                  <span className="text-xs text-white/40">{featuredBlogs.length} stories</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {featuredBlogs.map((featured, featuredIndex) => (
                    <Link
                      key={featured.id}
                      href={`/blog/${encodeURIComponent(featured.slug)}`}
                      className={`group block ${featuredIndex === 0 ? 'sm:col-span-2' : ''}`}
                    >
                      <article className="overflow-hidden border border-white/10 bg-white/[0.02] hover:border-white/25 transition-all duration-300">
                        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-white/5 via-black/30 to-black">
                          {featured.image ? (
                            <Image
                              src={featured.image}
                              alt={featured.title}
                              fill
                              sizes="(min-width: 640px) 50vw, 100vw"
                              quality={80}
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute left-4 top-4 bg-black/80 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/70">
                            Featured
                          </div>
                        </div>
                        <div className="p-5">
                            <p className="text-xs text-white/50">
                            {formatBlogDate(featured.date)} • {readingTimeById.get(featured.id) ?? 1} min read • {(resolvedViewCounts?.[featured.slug] ?? 0).toLocaleString()} views
                            </p>
                          <h3 className="mt-3 text-lg sm:text-xl font-semibold text-white line-clamp-2">
                            {featured.title}
                          </h3>
                          <p className="mt-3 text-sm text-white/60 line-clamp-2">{featured.excerpt}</p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className={showFeaturedSection ? 'pt-10 border-t border-white/10' : ''}>
              {filteredBlogs.length === 0 ? (
                <div className="text-center py-16 xs:py-20">
                  <BookOpen className="w-12 h-12 xs:w-16 xs:h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg xs:text-xl text-[var(--home-muted)] mb-2">No stories found</h3>
                  <p className="text-xs xs:text-sm text-[var(--home-muted)]">Try changing the filter or search keywords</p>
                </div>
              ) : (
                <div className="space-y-6 xs:space-y-8">
                  {filteredBlogs.map((blog, index) => {
                    const views = resolvedViewCounts?.[blog.slug] ?? 0;
                    return (
                      <Link
                        key={blog.id}
                        href={`/blog/${encodeURIComponent(blog.slug)}`}
                        className="group block"
                      >
                        <article className="relative bg-white/[0.02] border border-white/10 hover:border-white/25 transition-all duration-300 overflow-hidden rounded-2xl">
                          <div className="grid md:grid-cols-5 gap-0">
                            <div className="md:col-span-2 relative h-48 xs:h-56 sm:h-64 md:h-auto overflow-hidden bg-gradient-to-br from-white/5 via-black/30 to-black">
                              {blog.image ? (
                                <Image
                                  src={blog.image}
                                  alt={blog.title}
                                  fill
                                  sizes="(min-width: 1024px) 40vw, 100vw"
                                  quality={75}
                                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              ) : null}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/60 md:to-black"></div>
                              <div className="absolute top-3 xs:top-4 left-3 xs:left-4 flex flex-wrap items-center gap-2">
                                <span className="bg-black/80 backdrop-blur-sm border border-white/10 px-2 xs:px-3 py-1 xs:py-1.5 text-[10px] xs:text-xs text-white/80">
                                  {blog.category || 'Story'}
                              </span>
                              {blog.featured && (
                                <span className="bg-[var(--home-accent)]/15 backdrop-blur-sm border border-[var(--home-accent)]/30 px-2 xs:px-3 py-1 xs:py-1.5 text-[10px] xs:text-xs text-[var(--home-accent)]">
                                  Featured
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                const result = toggleReadingListSlug(blog.slug);
                                setReadingList(new Set(result.list));
                              }}
                              className="absolute top-3 xs:top-4 right-3 xs:right-4 bg-black/80 backdrop-blur-sm border border-white/10 p-2 text-white/70 hover:text-white hover:border-white/20 transition-colors"
                              aria-label={
                                readingList.has(blog.slug)
                                  ? 'Remove from reading list'
                                  : 'Save to reading list'
                              }
                              aria-pressed={readingList.has(blog.slug)}
                            >
                              {readingList.has(blog.slug) ? (
                                <BookmarkCheck className="w-4 h-4 text-[var(--home-accent)]" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <div className="md:col-span-3 p-5 xs:p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] xs:text-xs text-[var(--home-muted)] mb-3">
                              <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.02] px-2.5 py-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatBlogDate(blog.date)}
                              </span>
                              <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.02] px-2.5 py-1">
                                <Clock className="w-3.5 h-3.5" />
                                {readingTimeById.get(blog.id) ?? 1} min read
                              </span>
                              <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.02] px-2.5 py-1">
                                <Eye className="w-3.5 h-3.5" />
                                {views.toLocaleString()}
                              </span>
                            </div>
                            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 xs:mb-4 group-hover:text-gray-300 transition-colors leading-tight">
                              {blog.title}
                            </h2>
                            <p className="text-xs xs:text-sm sm:text-base text-[var(--home-muted)] leading-relaxed mb-4 xs:mb-5 sm:mb-6 line-clamp-2 xs:line-clamp-3">
                              {blog.excerpt}
                            </p>
                            {blog.tags && blog.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 mb-5 xs:mb-6">
                                {blog.tags.slice(0, 4).map((tag) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      setSelectedTag(tag);
                                    }}
                                    className="text-[10px] xs:text-xs border border-white/10 bg-white/[0.02] px-2.5 py-1 text-white/60 hover:text-white hover:border-white/20 transition-colors"
                                  >
                                    #{tag}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs xs:text-sm text-[var(--home-accent)] group-hover:gap-3 transition-all">
                              <span className="font-medium">Read the Story</span>
                              <svg
                                className="w-3 h-3 xs:w-4 xs:h-4 transform group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--home-accent)]/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="hidden lg:block lg:col-span-4" data-gsap="reveal">
            <div className="sticky top-6 space-y-4">
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 p-4 xs:p-5 overflow-hidden">
                <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-[var(--home-accent)]" />
                      <h2 className="text-sm font-semibold text-white">Reading list</h2>
                    </div>
                    <span className="text-[10px] text-[var(--home-muted)] whitespace-nowrap">
                      {readingList.size} saved
                    </span>
                  </div>

                  {savedBlogs.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {savedBlogs.map((savedBlog) => (
                        <Link
                          key={savedBlog.id}
                          href={`/blog/${encodeURIComponent(savedBlog.slug)}`}
                          className="block rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:border-white/25 hover:bg-white/[0.04]"
                        >
                          <p className="text-[10px] text-[var(--home-muted)]">
                            {formatBlogDate(savedBlog.date)}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-white line-clamp-2">
                            {savedBlog.title}
                          </p>
                        </Link>
                      ))}
                      {!savedOnly && (
                        <button
                          type="button"
                          onClick={() => setSavedOnly(true)}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
                        >
                          Show saved only
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[var(--home-muted)]">
                      Save stories to build your reading list.
                    </p>
                  )}
                </div>
              </div>

              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 p-4 xs:p-5 overflow-hidden">
                <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Quote className="w-4 h-4 text-[var(--home-accent)]" />
                      <h2 className="text-sm font-semibold text-white">Daily Quotes</h2>
                    </div>
                    <span className="text-[10px] text-[var(--home-muted)] whitespace-nowrap">
                      {sortedQuotes.length} quotes
                    </span>
                  </div>

                  {sortedQuotes.length > 0 ? (
                    <div className="mt-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto hide-scrollbar pr-1">
                      {sortedQuotes.map((quote, index) => (
                        <div key={`${quote.id}-${quote.date}-${index}`} className="border-l border-white/10 pl-3">
                          <p className="text-[10px] text-[var(--home-muted)] mb-1">{formatQuoteDate(quote.date)}</p>
                          <p className="text-sm text-gray-300 leading-relaxed italic">“{quote.text}”</p>
                          {quote.author && <p className="mt-2 text-xs text-[var(--home-muted)]">— {quote.author}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[var(--home-muted)]">No quotes yet.</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setIsQuotesOpen(true)}
        className="lg:hidden fixed top-20 right-4 z-40 bg-black/80 backdrop-blur-sm border border-white/10 rounded-full px-3 py-3 flex items-center gap-2 text-[var(--home-muted)] hover:text-white hover:border-white/20 transition-colors"
        aria-label="Open daily quotes"
      >
        <Quote className="w-4 h-4 text-[var(--home-accent)]" />
        <span className="text-xs font-medium">Quotes</span>
      </button>

      <div className={`lg:hidden fixed inset-0 z-50 ${isQuotesOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
            isQuotesOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsQuotesOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Daily quotes"
          className={`absolute top-0 right-0 h-full w-[min(360px,100vw)] bg-black border-l border-white/10 shadow-2xl transition-transform duration-300 ${
            isQuotesOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-[var(--home-accent)]" />
                <span className="text-sm font-semibold text-white">Daily Quotes</span>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotesOpen(false)}
                className="p-2 text-[var(--home-muted)] hover:text-white transition-colors"
                aria-label="Close daily quotes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-5">
              {sortedQuotes.length > 0 ? (
                <div className="space-y-4">
                  {sortedQuotes.map((quote, index) => (
                    <div
                      key={`${quote.id}-${quote.date}-${index}`}
                      className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 p-4 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm"></div>
                      <div className="relative z-10">
                        <p className="text-xs text-[var(--home-muted)] mb-3">{formatQuoteDate(quote.date)}</p>
                        <p className="text-base text-gray-200 leading-relaxed italic">“{quote.text}”</p>
                        {quote.author && <p className="mt-3 text-sm text-[var(--home-muted)]">— {quote.author}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--home-muted)]">No quotes yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


