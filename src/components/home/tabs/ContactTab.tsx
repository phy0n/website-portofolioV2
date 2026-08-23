'use client';

import React from 'react';
import { Mail, Instagram, ArrowUpRight } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';

const CONTACT_INFO = [
  {
    type: 'Email',
    value: 'phymee@proton.me',
    label: 'Direct inbox',
    icon: <Mail className="h-6 w-6" />,
    url: 'mailto:phymee@proton.me'
  },
  {
    type: 'Discord',
    value: 'phy0n',
    label: 'Add friend',
    icon: <FaDiscord className="h-6 w-6" />,
    url: ''
  },
  {
    type: 'Instagram',
    value: '@phy0n.me',
    label: 'Follow me',
    icon: <Instagram className="h-6 w-6" />,
    url: 'https://instagram.com/phy0n.me'
  },
];

export default function ContactTab() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Contact</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Let&apos;s talk
        </h2>
        <p className="js-reveal max-w-4xl text-sm sm:text-base md:text-lg leading-relaxed text-[var(--home-muted)]">
          Projects, collabs, or questions.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {CONTACT_INFO.map((contact) => {
          const isLink = Boolean(contact.url);
          const Wrapper = isLink ? 'a' : 'div';

          return (
            <Wrapper
              key={contact.type}
              {...(isLink ? { href: contact.url, target: contact.url.startsWith('http') ? '_blank' : undefined, rel: contact.url.startsWith('http') ? 'noreferrer' : undefined } : {})}
              className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[2rem] border border-[var(--home-border)] bg-[var(--home-card)] p-6 transition-colors duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex shrink-0 items-center justify-center text-[var(--home-accent)] transition-colors duration-300">
                  {contact.icon}
                </div>
                {isLink && (
                  <ArrowUpRight className="h-5 w-5 text-[var(--home-muted)] opacity-30 transition-colors duration-300 group-hover:text-[var(--home-accent)] group-hover:opacity-100" />
                )}
              </div>

              <div className="mt-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--home-muted)] opacity-60">
                  {contact.type}
                </p>
                <p className="mt-2 text-lg sm:text-xl font-sans font-semibold text-[var(--home-ink)] truncate group-hover:underline underline-offset-4 decoration-[var(--home-accent)] transition-colors duration-300">
                  {contact.value}
                </p>
                <p className="mt-1 text-xs text-[var(--home-muted)] opacity-70">
                  {contact.label}
                </p>
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
