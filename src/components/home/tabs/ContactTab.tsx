'use client';

import React from 'react';
import { Mail, MapPin } from 'lucide-react';

import type { ContactInfo } from '../types';

const CONTACT_INFO: ContactInfo[] = [
  {
    type: 'Email',
    value: 'phymee@proton.me',
    icon: <Mail className="h-5 w-5" />,
    color: '',
  },
  {
    type: 'Location',
    value: 'Surabaya, Indonesia',
    icon: <MapPin className="h-5 w-5" />,
    color: '',
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
        <p className="js-reveal text-sm leading-relaxed text-[var(--home-muted)] sm:text-base">
          Projects, collabs, or questions.
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-white/15 bg-white/[0.015]">
        <div className="grid md:grid-cols-2">
          {CONTACT_INFO.map((contact, index) => {
            const cardContent = (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-500">
                    {contact.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">{contact.type}</p>
                    <p className="mt-1 text-xs text-[var(--home-muted)]">
                      {contact.type === 'Email' ? 'Direct inbox' : 'Current base'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="max-w-full break-words text-xl font-sans font-semibold leading-snug text-[var(--home-ink)] sm:text-2xl">
                    {contact.value}
                  </p>
                  <div className="h-px w-full bg-white/15" />
                  <div className="grid grid-cols-[1fr_48px_1fr] gap-3">
                    <span className="h-px bg-white/10" />
                    <span className="h-px bg-red-500/80" />
                    <span className="h-px bg-white/10" />
                  </div>
                </div>
              </>
            );

            const className = `group flex min-h-44 flex-col justify-between gap-8 p-6 transition hover:bg-white/[0.025] ${
              index === 0 ? 'border-b border-white/15 md:border-b-0 md:border-r' : ''
            }`;

            return contact.type === 'Email' ? (
              <a key={contact.type} href={`mailto:${contact.value}`} className={className}>
                {cardContent}
              </a>
            ) : (
              <div key={contact.type} className={className}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
