'use client';

import Image from 'next/image';
import React, { useRef, useState } from 'react';

import { useDiscordStatusRealtime } from '@/lib/discord/useDiscordStatusRealtime';

import DiscordActivitySection from './DiscordActivitySection';
import HomeRightSidebar from './HomeRightSidebar';
import ProfileFactsCard from './ProfileFactsCard';
import SiteShell from './SiteShell';
import AboutTab from './tabs/AboutTab';
import ContactTab from './tabs/ContactTab';
import ExperienceTab from './tabs/ExperienceTab';
import ProjectsTab from './tabs/ProjectsTab';
import { SOCIAL_MEDIA } from './data/social';
import SkillsTab from './tabs/SkillsTab';

const DISPLAY_NAME = 'Phion Rushandle';
const HERO_DEGREE = 'Website Developer | Cyber Security | Data Analyst';
const HERO_TAGLINE = 'Crafting digital experiences with code, creativity, and a touch of magic. Welcome to my portfolio!';
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
}

export default function HomeClient({ discordUserId }: HomeClientProps) {
  const [heroImageErrored, setHeroImageErrored] = useState(false);
  const { discordStatus } = useDiscordStatusRealtime(discordUserId);
  const scopeRef = useRef<HTMLDivElement | null>(null);

  const statusKey = discordStatus?.status ?? 'offline';
  const statusLabel = STATUS_LABELS[statusKey] ?? 'Offline';
  const statusClass = STATUS_STYLES[statusKey] ?? STATUS_STYLES.offline;
  const hasLiveActivity = Boolean(discordStatus?.spotify || discordStatus?.activity);

  return (
    <SiteShell scopeRef={scopeRef}>
      <section id="top" className="grid gap-10 pb-14 pt-6 lg:grid-cols-[280px_1fr] lg:items-center">
        <div className="js-hero-image relative mx-auto h-56 w-56 overflow-hidden rounded-3xl border border-white/10 bg-[var(--home-soft)] shadow-[0_18px_40px_rgba(0,0,0,0.45)] sm:h-64 sm:w-64 lg:mx-0">
          {heroImageErrored ? (
            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-[var(--home-ink)]">
              {HERO_IMAGE_FALLBACK}
            </div>
          ) : (
            <Image
              src={HERO_IMAGE_SRC}
              alt={`${DISPLAY_NAME} profile photo`}
              fill
              sizes="(max-width: 1024px) 256px, 280px"
              className="object-cover"
              priority
              onError={() => setHeroImageErrored(true)}
            />
          )}
          <span className={`absolute bottom-4 right-4 h-4 w-4 rounded-full border-2 border-black/60 ${statusClass}`} />
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
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Activity</p>
              <div className="flex items-center gap-2 text-xs text-[var(--home-muted)]">
                <span className={`h-2 w-2 rounded-full ${statusClass}`} />
                {statusLabel}
              </div>
            </div>

            {hasLiveActivity && discordStatus ? (
              <DiscordActivitySection discordStatus={discordStatus} />
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-20 grid gap-14 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="space-y-20">
          <div className="space-y-8">
            <section id="about" className="js-section scroll-mt-24">
              <AboutTab />
            </section>
            <ProfileFactsCard className="lg:hidden" />
          </div>
          <section id="skills" className="js-section scroll-mt-24">
            <SkillsTab />
          </section>
          <section id="experience" className="js-section scroll-mt-24">
            <ExperienceTab />
          </section>
          <section id="projects" className="js-section scroll-mt-24">
            <ProjectsTab />
          </section>
          <section id="contact" className="js-section scroll-mt-24">
            <ContactTab />
          </section>
        </div>

        <aside className="lg:border-l lg:border-white/10 lg:pl-10">
          <HomeRightSidebar />
        </aside>
      </div>
    </SiteShell>
  );
}
