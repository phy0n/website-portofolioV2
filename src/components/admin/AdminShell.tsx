'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

type AdminAction = (formData?: FormData) => void | Promise<void>;

export default function AdminShell({
  email,
  signOutAction,
  children,
}: {
  email: string;
  signOutAction: AdminAction;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f16] to-[#151525] text-white">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AdminSidebar
          email={email}
          signOutAction={signOutAction}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div
        className={`fixed inset-0 z-40 cursor-pointer bg-black/70 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <main
        data-page-content
        className="min-h-screen px-4 sm:px-6 lg:pl-80 lg:pr-12 py-10"
      >
        <div className="lg:hidden mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
            aria-label="Open admin navigation"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
          <Link
            href="/"
            className="text-xs text-white/50 hover:text-white transition"
          >
            Back to site
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
