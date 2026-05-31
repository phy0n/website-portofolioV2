'use client';

import React from 'react';

import type { HomeTab } from './types';

const TABS: HomeTab[] = ['connect', 'about', 'games', 'skills', 'experience', 'projects', 'certificates', 'contact'];

interface TabBarProps {
  activeTab: HomeTab;
  onChange: (tab: HomeTab) => void;
}

export default function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div
      className="flex border-b border-[var(--home-border)] mb-4 sm:mb-6 md:mb-8 overflow-x-auto hide-scrollbar animate-stagger"
      style={{ animationDelay: '100ms' }}>
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-mono font-medium relative transition-all duration-300 whitespace-nowrap cursor-pointer ${
            activeTab === tab ? 'text-[var(--home-ink)]' : 'text-[var(--home-muted)] hover:text-[var(--home-ink)]'
          }`}>
          <span className="text-[var(--home-muted)]">{activeTab === tab ? '>' : ''}</span>
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white/60 to-white/30 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  );
}

