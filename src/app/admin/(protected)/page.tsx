import Link from 'next/link';
import { FileText, Quote } from 'lucide-react';
import { requireAdmin } from '@/lib/supabase/admin';
import AdminAnalytics from '@/components/analytics/AdminAnalytics';
import AdminToast from '@/components/admin/AdminToast';

interface BlogSummary {
  id: string;
  is_published: boolean | null;
  featured: boolean;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string; range?: string };
}) {
  const { supabase } = await requireAdmin();

  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, is_published, featured');

  const { data: quotes } = await supabase.from('quotes').select('id');

  const blogRows = (blogs as BlogSummary[] | null) ?? [];
  const quoteRows = (quotes as { id: string }[] | null) ?? [];
  const publishedCount = blogRows.filter((blog) => blog.is_published !== false).length;
  const draftCount = blogRows.length - publishedCount;
  const featuredCount = blogRows.filter((blog) => blog.featured).length;

  const successMessage = searchParams?.success
    ? decodeURIComponent(searchParams.success)
    : '';
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : '';
  const toast = errorMessage
    ? { message: errorMessage, tone: 'error' as const }
    : successMessage
      ? { message: successMessage, tone: 'success' as const }
      : null;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4" data-gsap="reveal">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Analytics</p>
          <h2 className="text-3xl font-semibold text-white">Performance Snapshot</h2>
        </div>
        <p className="text-sm text-white/50">Blog and quote metrics</p>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section id="dashboard" className="space-y-5" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Dashboard</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'Total blogs', value: blogRows.length },
            { label: 'Published', value: publishedCount },
            { label: 'Drafts', value: draftCount },
            { label: 'Quotes', value: quoteRows.length },
            { label: 'Featured', value: featuredCount },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <p className="text-sm text-white/50">{metric.label}</p>
              <p className="text-3xl font-semibold text-white">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4" data-gsap="reveal">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">Quick actions</h3>
          <p className="text-sm text-white/50">Jump to content updates</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/blogs"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:border-white/30 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Manage
                </p>
                <p className="mt-2 text-lg font-semibold text-white">Blogs</p>
                <p className="mt-2 text-sm text-white/50">
                  Create, edit, and publish stories.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition group-hover:border-white/40 group-hover:text-white">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </Link>
          <Link
            href="/admin/quotes"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:border-white/30 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Manage
                </p>
                <p className="mt-2 text-lg font-semibold text-white">Quotes</p>
                <p className="mt-2 text-sm text-white/50">
                  Curate daily inspiration snippets.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition group-hover:border-white/40 group-hover:text-white">
                <Quote className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <AdminAnalytics initialRange={searchParams?.range} />
    </div>
  );
}
