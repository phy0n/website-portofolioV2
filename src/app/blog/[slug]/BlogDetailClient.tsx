'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Link2,
  Share2,
  Tags,
  User,
  Users,
  BookOpen,
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
      return raw.map((value: any) => (typeof value === 'string' ? value : '')).filter((value: string) => value.trim().length > 0);
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

  const prevChapterIndex = useRef(activeChapterIndex);

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
    const isNext = activeChapterIndex > prevChapterIndex.current;
    prevChapterIndex.current = activeChapterIndex;
    
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const xOffset = prefersReducedMotion ? 0 : (isNext ? 40 : -40);

    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      { autoAlpha: 0, x: xOffset, filter: prefersReducedMotion ? 'none' : 'blur(10px)' },
      { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: prefersReducedMotion ? 0.25 : 0.6, ease: 'power3.out' }
    );

    if (activeChapterIndex !== 0 || isNext) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      // ignore 
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
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-[var(--home-accent)] transition-colors text-white">
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
      className="home-portfolio min-h-screen bg-[var(--home-bg)] text-[var(--home-ink)] font-nunito relative selection:bg-[var(--home-accent)] selection:text-white pb-24"
      data-page-content>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-[var(--home-accent)] to-[var(--home-accent-2)] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}/>
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
          className="fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/80 backdrop-blur-xl transition hover:border-white/30 hover:text-white shadow-xl"
          aria-label="Back to top">
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6 py-12 md:py-20">
        <div className="mb-16 flex items-center justify-between" data-gsap="reveal">
          <Link
            href="/blog"
            className="group flex items-center gap-3 text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Close Book</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSaved}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              title={saved ? "Remove from reading list" : "Save to reading list"}>
              {saved ? <BookmarkCheck className="w-4 h-4 text-[var(--home-accent)]" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={onCopyLink}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              title="Copy link">
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={onShare}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              title="Share">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <header className="mb-16 text-center" data-gsap="reveal">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60 border border-white/10 rounded-full px-4 py-1.5">
              <BookOpen className="w-3 h-3" />
              {blog.category || 'Story'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-white leading-tight mb-8 max-w-3xl mx-auto">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-mono text-white/40 uppercase tracking-wider">
            <span className="flex items-center gap-2"><User className="w-3 h-3"/> {blog.author || 'Phion'}</span>
            <span className="flex items-center gap-2"><Calendar className="w-3 h-3"/> {formatBlogDate(blog.date)}</span>
            {showUniqueCounts && (
              <span className="flex items-center gap-2"><Eye className="w-3 h-3"/> {resolvedUniqueVisitors.toLocaleString()}</span>
            )}
          </div>
        </header>

        {coverImageSrc && (
          <div className="w-full aspect-[21/9] md:aspect-[2.35/1] overflow-hidden mb-16 rounded-2xl border border-white/5 bg-white/5 shadow-2xl" data-gsap="reveal">
             <img src={coverImageSrc} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700" alt={blog.title} loading="eager" />
          </div>
        )}

        <article className="relative mx-auto max-w-2xl text-lg sm:text-xl leading-[1.8] sm:leading-[1.9] text-white/80 font-serif" ref={articleRef}>
          <div ref={chapterContentRef} className="book-page-content">
            {activeChapterIndex === 0 && blog.excerpt && (
              <p className="text-xl md:text-2xl italic text-white/60 mb-12 text-center leading-relaxed border-b border-white/10 pb-12">
                "{blog.excerpt}"
              </p>
            )}
            
            <BlogMarkdown content={content} enableCodeCopy />
          </div>
        </article>
        {blog.tags && blog.tags.length > 0 && (
           <div className="mt-16 pt-8 max-w-2xl mx-auto flex flex-wrap gap-2 justify-center border-t border-white/10" data-gsap="reveal">
             {blog.tags.map(tag => (
                <span key={tag} className="text-xs font-mono text-white/30 border border-white/5 px-4 py-1.5 rounded-full">
                  #{tag}
                </span>
             ))}
           </div>
        )}
        {chapterCount > 1 && (
          <div className="mt-20 max-w-3xl mx-auto" data-gsap="reveal">
             <div className="flex items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-4 sm:p-8 rounded-3xl">
               <button 
                  onClick={() => setChapter(activeChapterIndex - 1)} 
                  disabled={activeChapterIndex === 0}
                  className={`group flex-1 flex flex-col items-start transition-opacity ${activeChapterIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-100 opacity-70'}`}>
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/40 mb-2 block">Previous Page</span>
                  <span className="text-base sm:text-xl font-serif text-white flex items-center gap-3">
                     <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Chapter {activeChapterIndex}
                  </span>
               </button>
               <div className="px-4 text-center">
                 <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[var(--home-accent)]">
                   {activeChapterIndex + 1} / {chapterCount}
                 </span>
               </div>
               <button 
                  onClick={() => setChapter(activeChapterIndex + 1)} 
                  disabled={activeChapterIndex === chapterCount - 1}
                  className={`group flex-1 flex flex-col items-end transition-opacity ${activeChapterIndex === chapterCount - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-100 opacity-70'}`}>
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/40 mb-2 block">Next Page</span>
                  <span className="text-base sm:text-xl font-serif text-white flex items-center gap-3">
                     Chapter {activeChapterIndex + 2} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
               </button>
             </div>
          </div>
        )}

        {relatedBlogs.length > 0 && (
          <div className="mt-24 max-w-4xl mx-auto" data-gsap="reveal">
            <h3 className="text-center text-sm font-mono uppercase tracking-widest text-white/40 mb-10">Further Reading</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBlogs.map(item => {
                const img = resolveBlogImageSrc(item.image);
                return (
                  <Link key={item.id} href={`/blog/${encodeURIComponent(item.slug)}`} className="group block">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-4 relative">
                      {img && <img src={img} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" loading="lazy" />}
                    </div>
                    <p className="text-[10px] font-mono text-[var(--home-accent)] uppercase tracking-widest mb-2">{formatBlogDate(item.date)}</p>
                    <h4 className="text-sm font-serif text-white/90 group-hover:text-white leading-snug line-clamp-2">{item.title}</h4>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
