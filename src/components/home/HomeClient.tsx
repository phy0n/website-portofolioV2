'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import { useDiscordStatusRealtime } from '@/lib/discord/useDiscordStatusRealtime';

import ProfileSidebar from './ProfileSidebar';
import SiteShell from './SiteShell';
import AboutTab from './tabs/AboutTab';
import CertificatesTab from './tabs/CertificatesTab';
import ContactTab from './tabs/ContactTab';
import ExperienceTab from './tabs/ExperienceTab';
import ProjectsTab from './tabs/ProjectsTab';
import SkillsTab from './tabs/SkillsTab';

const PROFILE_SKILLS = ['Software Engineer', 'Data Analyst Enthusiast'];

const HIGHLIGHTS = [
  { label: 'Role', value: 'Software Engineer' },
  { label: 'Focus', value: 'Modern UI and UX' },
  { label: 'Location', value: 'Surabaya, Indonesia' },
  { label: 'Status', value: 'Open to collaboration' },
];

interface BlogPreview {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags?: string[] | null;
}

const formatBlogDate = (dateKey: string) => {
  const [yyyy, mm, dd] = dateKey.split('-').map(Number);
  if (!yyyy || !mm || !dd) return dateKey;
  return new Date(Date.UTC(yyyy, mm - 1, dd)).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

interface HomeClientProps {
  discordUserId: string | null;
}

export default function HomeClient({ discordUserId }: HomeClientProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { discordStatus } = useDiscordStatusRealtime(discordUserId);
  const [latestBlogs, setLatestBlogs] = useState<BlogPreview[]>([]);
  const scopeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const schedule = (fn: () => void) => {
      const w = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
      if (w.requestIdleCallback) {
        w.requestIdleCallback(fn, { timeout: 1200 });
      } else {
        window.setTimeout(fn, 250);
      }
    };

    const fetchAvatar = async () => {
      try {
        const res = await fetch('/api/discord-avatar');
        const data = await res.json();
        setAvatarUrl(data.avatarUrl || null);
      } catch (err) {
        console.error('Failed to fetch avatar:', err);
      }
    };

    const fetchLatestBlogs = async () => {
      try {
        const res = await fetch('/api/latest-blogs');
        const data = await res.json();
        const blogs = Array.isArray(data?.blogs) ? (data.blogs as BlogPreview[]) : null;
        if (blogs && blogs.length) {
          setLatestBlogs(blogs.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch latest blogs:', err);
      }
    };

    schedule(() => {
      fetchAvatar();
      fetchLatestBlogs();
    });

    const blogsInterval = window.setInterval(fetchLatestBlogs, 60000);

    return () => {
      clearInterval(blogsInterval);
    };
  }, []);

  return (
    <SiteShell scopeRef={scopeRef}>
      <section id="top" className="grid gap-10 pb-14 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="space-y-7">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.45em] text-[var(--home-muted)]">
            <span className="js-hero-line h-px w-10 bg-[var(--home-accent)]" />
            <span className="js-hero-tag">Portfolio</span>
          </div>
          <h1 className="js-hero-title text-4xl font-sans font-semibold leading-tight text-[var(--home-ink)] sm:text-5xl lg:text-6xl">
            <span className="block">Welcome to my Portofolio</span>
          </h1>
          <p className="js-hero-sub max-w-xl text-base text-[var(--home-muted)] sm:text-lg">
            I build frontend interfaces with clarity, motion that matters, and a visual system that stays professional.
          </p>
          {/* <div className="flex flex-wrap gap-3">
            <a
              href="/#projects"
              className="js-hero-cta rounded-full bg-[var(--home-accent)] px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(209,74,74,0.25)] transition hover:-translate-y-0.5 hover:bg-[var(--home-accent-2)]"
            >
              View projects
            </a>
            <a
              href="/connect"
              className="js-hero-cta rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-[var(--home-ink)] transition hover:border-[var(--home-accent)]"
            >
              Connect
            </a>
          </div> */}
          <div className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => (
              <div key={item.label} className="js-hero-meta border-l-2 border-[var(--home-accent)] pl-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--home-ink)]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="js-profile">
          <ProfileSidebar avatarUrl={avatarUrl} discordStatus={discordStatus} skills={PROFILE_SKILLS} />
        </div>
      </section>

      <div className="space-y-20">
        <section id="about" className="js-section scroll-mt-24">
          <AboutTab />
        </section>
        <section id="skills" className="js-section scroll-mt-24">
          <SkillsTab />
        </section>
        <section id="experience" className="js-section scroll-mt-24">
          <ExperienceTab />
        </section>
        <section id="projects" className="js-section scroll-mt-24">
          <ProjectsTab />
        </section>
        <section id="certificates" className="js-section scroll-mt-24">
          <CertificatesTab />
        </section>
        <section id="latest" className="js-section scroll-mt-24">
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-2">
                <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Latest</p>
                <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
                  Latest Blog Posts
                </h2>
                <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
                  Short notes and stories from the blog. Read the latest updates.
                </p>
              </div>
              <Link
                href="/blog"
                className="js-reveal inline-flex items-center rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)] transition hover:border-white/20 hover:text-[var(--home-ink)]"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-white/10 border-b border-white/10">
              {latestBlogs.length === 0 ? (
                <div className="js-reveal py-6 text-sm text-[var(--home-muted)]">No posts yet.</div>
              ) : (
                latestBlogs.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${encodeURIComponent(post.slug)}`}
                    className="js-reveal group grid gap-4 py-6 md:grid-cols-[180px_1fr]"
                  >
                    <p className="text-sm text-[var(--home-accent)]">{formatBlogDate(post.date)}</p>
                    <div className="space-y-3">
                      <h3 className="text-lg font-sans font-semibold text-[var(--home-ink)] transition group-hover:text-white">
                        {post.title}
                      </h3>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[var(--home-muted)]">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-black/30 px-3 py-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-[var(--home-muted)]">{post.excerpt}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
        <section id="contact" className="js-section scroll-mt-24">
          <ContactTab />
        </section>
      </div>
    </SiteShell>
  );
}
