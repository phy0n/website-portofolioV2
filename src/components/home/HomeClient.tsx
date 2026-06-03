'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useDiscordStatusRealtime } from '@/lib/discord/useDiscordStatusRealtime';
import DiscordActivitySection from './DiscordActivitySection';
import { HomeSidebarDataProvider } from './HomeSidebarDataProvider';
import SpokenLanguagesCard from './SpokenLanguagesCard';
import EducationCard from './EducationCard';
import LatestPostsCard from './LatestPostsCard';
import SiteShell from './SiteShell';
import ToolsMarquee from './ToolsMarquee';
import AboutTab from './tabs/AboutTab';
import CertificatesTab from './tabs/CertificatesTab';
import ContactTab from './tabs/ContactTab';
import ExperienceTab from './tabs/ExperienceTab';
import ProjectsTab from './tabs/ProjectsTab';
import { SOCIAL_MEDIA } from './data/social';
import SkillsTab from './tabs/SkillsTab';

const DISPLAY_NAME = 'Phion Rushandle';
const HERO_DEGREE = 'Computer Science Enthusiast';
const HERO_TAGLINE = 'Exploring how code, web apps, data, and operating systems work together.';
const HERO_IMAGE_SRC = '/image/profile.png';
const HERO_IMAGE_FALLBACK = 'P';

const STATUS_LABELS: Record<string, string> = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do not disturb',
  offline: 'Offline',
};

const STATUS_STYLES: Record<string, string> = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-400',
  dnd: 'bg-rose-500',
  offline: 'bg-slate-500',
};

interface HomeClientProps {
  discordUserId: string | null;
  profileImageUrl?: string | null;
  tools: string[];
}

export default function HomeClient({ discordUserId, profileImageUrl, tools }: HomeClientProps) {
  const [heroImageErrorSrc, setHeroImageErrorSrc] = useState<string | null>(null);
  const [avatarDecorationUrl, setAvatarDecorationUrl] = useState<string | null>(null);
  const { discordStatus } = useDiscordStatusRealtime(discordUserId);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const heroImageSrc = profileImageUrl || HERO_IMAGE_SRC;
  const heroImageErrored = heroImageErrorSrc === heroImageSrc;

  useEffect(() => {
    fetch('/api/discord-avatar')
      .then((res) => res.json())
      .then((data) => {
        if (data.avatarDecorationUrl) {
          setAvatarDecorationUrl(data.avatarDecorationUrl);
        }
      })
      .catch(() => {});
  }, []);

  const statusKey = discordStatus?.status ?? 'offline';
  const statusLabel = STATUS_LABELS[statusKey] ?? 'Offline';
  const statusClass = STATUS_STYLES[statusKey] ?? STATUS_STYLES.offline;
  const hasLiveActivity = Boolean(discordStatus?.spotify || discordStatus?.activity);

  return (
    <HomeSidebarDataProvider>
      <SiteShell scopeRef={scopeRef} navAvatarSrc={heroImageSrc}>
        <section id="top" className="grid gap-10 pb-14 pt-6 lg:grid-cols-[280px_1fr] lg:items-center">
          <div className="js-hero-image relative mx-auto h-56 w-56 sm:h-64 sm:w-64 lg:mx-0">
            <div className="relative h-full w-full overflow-hidden rounded-full border border-[var(--home-border)] bg-[var(--home-soft)]">
              {heroImageErrored ? (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-[var(--home-ink)]">
                  {HERO_IMAGE_FALLBACK}
                </div>
              ) : (
                <Image
                  key={heroImageSrc}
                  src={heroImageSrc}
                  alt={`${DISPLAY_NAME} profile photo`}
                  fill
                  sizes="(max-width: 1024px) 256px, 280px"
                  className="object-cover"
                  priority
                  onError={() => setHeroImageErrorSrc(heroImageSrc)}
                />
              )}
            </div>

            {avatarDecorationUrl && (
              <Image
                src={avatarDecorationUrl}
                alt="Avatar Decoration"
                fill
                className="pointer-events-none absolute inset-0 z-10 scale-[1.2] object-contain"
                unoptimized
              />
            )}

            <span
              className={`absolute bottom-4 right-4 z-20 h-4 w-4 rounded-full border-2 border-[var(--home-card)] ${statusClass}`}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="js-hero-tag text-[11px] uppercase tracking-[0.45em] text-[var(--home-muted)]">Portfolio</p>
              <h1 className="js-hero-title text-4xl font-sans font-semibold leading-tight text-[var(--home-ink)] sm:text-5xl lg:text-6xl">
                {DISPLAY_NAME}
              </h1>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[var(--home-ink)]">{HERO_DEGREE}</p>
                <p className="max-w-xl text-sm leading-relaxed text-[var(--home-muted)]">{HERO_TAGLINE}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {SOCIAL_MEDIA.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-ink)] opacity-70 transition hover:border-[var(--home-ink)] hover:bg-[var(--home-soft)] hover:opacity-100">
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-[var(--home-border)] pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Activity</p>
                <div className="flex items-center gap-2 text-xs text-[var(--home-muted)]">
                  <span className={`h-2 w-2 rounded-full ${statusClass}`} />
                  {statusLabel}
                </div>
              </div>

              {hasLiveActivity && discordStatus ? <DiscordActivitySection discordStatus={discordStatus} /> : null}
            </div>
          </div>
        </section>

        {tools.length > 0 && (
          <section className="mb-14">
            <ToolsMarquee tools={tools} />
          </section>
        )}

        <div className="mt-20">
          <div className="space-y-20">
            <section id="about" className="js-section scroll-mt-24">
              <AboutTab />
            </section>

            <section id="languages" className="js-section scroll-mt-24">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Capabilities</p>
                  <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
                    Spoken Languages
                  </h2>
                  <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
                    Languages I can speak and write.
                  </p>
                </div>

                <div className="js-reveal pt-4">
                  <SpokenLanguagesCard />
                </div>
              </div>
            </section>

            <section id="education" className="js-section scroll-mt-24">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Background</p>
                  <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
                    Education
                  </h2>
                  <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
                    My academic background and formal education.
                  </p>
                </div>

                <div className="js-reveal pt-4">
                  <EducationCard />
                </div>
              </div>
            </section>
            <section id="skills" className="js-section scroll-mt-24">
              <SkillsTab />
            </section>
            <section id="experience" className="js-section scroll-mt-24">
              <ExperienceTab />
            </section>
            <section id="certificates" className="js-section scroll-mt-24">
              <CertificatesTab />
            </section>
            <section id="projects" className="js-section scroll-mt-24">
              <ProjectsTab />
            </section>
            <section id="latest-posts" className="js-section scroll-mt-24">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Blog</p>
                  <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
                    Latest Posts
                  </h2>
                  <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
                    Recent updates and short reads from the blog.
                  </p>
                </div>

                <div className="js-reveal pt-4">
                  <LatestPostsCard />
                </div>
              </div>
            </section>
            <section id="contact" className="js-section scroll-mt-24">
              <ContactTab />
            </section>
          </div>
        </div>
      </SiteShell>
    </HomeSidebarDataProvider>
  );
}
