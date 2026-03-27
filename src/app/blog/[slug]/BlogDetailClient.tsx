'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  ArrowLeft,
  ArrowUp,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Link2,
  Share2,
  Tags,
  User,
  Users,
} from 'lucide-react';
import gsap from 'gsap';
import BlogMarkdown from '@/components/blog/BlogMarkdown';
import { extractTocFromContent, formatBlogDate } from '@/lib/blog';
import { readReadingList, toggleReadingListSlug } from '@/components/blog/readingList';

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  chapters?: string[] | null;
  author: string;
  date: string;
  category: string;
  tags: string[] | null;
  image: string | null;
  featured: boolean;
  is_published?: boolean | null;
}

type RelatedBlog = Pick<
  Blog,
  'id' | 'slug' | 'title' | 'excerpt' | 'author' | 'date' | 'category' | 'tags' | 'image'
>;

const REVEAL_SELECTOR = [
  '[data-gsap="reveal"]',
  '.js-reveal',
  'section',
  'article',
  'aside',
  'form',
  'figure',
  'footer',
  'div',
  'img',
  '[class~="border"]',
  '.rounded-3xl',
  '.rounded-2xl',
  '.rounded-xl',
  '.rounded-lg',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'p',
  'li',
  'blockquote',
].join(', ');
const REVEAL_ANIMATION_CLASS = 'animate-slide-up';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const BLOG_IMAGES_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BLOG_IMAGE_BUCKET ?? 'blog-images';

