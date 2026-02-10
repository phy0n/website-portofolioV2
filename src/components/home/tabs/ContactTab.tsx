'use client';

import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';

import type { ContactInfo } from '../types';

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

export default function ContactTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Contact</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Start a conversation
        </h2>
        <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
          For collaborations or project ideas, reach out via email or the links in Connect.
        </p>
      </div>

      <div className="js-reveal rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 via-transparent to-transparent p-6">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Say hello</p>
            <p className="text-lg font-sans font-semibold text-[var(--home-ink)]">
              I am available for web projects and collaborations.
            </p>
            <p className="text-sm text-[var(--home-muted)]">Send a message and we can talk about the next idea.</p>
          </div>
          <div className="space-y-4">
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
      </div>

      {/* <div className="js-reveal rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Message</p>
          <p className="text-sm text-[var(--home-muted)]">
            Enter a valid email first, then write the message you want to send.
          </p>
        </div>
        <div className="mt-6">
          <ContactForm source="home" />
        </div>
      </div> */}
    </div>
  );
}
