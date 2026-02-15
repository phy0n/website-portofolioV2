'use client';

import React from 'react';
import { Instagram, Mail, MapPin } from 'lucide-react';
import { FaDiscord, FaTiktok } from 'react-icons/fa';
import ContactForm from '@/components/contact/ContactForm';

import type { ContactInfo, SocialMedia } from '../types';

const SOCIAL_MEDIA: SocialMedia[] = [
  {
    name: 'Instagram',
    icon: <Instagram className="h-5 w-5" />,
    url: 'https://www.instagram.com/rushandle/',
    color: '',
  },
  {
    name: 'TikTok',
    icon: <FaTiktok className="h-5 w-5" />,
    url: 'https://www.tiktok.com/@phy0n',
    color: '',
  },
  {
    name: 'Discord Server',
    icon: <FaDiscord className="h-5 w-5" />,
    url: 'https://discord.gg/MwNE7Vfb6t',
    color: '',
  },
];

const CONTACT_INFO: ContactInfo[] = [
  {
    type: 'Email',
    value: 'phymee@proton.me',
    icon: <Mail className="h-4 w-4" />,
    color: '',
  },
  {
    type: 'Location',
    value: 'Surabaya, Indonesia',
    icon: <MapPin className="h-4 w-4" />,
    color: '',
  },
];

export default function ConnectTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-3" data-gsap="reveal">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Connect</p>
        <h2 className="text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">Find me online</h2>
        <p className="max-w-2xl text-sm text-[var(--home-muted)]">Social spaces and places to reach me.</p>
      </div>

      <div className="divide-y divide-white/10 border-y border-white/10" data-gsap="reveal">
        {SOCIAL_MEDIA.map((social, index) => (
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-wrap items-center justify-between gap-4 py-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-[var(--home-ink)]">
                {social.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--home-ink)]">{social.name}</p>
                <p className="text-xs text-[var(--home-muted)]">Open link</p>
              </div>
            </div>
            <span className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)] transition group-hover:text-[var(--home-accent)]">
              Open
            </span>
          </a>
        ))}
      </div>

      <div className="space-y-3 border-t border-white/10 pt-6" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Contact</p>
          <span className="text-xs text-[var(--home-muted)]">Details</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACT_INFO.map((contact, index) => (
            <div key={index} className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-[var(--home-ink)]">
                {contact.icon}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">{contact.type}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--home-ink)]">{contact.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
{/* 
      <div className="space-y-3 border-t border-white/10 pt-6" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Message</p>
          <span className="text-xs text-[var(--home-muted)]">Email</span>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <ContactForm source="connect" />
        </div>
      </div> */}
    </div>
  );
}
