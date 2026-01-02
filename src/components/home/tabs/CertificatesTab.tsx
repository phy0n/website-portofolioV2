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
    image: '/image/certificates/certificate1.png',
    icon: <Award className="w-4 h-4" />,
  },
];

export default function CertificatesTab() {
  return (
    <div className="animate-slide-down">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
        <span className="text-white/40">~/</span>certificates/
      </h2>
      <div className="grid gap-4 sm:gap-6">
        {CERTIFICATES.map((cert, index) => (
          <div
            key={index}
            className="bg-white/[0.02] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-white font-mono">{cert.title}</h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60 font-mono mt-1 mb-2">
                  <span>{cert.issuer}</span>
                  <span className="text-white/40">•</span>
                  <span>{cert.date}</span>
                  <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">
                    {cert.status}
                  </span>
                </div>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-mono">{cert.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

