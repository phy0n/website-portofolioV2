import React from 'react';
import { User } from 'lucide-react';

const FACTS = [
  { label: 'Name', value: 'Phion Rushandle' },
  { label: 'Pronouns', value: 'He/Him' },
  { label: 'Age', value: '18 years old' },
  { label: 'Role', value: 'Developer' },
  { label: 'Focus', value: 'Consistency' },
  { label: 'Passion', value: 'Make good things' },
  { label: 'Status', value: 'Learning' },
];

export default function ProfileFactsCard({ className }: { className?: string }) {
  return (
    <div className={['rounded-2xl border border-white/10 bg-black/30', className].filter(Boolean).join(' ')}>
      <div className="js-reveal flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <User className="h-4 w-4 text-[var(--home-accent)]" />
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--home-muted)]">Profile</p>
      </div>
      <div className="divide-y divide-white/10">
        {FACTS.map((fact) => (
          <div
            key={fact.label}
            className="js-reveal flex flex-col gap-1 px-5 py-4 text-sm text-[var(--home-muted)] sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-[11px] uppercase tracking-[0.35em]">{fact.label}</span>
            <span className="text-[var(--home-ink)]">{fact.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

