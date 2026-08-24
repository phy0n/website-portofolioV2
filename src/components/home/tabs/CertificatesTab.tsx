'use client';

import React, { useEffect, useState } from 'react';
import { Award, BadgeCheck, BookOpen, FileText, GraduationCap, Star, Trophy } from 'lucide-react';

type CertificateRow = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  status: string;
  description: string;
  image?: string | null;
  icon?: string | null;
};

const normalizeCertificate = (value: any): CertificateRow | null => {
  const id = String(value?.id ?? '').trim();
  const title = String(value?.title ?? '').trim();
  const issuer = String(value?.issuer ?? '').trim();
  const date = String(value?.date ?? '').trim();
  const status = String(value?.status ?? '').trim();
  const description = String(value?.description ?? '').trim();
  const image = typeof value?.image === 'string' ? value.image : null;
  const iconRaw = typeof value?.icon === 'string' ? value.icon : '';
  const icon = iconRaw.trim() ? iconRaw.trim() : null;

  if (!id || !title || !issuer || !date || !status || !description) return null;
  return { id, title, issuer, date, status, description, image, icon };
};

const renderCertificateIcon = (icon?: string | null, className?: string) => {
  const defaultClass = className || "h-4 w-4";
  switch (icon) {
    case 'BadgeCheck':
      return <BadgeCheck className={defaultClass} />;
    case 'GraduationCap':
      return <GraduationCap className={defaultClass} />;
    case 'BookOpen':
      return <BookOpen className={defaultClass} />;
    case 'FileText':
      return <FileText className={defaultClass} />;
    case 'Star':
      return <Star className={defaultClass} />;
    case 'Trophy':
      return <Trophy className={defaultClass} />;
    case 'Award':
    default:
      return <Award className={defaultClass} />;
  }
};

export default function CertificatesTab() {
  const [certificates, setCertificates] = useState<CertificateRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCertificates = async () => {
      try {
        const res = await fetch('/api/certificates');
        const data = await res.json();
        const rows = Array.isArray(data?.certificates) ? (data.certificates as any[]) : null;
        const normalized = (rows ?? [])
          .map(normalizeCertificate)
          .filter((row): row is CertificateRow => Boolean(row));

        if (!cancelled) {
          setCertificates(normalized);
        }
      } catch (err) {
        console.error('Failed to fetch certificates:', err);
        if (!cancelled) {
          setCertificates([]);
        }
      }
    };

    fetchCertificates();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="js-reveal text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Certificates</p>
        <h2 className="js-reveal text-2xl font-sans font-semibold text-[var(--home-ink)] sm:text-3xl">
          Personal Certificate
        </h2>
        <p className="js-reveal max-w-4xl text-sm sm:text-base md:text-lg leading-relaxed text-[var(--home-muted)]">
          Formal learning that supports my daily build process.
        </p>
      </div>

      <div className="space-y-4">
        {certificates === null ? (
          <div className="js-reveal text-sm text-[var(--home-muted)]">Loading...</div>
        ) : certificates.length === 0 ? (
          <div className="js-reveal text-sm text-[var(--home-muted)]">No data available</div>
        ) : (
          certificates.map((cert) => {
            return (
              <div
                key={cert.id}
                className="js-reveal group relative flex flex-col sm:flex-row gap-5 overflow-hidden rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)]/30 backdrop-blur-sm p-6 transition-all duration-300 hover:border-[var(--home-border)] hover:bg-[var(--home-card)]/80">

                {renderCertificateIcon(
                  cert.icon,
                  "shrink-0 h-10 w-10 text-[var(--home-muted)] group-hover:text-[var(--home-accent)] transition-colors duration-300 mt-1"
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-sans font-bold text-[var(--home-ink)] leading-tight">{cert.title}</h3>
                    <span className="shrink-0 rounded-full bg-[var(--home-soft)] border border-[var(--home-border)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--home-muted)] group-hover:text-[var(--home-ink)] transition-colors duration-300">
                      {cert.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-[var(--home-accent)]">{cert.issuer}</span>
                    <span className="text-[var(--home-muted)] opacity-50">•</span>
                    <span className="text-[var(--home-muted)]">{cert.date}</span>
                  </div>

                  {cert.description && (
                    <p className="mt-3 text-sm leading-relaxed text-[var(--home-muted)]">
                      {cert.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
