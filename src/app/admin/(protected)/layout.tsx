import Link from 'next/link';
import { ArrowUpRight, BarChart3, FileText, LogOut, Quote } from 'lucide-react';
import { requireAdmin } from '@/lib/supabase/admin';
import { signOut } from './actions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f16] to-[#151525] text-white">
      <aside className="fixed left-0 top-0 h-screen w-72 border-r border-white/10 bg-black/60 backdrop-blur-2xl px-6 py-8 flex flex-col gap-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col items-start gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Admin</p>
            <h1 className="text-lg font-semibold text-white">Phion Console</h1>
          </div>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-white/70 transition hover:border-white/15 hover:bg-white/5 hover:text-white"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
          <Link
            href="/admin/blogs"
            className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-white/70 transition hover:border-white/15 hover:bg-white/5 hover:text-white"
          >
            <FileText className="h-4 w-4" />
            Blogs
          </Link>
          <Link
            href="/admin/quotes"
            className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-white/70 transition hover:border-white/15 hover:bg-white/5 hover:text-white"
          >
            <Quote className="h-4 w-4" />
            Quotes
          </Link>
        </nav>
        <div className="mt-auto space-y-4 text-sm text-white/60">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
              Signed in
            </p>
            <p className="mt-2 text-sm text-white/80">{user.email}</p>
          </div>
          <div className="grid gap-2">
            <Link
              href="/blog"
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-white/10 to-white/5 px-3 py-2.5 text-sm text-white/80 transition hover:border-white/30 hover:from-white/20 hover:to-white/10 hover:text-white"
            >
              <span>View blog</span>
              <ArrowUpRight className="h-4 w-4 text-white/60 transition group-hover:text-white" />
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="group inline-flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <span className="inline-flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 group-hover:text-white/50">
                  Secure
                </span>
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-h-screen pl-80 pr-6 py-10 lg:pr-12">
        {children}
      </main>
    </div>
  );
}
