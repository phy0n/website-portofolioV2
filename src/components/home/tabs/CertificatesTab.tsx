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

const renderCertificateIcon = (icon?: string | null) => {
  switch (icon) {
    case 'BadgeCheck':
      return <BadgeCheck className="h-4 w-4" />;
    case 'GraduationCap':
      return <GraduationCap className="h-4 w-4" />;
    case 'BookOpen':
      return <BookOpen className="h-4 w-4" />;
    case 'FileText':
      return <FileText className="h-4 w-4" />;
    case 'Star':
      return <Star className="h-4 w-4" />;
    case 'Trophy':
      return <Trophy className="h-4 w-4" />;
    case 'Award':
    default:
      return <Award className="h-4 w-4" />;
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
          Personal Ceritificate
        </h2>
        <p className="js-reveal max-w-2xl text-sm text-[var(--home-muted)]">
          Formal learning that supports my daily build process.
        </p>
      </div>

      <div className="space-y-6">
        {certificates === null ? (
          <div className="js-reveal text-sm text-[var(--home-muted)]">Loading...</div>
        ) : certificates.length === 0 ? (
          <div className="js-reveal text-sm text-[var(--home-muted)]">No data available</div>
        ) : (
          certificates.map((cert, index) => {
            const number = String(index + 1).padStart(2, '0');
            return (
              <div
                key={cert.id}
                className="js-reveal grid gap-x-4 gap-y-3 border-b border-[var(--home-border)] py-6 md:grid-cols-[auto_1fr]">
                <div className="md:hidden pt-1 text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">
                  {number}
                </div>

                <div className="md:col-start-2 md:row-start-1 flex items-center gap-2 text-[var(--home-accent)]">
                  {renderCertificateIcon(cert.icon)}
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">Certificate</p>
                </div>

                <div className="hidden md:block md:col-start-1 md:row-start-2 pt-1 text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">
                  {number}
                </div>
                <h3 className="md:col-start-2 md:row-start-2 text-lg font-sans font-semibold text-[var(--home-ink)]">
                  {cert.title}
                </h3>

                <p className="md:col-start-2 md:row-start-3 text-xs uppercase tracking-[0.35em] text-[var(--home-muted)]">
                  {cert.issuer} | {cert.date}
                </p>
                <p className="md:col-start-2 md:row-start-4 text-sm text-[var(--home-muted)]">{cert.description}</p>
                <div className="md:col-start-2 md:row-start-5">
                  <span className="inline-flex rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-1 text-xs text-[var(--home-muted)]">
                    {cert.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
