'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Award, BarChart3, Briefcase, FileText, LayoutGrid, LogOut, Quote, Languages, X, GraduationCap } from 'lucide-react';
import AdminSubmitButton from './AdminSubmitButton';

type AdminAction = (formData?: FormData) => void | Promise<void>;

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/quotes', label: 'Quotes', icon: Quote },
  { href: '/admin/experiences', label: 'Experiences', icon: Briefcase },
  { href: '/admin/education', label: 'Education', icon: GraduationCap },
  { href: '/admin/projects', label: 'Projects', icon: LayoutGrid },
  { href: '/admin/certificates', label: 'Certificates', icon: Award },
  { href: '/admin/languages', label: 'Languages', icon: Languages },
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
    <aside className="admin-sidebar h-full w-full px-6 py-8 flex flex-col gap-8 border-r border-white/5 bg-transparent">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-geist-mono uppercase tracking-widest text-[var(--admin-accent)]">Admin</p>
          <h1 className="text-xl font-light font-manrope tracking-tight text-white">Phion Console</h1>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="admin-sidebar-icon-button lg:hidden cursor-pointer"
            aria-label="Close navigation">
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
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-light rounded-full transition-all ${isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-4 text-sm text-white/60">
        <div className="border-t border-white/10 pt-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Signed in</p>
          <p className="mt-2 text-sm text-white/80">{email}</p>
        </div>
        <div className="grid gap-2">
          <Link
            href="/portfolio"
            onClick={() => onClose?.()}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-light text-white/50 hover:text-white transition-colors rounded-full group justify-between">
            <span>Back to portfolio</span>
            <ArrowUpRight className="h-4 w-4 text-white/60 transition group-hover:text-white" />
          </Link>
          <form action={signOutAction}>
            <AdminSubmitButton
              pendingText="Signing out..."
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-light text-white/50 hover:text-white transition-colors rounded-full group w-full justify-between">
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
