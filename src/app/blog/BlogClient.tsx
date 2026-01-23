'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ArrowLeft, Quote, X } from 'lucide-react';

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
}: {
  blogs: Blog[];
  quotes: DailyQuote[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isQuotesOpen, setIsQuotesOpen] = useState(false);

  const visibleBlogs = useMemo(() => {
    return blogs.filter((blog) => blog.is_published !== false);
  }, [blogs]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      visibleBlogs
        .map((blog) => blog.category)
        .filter((category) => Boolean(category))
    );
    return Array.from(uniqueCategories);
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

  const filteredBlogs = visibleBlogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalWords = visibleBlogs.reduce(
    (sum, blog) => sum + blog.content.split(/\s+/).length,
    0
  );
  const totalStories = visibleBlogs.length;

  return (
    <div className="min-h-screen bg-black text-white font-nunito relative">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920&h=1080&fit=crop"
          alt="Japanese scenery"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 xs:pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 xs:gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs xs:text-sm">Back to Portfolio</span>
        </Link>
      </div>

      <section className="relative border-b border-gray-900">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-12 md:py-16">
          <div className="grid lg:grid-cols-4 gap-6 xs:gap-8">
            <div className="lg:col-span-3 space-y-3 xs:space-y-4">
              <div className="flex items-center gap-2 xs:gap-3">
                <div className="h-px w-8 xs:w-10 sm:w-12 bg-red-500"></div>
                <span className="text-[10px] xs:text-xs text-gray-500 uppercase tracking-widest">Life Pages</span>
              </div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Phion story
              </h1>

              <p className="text-sm xs:text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
                AboutYou and the blue sky.
              </p>
            </div>
            <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3 xs:gap-4">
              <div className="group relative bg-white/[0.02] backdrop-blur-sm border border-gray-900 hover:border-red-900 p-4 xs:p-5 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="text-2xl xs:text-3xl font-bold text-white mb-1">{totalStories}</div>
                  <div className="text-[10px] xs:text-xs text-gray-500 uppercase tracking-wider">Total Stories</div>
                </div>
              </div>
              <div className="group relative bg-white/[0.02] backdrop-blur-sm border border-gray-900 hover:border-red-900 p-4 xs:p-5 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="text-2xl xs:text-3xl font-bold text-white mb-1">{totalWords.toLocaleString()}</div>
                  <div className="text-[10px] xs:text-xs text-gray-500 uppercase tracking-wider">Total Words</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 xs:mt-10 space-y-4 xs:space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-gray-900 focus:border-red-900 px-4 xs:px-5 py-3 xs:py-3.5 text-xs xs:text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
              />
              <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
            <div className="flex flex-wrap items-center gap-2 xs:gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 xs:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs border transition-all ${
                  !selectedCategory
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-gray-900 text-gray-500 hover:border-gray-800 hover:text-gray-400'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 xs:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs border transition-all ${
                    selectedCategory === category
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-gray-900 text-gray-500 hover:border-gray-800 hover:text-gray-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 xs:pt-10 sm:pt-12">
        <div className="flex items-center justify-between">
          <p className="text-xs xs:text-sm text-gray-500">
            {filteredBlogs.length === totalStories
              ? `Showing all ${totalStories} stories`
              : `Found ${filteredBlogs.length} of ${totalStories} stories`}
          </p>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="text-xs xs:text-sm text-red-500 hover:text-red-400 transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 xs:py-8 pb-16 xs:pb-20 sm:pb-24">
        <div className="grid lg:grid-cols-12 gap-6 xs:gap-8 items-start">
          <div className="lg:col-span-8">
            {filteredBlogs.length === 0 ? (
              <div className="text-center py-16 xs:py-20">
                <BookOpen className="w-12 h-12 xs:w-16 xs:h-16 text-gray-800 mx-auto mb-4" />
                <h3 className="text-lg xs:text-xl text-gray-400 mb-2">No stories found</h3>
                <p className="text-xs xs:text-sm text-gray-600">Try changing the filter or search keywords</p>
              </div>
            ) : (
              <div className="space-y-6 xs:space-y-8">
                {filteredBlogs.map((blog, index) => {
                  return (
                    <Link
                      key={blog.id}
                      href={`/blog/${encodeURIComponent(blog.slug)}`}
                      className="group block"
                    >
                      <article className="relative bg-black border border-gray-900 hover:border-gray-800 transition-all duration-300 overflow-hidden">
                        <div className="grid md:grid-cols-5 gap-0">
                          <div className="md:col-span-2 relative h-48 xs:h-56 sm:h-64 md:h-72 overflow-hidden">
                            {blog.image && (
                              <Image
                                src={blog.image}
                                alt={blog.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/60 md:to-black"></div>
                            <div className="absolute top-3 xs:top-4 right-3 xs:right-4 bg-black/80 backdrop-blur-sm border border-gray-800 px-2 xs:px-3 py-1 xs:py-1.5">
                              <div className="flex items-center gap-1.5 xs:gap-2">
                                <BookOpen className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-red-500" />
                                <span className="text-[10px] xs:text-xs text-gray-400">Story #{index + 1}</span>
                              </div>
                            </div>
                          </div>
                          <div className="md:col-span-3 p-5 xs:p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 xs:mb-4 group-hover:text-gray-300 transition-colors leading-tight">
                              {blog.title}
                            </h2>
                            <p className="text-xs xs:text-sm sm:text-base text-gray-400 leading-relaxed mb-4 xs:mb-5 sm:mb-6 line-clamp-2 xs:line-clamp-3">
                              {blog.excerpt}
                            </p>
                            <div className="flex items-center gap-2 text-xs xs:text-sm text-red-500 group-hover:gap-3 transition-all">
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
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-gray-900 p-4 xs:p-5 overflow-hidden">
                <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Quote className="w-4 h-4 text-red-500" />
                      <h2 className="text-sm font-semibold text-white">Daily Quotes</h2>
                    </div>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                      {sortedQuotes.length} quotes
                    </span>
                  </div>

                  {sortedQuotes.length > 0 ? (
                    <div className="mt-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto hide-scrollbar pr-1">
                      {sortedQuotes.map((quote, index) => (
                        <div key={`${quote.id}-${quote.date}-${index}`} className="border-l border-gray-900 pl-3">
                          <p className="text-[10px] text-gray-500 mb-1">{formatQuoteDate(quote.date)}</p>
                          <p className="text-sm text-gray-300 leading-relaxed italic">“{quote.text}”</p>
                          {quote.author && <p className="mt-2 text-xs text-gray-500">— {quote.author}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">No quotes yet.</p>
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
        className="lg:hidden fixed top-4 right-4 z-40 bg-black/80 backdrop-blur-sm border border-gray-800 rounded-full px-3 py-3 flex items-center gap-2 text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
        aria-label="Open daily quotes"
      >
        <Quote className="w-4 h-4 text-red-500" />
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
          className={`absolute top-0 right-0 h-full w-[min(360px,100vw)] bg-black border-l border-gray-900 shadow-2xl transition-transform duration-300 ${
            isQuotesOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-900">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-white">Daily Quotes</span>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotesOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
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
                      className="relative bg-white/[0.02] backdrop-blur-sm border border-gray-900 p-4 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-black/10 transition-all duration-300 backdrop-blur-sm"></div>
                      <div className="relative z-10">
                        <p className="text-xs text-gray-500 mb-3">{formatQuoteDate(quote.date)}</p>
                        <p className="text-base text-gray-200 leading-relaxed italic">“{quote.text}”</p>
                        {quote.author && <p className="mt-3 text-sm text-gray-500">— {quote.author}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No quotes yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
