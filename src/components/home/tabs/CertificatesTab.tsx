'use client';

import React from 'react';
import { Award } from 'lucide-react';

import type { Certificate } from '../types';

const CERTIFICATES: Certificate[] = [
  {
    title: 'Intro to Software Engineering',
    issuer: 'RevoU',
    date: '2024',
    status: 'Completed',
    description: 'Just Intro to Software Engineering',
    icon: <Award className="h-4 w-4" />,
  },
];

export default function CertificatesTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Certificates</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Personal Ceritificate
        </h2>
        <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
          Formal learning that supports my daily build process.
        </p>
      </div>

      <div className="space-y-6">
        {CERTIFICATES.map((cert, index) => (
          <div key={index} className="js-reveal grid gap-6 border-b border-white/10 pb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--home-accent)]">
                {cert.icon}
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">Certificate</p>
              </div>
              <h3 className="text-lg font-sans font-semibold text-[var(--home-ink)]">{cert.title}</h3>
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">
                {cert.issuer} | {cert.date}
              </p>
              <p className="text-sm text-[var(--home-muted)]">{cert.description}</p>
              <span className="inline-flex rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[var(--home-muted)]">
                {cert.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
