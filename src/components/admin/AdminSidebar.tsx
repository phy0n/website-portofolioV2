'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, BarChart3, FileText, LogOut, Quote, X } from 'lucide-react';
import AdminSubmitButton from './AdminSubmitButton';

type AdminAction = (formData?: FormData) => void | Promise<void>;

const navItems = [
  { href: '/admin', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/quotes', label: 'Quotes', icon: Quote },
];

export default function AdminSidebar({
  email,
  signOutAction,
  onClose,
}: {
  email: string;
  signOutAction: AdminAction;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="h-full w-full border-r border-white/10 bg-black/60 backdrop-blur-2xl px-6 py-8 flex flex-col gap-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Admin</p>
          <h1 className="text-lg font-semibold text-white">Phion Console</h1>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <nav className="flex flex-col gap-2 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                isActive
                  ? 'border-white/30 bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                  : 'border-transparent text-white/70 hover:border-white/15 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-4 text-sm text-white/60">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Signed in</p>
          <p className="mt-2 text-sm text-white/80">{email}</p>
        </div>
        <div className="grid gap-2">
          <Link
            href="/blog"
            onClick={() => onClose?.()}
            className="group flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-white/10 to-white/5 px-3 py-2.5 text-sm text-white/80 transition hover:border-white/30 hover:from-white/20 hover:to-white/10 hover:text-white"
          >
            <span>View blog</span>
            <ArrowUpRight className="h-4 w-4 text-white/60 transition group-hover:text-white" />
          </Link>
          <form action={signOutAction}>
            <AdminSubmitButton
              pendingText="Signing out..."
              className="group inline-flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 group-hover:text-white/50">
                Secure
              </span>
            </AdminSubmitButton>
          </form>
        </div>
      </div>
    </aside>
  );
}
