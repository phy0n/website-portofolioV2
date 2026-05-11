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
    <section className={className}>
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-[var(--accent)]" />
        <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--muted)]">Profile</p>
      </div>
      <div className="mt-3 space-y-3">
        {FACTS.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] uppercase tracking-[0.35em] text-[var(--muted)]">{fact.label}</span>
            <span className="text-[var(--ui-foreground)]">{fact.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

