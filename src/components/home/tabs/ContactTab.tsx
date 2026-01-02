'use client';

import React from 'react';
import { Mail, MapPin } from 'lucide-react';

import type { ContactInfo } from '../types';

const CONTACT_INFO: ContactInfo[] = [
  {
    type: 'Discord Account',
    value: 'Phy0n',
    icon: <Mail className="w-4 h-4" />,
    color: 'from-red-500/20 to-pink-500/20',
  },
  {
    type: 'Location',
    value: 'Surabaya, Indonesia',
    icon: <MapPin className="w-4 h-4" />,
    color: 'from-blue-500/20 to-cyan-500/20',
  },
];

export default function ContactTab() {
  return (
    <div className="animate-slide-down">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 font-mono">
        <span className="text-white/40">~/</span>contact.json
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6 font-mono">
        {CONTACT_INFO.map((contact, index) => (
          <a
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden bg-white/[0.02]"
          >
            <div className="absolute inset-0 bg-black/10 transition-all duration-300 z-0"></div>
            <div className="relative flex items-center gap-3 sm:gap-4 z-10">
              <div className="p-2 sm:p-2.5 bg-white/[0.05] rounded-lg border border-white/10 group-hover:bg-white/[0.08] transition-colors duration-300">
                {contact.icon}
              </div>
              <div>
                <p className="text-white/60 text-xs sm:text-sm font-mono">{contact.type}</p>
                <h3 className="text-white text-sm sm:text-base font-medium">{contact.value}</h3>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

