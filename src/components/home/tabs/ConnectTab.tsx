'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, BadgeCheck, Quote, Sparkles, Mail, MapPin } from 'lucide-react';

import type { ContactInfo } from '../types';
import { SOCIAL_MEDIA } from '../data/social';

type ServiceRow = {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  starting_from?: string | null;
  cta_label?: string | null;
  cta_link?: string | null;
};

type TestimonialRow = {
  id: string;
  name: string;
  title?: string | null;
  company?: string | null;
  quote: string;
  source_url?: string | null;
};

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
  const [services, setServices] = useState<ServiceRow[] | null>(null);
  const [testimonials, setTestimonials] = useState<TestimonialRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const schedule = (fn: () => void) => {
      const w = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
      if (w.requestIdleCallback) {
        w.requestIdleCallback(fn, { timeout: 1200 });
      } else {
        window.setTimeout(fn, 200);
      }
    };

    const fetchJson = async <T,>(url: string, fallback: T): Promise<T> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return fallback;
        return (await res.json()) as T;
      } catch {
        return fallback;
      }
    };

    schedule(() => {
      Promise.all([
        fetchJson<{ services?: ServiceRow[] }>('/api/services', {}),
        fetchJson<{ testimonials?: TestimonialRow[] }>('/api/testimonials', {}),
      ]).then(([servicesPayload, testimonialsPayload]) => {
        if (cancelled) return;
        setServices(Array.isArray(servicesPayload.services) ? servicesPayload.services : []);
        setTestimonials(Array.isArray(testimonialsPayload.testimonials) ? testimonialsPayload.testimonials : []);
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-3" data-gsap="reveal">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Connect</p>
        <h2 className="text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">Find me online</h2>
        <p className="max-w-2xl text-sm text-[var(--home-muted)]">Social spaces and places to reach me.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mt-8" data-gsap="reveal">
        <div className="space-y-4">
          <h3 className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Social Media</h3>
          <div className="grid gap-3">
            {SOCIAL_MEDIA.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-4 transition-all hover:border-[var(--home-accent)] hover:bg-[var(--home-soft)]">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--home-accent)]/20 bg-[var(--home-accent)]/10 text-[var(--home-accent)] transition-all group-hover:scale-110 group-hover:border-[var(--home-accent)]/40 group-hover:bg-[var(--home-accent)]/20">
                    {social.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--home-ink)]">{social.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--home-muted)] opacity-70">Follow & connect</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-[var(--home-muted)] opacity-40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--home-accent)] group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Direct Contact</h3>
          <div className="grid gap-3">
            {CONTACT_INFO.map((contact, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-5 transition-all hover:border-[var(--home-ink)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--home-border)] bg-[var(--home-soft)] text-[var(--home-ink)] opacity-80">
                  {contact.icon}
                </div>
                <div className="space-y-1 pt-0.5">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">{contact.type}</p>
                  <p className="text-sm font-semibold text-[var(--home-ink)]">{contact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* <div className="space-y-3 border-t border-[var(--home-border)] pt-6" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Services</p>
          <span className="text-xs text-[var(--home-muted)]">Freelance</span>
        </div>

        {services === null ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="h-40 rounded-3xl border border-[var(--home-border)] bg-[var(--home-soft)] animate-pulse"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-6">
            <p className="text-sm font-semibold text-[var(--home-ink)]">No services yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => {
              const ctaHref = service.cta_link?.trim() || `mailto:${CONTACT_INFO[0]?.value ?? 'phymee@proton.me'}`;
              const ctaLabel = service.cta_label?.trim() || 'Discuss';

              return (
                <div
                  key={service.id}
                  className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[var(--home-accent)]">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <h3 className="text-sm font-semibold text-[var(--home-ink)]">{service.title}</h3>
                        {service.starting_from ? (
                          <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--home-muted)]">
                            {service.starting_from}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-[var(--home-muted)]">{service.description}</p>
                    </div>

                    <a
                      href={ctaHref}
                      target={ctaHref.startsWith('http') ? '_blank' : undefined}
                      rel={ctaHref.startsWith('http') ? 'noreferrer noopener' : undefined}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--home-muted)] transition hover:border-[var(--home-ink)] hover:bg-[var(--home-card)] hover:text-[var(--home-ink)]"
                      aria-label={`${ctaLabel} about ${service.title}`}>
                      {ctaLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>

                  {service.deliverables.length > 0 ? (
                    <div className="mt-4 grid gap-2">
                      {service.deliverables.slice(0, 6).map((item) => (
                        <div key={item} className="flex items-start gap-2 text-xs text-[var(--home-muted)]">
                          <BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--home-accent)]" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-[var(--home-border)] pt-6" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Testimonials</p>
          <span className="text-xs text-[var(--home-muted)]">What people say</span>
        </div>

        {testimonials === null ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="h-40 rounded-3xl border border-[var(--home-border)] bg-[var(--home-soft)] animate-pulse"
              />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-6">
            <p className="text-sm font-semibold text-[var(--home-ink)]">No testimonials yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.slice(0, 6).map((item) => {
              const subtitle = [item.title?.trim(), item.company?.trim()].filter(Boolean).join(' • ');

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[var(--home-accent)]">
                      <Quote className="h-5 w-5" />
                    </span>
                    <p className="text-sm leading-relaxed text-[var(--home-ink)] opacity-80">“{item.quote}”</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--home-ink)]">{item.name}</p>
                      {subtitle ? <p className="mt-1 text-xs text-[var(--home-muted)]">{subtitle}</p> : null}
                    </div>
                    {item.source_url ? (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--home-muted)] transition hover:border-[var(--home-ink)] hover:bg-[var(--home-card)] hover:text-[var(--home-ink)]"
                        aria-label={`Open testimonial source for ${item.name}`}>
                        Source
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div> */}
    </div>
  );
}
