'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

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

export default function BlogDetailClient({ blog }: { blog: Blog | null }) {
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!blog) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">Story Not Found</h2>
          <p className="text-gray-400">The story you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-800 hover:border-red-500 transition-colors text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

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
      <div className="fixed inset-0 bg-gradient-to-b from-black via-black/95 to-black pointer-events-none"></div>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <article className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-12">
        <header className="mb-10 xs:mb-12 sm:mb-16">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 xs:mb-8 leading-tight">
            {blog.title}
          </h1>
          <div className="relative pl-3 xs:pl-4 sm:pl-6 border-l-2 border-red-500">
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed">
              {blog.excerpt}
            </p>
          </div>
        </header>
        {blog.image && (
          <div className="relative w-full h-48 xs:h-56 sm:h-64 md:h-96 lg:h-[600px] overflow-hidden mb-10 xs:mb-12 sm:mb-16 border border-gray-900">
            <Image src={blog.image} alt={blog.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        )}
        <div className="prose prose-invert max-w-none mb-10 xs:mb-12 sm:mb-16">
          {blog.content.split('\n').map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2
                  key={index}
                  className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mt-10 xs:mt-12 sm:mt-16 mb-4 xs:mb-5 sm:mb-6 text-white"
                >
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3
                  key={index}
                  className="text-lg xs:text-xl sm:text-2xl font-bold mt-8 xs:mt-10 sm:mt-12 mb-3 xs:mb-4 text-white"
                >
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('```')) {
              const codeMatch = blog.content.match(/```(\w+)?\n([\s\S]*?)```/);
              if (codeMatch) {
                return (
                  <pre key={index} className="bg-gray-950 border border-gray-900 p-3 xs:p-4 sm:p-6 overflow-x-auto my-6 xs:my-8">
                    <code className="text-[10px] xs:text-xs sm:text-sm text-gray-300">{codeMatch[2].trim()}</code>
                  </pre>
                );
              }
            }
            if (paragraph.startsWith('- ')) {
              return (
                <li key={index} className="text-xs xs:text-sm sm:text-base text-gray-300 ml-4 xs:ml-6 mb-2 xs:mb-3">
                  {paragraph.replace('- ', '')}
                </li>
              );
            }
            if (paragraph.trim()) {
              return (
                <p key={index} className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed mb-4 xs:mb-5 sm:mb-6">
                  {paragraph}
                </p>
              );
            }
            return null;
          })}
        </div>
        <div className="mt-10 xs:mt-12 sm:mt-16 pt-6 xs:pt-8 border-t border-gray-900">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 xs:gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs xs:text-sm">Kembali ke Journal</span>
            </Link>
          </div>
          <div className="mt-6 xs:mt-8 text-center">
            <p className="text-xs xs:text-sm text-gray-600 italic">
              &ldquo;Setiap cerita adalah bagian dari perjalanan hidup&rdquo;
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