const joinUrl = (base: string, path: string) => {
  const normalizedBase = base.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const resolveBlogImageSrc = (value?: string | null) => {
  const raw = typeof value === 'string' ? value.trim() : '';
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

export default function BlogDetailClient({
  blog,
  relatedBlogs = [],
  uniqueCount,
}: {
  blog: Blog | null;
  relatedBlogs?: RelatedBlog[];
  uniqueCount?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(() => (blog?.slug ? readReadingList().has(blog.slug) : false));
  const [fetchedCounts, setFetchedCounts] = useState<{
    source: 'counters' | 'events';
    unique: number;
  } | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const chapterContentRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const chapters = useMemo(() => {
    const raw = (blog as any)?.chapters;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((value) => (typeof value === 'string' ? value : '')).filter((value) => value.trim().length > 0);
    }
    const fallback = String(blog?.content ?? '').trim();
    return fallback ? [fallback] : [''];
  }, [blog]);

  const chapterCount = chapters.length;
  const chapterParam = (searchParams?.get('chapter') ?? '').trim();
  const activeChapterIndex = useMemo(() => {
    const parsed = Number.parseInt(chapterParam, 10);
    const oneBased = Number.isFinite(parsed) ? parsed : 1;
    const idx = Math.max(0, Math.min(chapterCount - 1, oneBased - 1));
    return idx;
  }, [chapterCount, chapterParam]);

  const content = chapters[activeChapterIndex] ?? '';
  const toc = useMemo(() => (content ? extractTocFromContent(content) : []), [content]);
  const resolvedUniqueVisitors = Math.max(uniqueCount ?? 0, fetchedCounts?.unique ?? 0);
  const showUniqueCounts = uniqueCount !== undefined || fetchedCounts?.source === 'counters';
  const coverImageSrc = resolveBlogImageSrc(blog?.image);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const slug = String(blog?.slug || '').trim();
    if (!slug) return;

    const controller = new AbortController();

    const fetchViewCount = async () => {
      try {
        const res = await fetch(`/api/view-count?slugs=${encodeURIComponent(slug)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          source?: 'counters' | 'events';
          counts?: Record<string, number>;
          totals?: Record<string, number>;
          uniques?: Record<string, number>;
        };

        const toCount = (value: unknown) => {
          if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
          if (typeof value === 'string') {
            const parsed = Number.parseInt(value, 10);
            return Number.isFinite(parsed) ? parsed : 0;
          }
          return 0;
        };

        const nextUnique = data?.uniques?.[slug];

        setFetchedCounts({
          source: data?.source === 'counters' ? 'counters' : 'events',
          unique: toCount(nextUnique),
        });
      } catch (err) {
        const error = err as { name?: string };
        if (error?.name === 'AbortError') return;
      }
    };

    void fetchViewCount();
    const refreshTimer = window.setTimeout(() => {
      void fetchViewCount();
    }, 1500);
    return () => {
      window.clearTimeout(refreshTimer);
      controller.abort();
    };
  }, [blog?.slug]);

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const animatedNodes: HTMLElement[] = [];
    const isTransformed = (node: HTMLElement) => window.getComputedStyle(node).transform !== 'none';

    const reveal = (node: HTMLElement) => {
      if (node.classList.contains(REVEAL_ANIMATION_CLASS)) return;
      animatedNodes.push(node);

      const tag = node.tagName.toLowerCase();
      const distance = prefersReducedMotion ? 12 : 22;
      const duration = prefersReducedMotion ? 0.55 : 0.85;
      const eased = prefersReducedMotion ? 'power2.out' : 'power3.out';

      const fromVars: gsap.TweenVars = { autoAlpha: 0 };
      const allowTransform = !isTransformed(node);
      if (allowTransform) {
        fromVars.y = distance;
        if (tag === 'div' || tag === 'section' || tag === 'article' || tag === 'aside') {
          fromVars.scale = prefersReducedMotion ? 1 : 0.985;
          fromVars.filter = prefersReducedMotion ? 'none' : 'blur(10px)';
        } else if (tag.startsWith('h')) {
          fromVars.filter = prefersReducedMotion ? 'none' : 'blur(8px)';
        } else if (tag === 'img' || tag === 'figure') {
          fromVars.scale = prefersReducedMotion ? 1 : 1.02;
          fromVars.filter = prefersReducedMotion ? 'none' : 'blur(8px)';
        }
      }

      const toVars: gsap.TweenVars = {
        autoAlpha: 1,
        duration,
        ease: eased,
        onComplete: () => {
          node.classList.add(REVEAL_ANIMATION_CLASS);
          gsap.set(node, { clearProps: 'opacity,transform,visibility,filter' });
        },
      };

      if (allowTransform) {
        toVars.y = 0;
      }
      if (allowTransform && typeof fromVars.scale === 'number') {
        toVars.scale = 1;
      }
      if (allowTransform && typeof fromVars.filter === 'string') {
        toVars.filter = 'blur(0px)';
      }

      gsap.fromTo(node, fromVars, toVars);
    };

    const revealAll = () => {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
      animatedNodes.push(...nodes);

      gsap.fromTo(
        nodes,
        { autoAlpha: 0, y: prefersReducedMotion ? 12 : 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: prefersReducedMotion ? 0.55 : 0.85,
          ease: prefersReducedMotion ? 'power2.out' : 'power3.out',
          stagger: prefersReducedMotion ? 0.015 : 0.03,
          onComplete: () => {
            for (const node of nodes) node.classList.add(REVEAL_ANIMATION_CLASS);
            gsap.set(nodes, { clearProps: 'opacity,transform,visibility,filter' });
          },
        }
      );
    };

    if (!('IntersectionObserver' in window)) {
      revealAll();
      return () => {
        gsap.killTweensOf(animatedNodes);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const node = entry.target;
          if (!(node instanceof HTMLElement)) continue;
          reveal(node);
          observer.unobserve(node);
        }
      },
      { root: null, rootMargin: '0px 0px 10% 0px', threshold: 0 }
    );

    const seen = new WeakSet<Element>();
    let rafId: number | null = null;

    const scan = () => {
      rafId = null;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
      for (const node of nodes) {
        if (seen.has(node)) continue;
        seen.add(node);

        if (node.classList.contains(REVEAL_ANIMATION_CLASS)) continue;
        observer.observe(node);
      }
    };

    const scheduleScan = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(scan);
    };

    scan();

    const mutationObserver = new MutationObserver(scheduleScan);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      mutationObserver.disconnect();
      observer.disconnect();
      gsap.killTweensOf(animatedNodes);
    };
  }, [blog?.slug, activeChapterIndex]);

  useLayoutEffect(() => {
    const el = chapterContentRef.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      { autoAlpha: 0, x: prefersReducedMotion ? 0 : 22, filter: prefersReducedMotion ? 'none' : 'blur(10px)' },
      { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: prefersReducedMotion ? 0.25 : 0.45, ease: 'power3.out' }
    );
    return () => {
      gsap.killTweensOf(el);
    };
  }, [activeChapterIndex]);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = documentHeight > 0 ? (scrolled / documentHeight) * 100 : 0;
        setReadingProgress(Math.min(progress, 100));
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const root = articleRef.current;
    if (!root || toc.length === 0) return;

    const headings = Array.from(root.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target)
          .filter((node): node is HTMLElement => node instanceof HTMLElement)
          .sort((a, b) => a.offsetTop - b.offsetTop);

        if (visible[0]?.id) {
          setActiveHeadingId(visible[0].id);
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -70% 0px',
        threshold: 0,
      }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc.length, blog?.slug]);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1600);
  };

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied.');
    } catch {
      showToast('Copy failed.');
    }
  };

  const onShare = async () => {
    if (!blog) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url,
        });
        return;
      }
    } catch {
      // ignore share errors; fallback to copy
    }
    await onCopyLink();
  };

  const onToggleSaved = () => {
    if (!blog?.slug) return;
    const result = toggleReadingListSlug(blog.slug);
    setSaved(result.saved);
    showToast(result.saved ? 'Saved to reading list.' : 'Removed from reading list.');
  };

  const setChapter = (nextIndex: number) => {
    const bounded = Math.max(0, Math.min(chapterCount - 1, nextIndex));
    if (bounded === activeChapterIndex) return;
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (bounded === 0) {
      params.delete('chapter');
    } else {
      params.set('chapter', String(bounded + 1));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (!blog) {
    return (
      <div className="home-portfolio min-h-screen bg-[var(--home-bg)] text-[var(--home-ink)] flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">Story Not Found</h2>
          <p className="text-[var(--home-muted)]">The story you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-[var(--home-accent)] transition-colors text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="home-portfolio min-h-screen bg-[var(--home-bg)] text-[var(--home-ink)] font-nunito relative"
      data-page-content
    >
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-[var(--home-accent)] to-[var(--home-accent-2)] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-4 py-2 text-xs text-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
          {toast}
        </div>
      )}

      {readingProgress > 12 && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/80 backdrop-blur-xl transition hover:border-white/30 hover:text-white"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 xs:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3" data-gsap="reveal">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[var(--home-muted)] hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Journal</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSaved}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
              aria-pressed={saved}
              aria-label={saved ? 'Remove from reading list' : 'Save to reading list'}
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4 text-[var(--home-accent)]" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onCopyLink}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
              aria-label="Copy link"
            >
              <Link2 className="h-4 w-4" />
              Copy
            </button>
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article ref={articleRef} className="min-w-0">
            <header className="mb-10 xs:mb-12" data-gsap="reveal">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-white/40">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {blog.category || 'Story'}
                </span>
              </div>

              <h1 className="mt-5 text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {blog.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
                  <Users className="h-4 w-4" />
                  /{blog.slug}
                </span>
                {chapterCount > 1 ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChapter(activeChapterIndex - 1)}
                      disabled={activeChapterIndex === 0}
                      className={
                        activeChapterIndex === 0
                          ? 'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 opacity-60 cursor-not-allowed'
                          : 'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white'
                      }
                      aria-label="Previous chapter"
                      title="Previous chapter"
                    >
                      Prev
                    </button>
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/40">
                      Chapter {activeChapterIndex + 1}/{chapterCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChapter(activeChapterIndex + 1)}
                      disabled={activeChapterIndex >= chapterCount - 1}
                      className={
                        activeChapterIndex >= chapterCount - 1
                          ? 'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 opacity-60 cursor-not-allowed'
                          : 'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white'
                      }
                      aria-label="Next chapter"
                      title="Next chapter"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 xs:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <div className="relative pl-4 border-l-2 border-[var(--home-accent)]">
                  <p className="text-sm xs:text-base sm:text-lg text-white/75 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/50">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatBlogDate(blog.date)}
                  </span>
                  {showUniqueCounts ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
                      <Eye className="h-4 w-4" />
                      {resolvedUniqueVisitors.toLocaleString()}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
                    <User className="h-4 w-4" />
                    {blog.author || 'Phion'}
                  </span>
                </div>

                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/50">
                    <span className="inline-flex items-center gap-2">
                      <Tags className="h-4 w-4" />
                      Tags:
                    </span>
                    {blog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {coverImageSrc && (
              <div
                className="relative w-full h-56 xs:h-64 sm:h-72 md:h-[420px] overflow-hidden mb-10 xs:mb-12 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-black/30 to-black shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
                data-gsap="reveal">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageSrc}
                  alt={blog.title}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              </div>
            )}

            <div data-gsap="reveal" ref={chapterContentRef}>
              <BlogMarkdown content={content} enableCodeCopy />
            </div>

            <div className="mt-12 pt-6 border-t border-white/10" data-gsap="reveal">
              {relatedBlogs.length > 0 && (
                <section className="mb-10">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-white">Related stories</h2>
                    <span className="text-xs text-white/40">{relatedBlogs.length} picks</span>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {relatedBlogs.map((item) => {
                      const relatedImageSrc = resolveBlogImageSrc(item.image);

                      return (
                        <Link
                          key={item.id}
                          href={`/blog/${encodeURIComponent(item.slug)}`}
                          className="group rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition hover:border-white/25 hover:bg-white/[0.05]"
                        >
                          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 p-4">
                            <div className="relative h-20 w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                              {relatedImageSrc ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={relatedImageSrc}
                                    alt={item.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                </>
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-white/50">{formatBlogDate(item.date)}</p>
                              <p className="mt-1 font-semibold text-white line-clamp-2">{item.title}</p>
                              <p className="mt-2 text-xs text-white/60 line-clamp-2">{item.excerpt}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              <div className="flex items-center justify-between">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-[var(--home-muted)] hover:text-white transition-colors group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm">Back to Journal</span>
                </Link>
              </div>
              <div className="mt-6 text-center">
                <p className="text-xs xs:text-sm text-[var(--home-muted)] italic">
                  &ldquo;Every story is part of life&apos;s journey&rdquo;
                </p>
              </div>
            </div>
          </article>

          <aside className="hidden lg:block" data-gsap="reveal">
            <div className="sticky top-24 space-y-4">
              {/* <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">On this page</p>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                    {toc.length ? `${toc.length} sections` : '—'}
                  </span>
                </div>
                {toc.length === 0 ? (
                  <p className="mt-3 text-sm text-white/50">
                    Add headings like <code className="text-white/80">## Title</code> to generate a table of contents.
                  </p>
                ) : (
                  <nav className="mt-4 space-y-2 text-sm">
                    {toc.map((item) => {
                      const isActive = item.id === activeHeadingId;
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={(event) => {
                            event.preventDefault();
                            const target = document.getElementById(item.id);
                            if (!target) return;
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            window.history.replaceState(null, '', `#${item.id}`);
                          }}
                          className={`block rounded-lg px-2 py-1.5 transition ${
                            item.level === 3 ? 'pl-6 text-white/60 hover:text-white' : 'text-white/70 hover:text-white'
                          } ${
                            isActive ? 'bg-white/10 text-white' : 'bg-transparent'
                          }`}>
                          {item.text}
                        </a>
                      );
                    })}
                  </nav>
                )}
              </div> */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <p className="text-sm font-semibold text-white">Story details</p>
                <div className="mt-4 space-y-3 text-sm text-white/60">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </span>
                    <span className="text-white/80">{formatBlogDate(blog.date)}</span>
                  </div>
                  {showUniqueCounts ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Views
                      </span>
                      <span className="text-white/80">{resolvedUniqueVisitors.toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Author
                    </span>
                    <span className="text-white/80">{blog.author || 'Phion'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <Tags className="h-4 w-4" />
                      Category
                    </span>
                    <span className="text-white/80">{blog.category || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
