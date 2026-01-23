import { requireAdmin } from '@/lib/supabase/admin';
import AdminAnalytics from '@/components/analytics/AdminAnalytics';

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

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4" data-gsap="reveal">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Analytics</p>
          <h2 className="text-3xl font-semibold text-white">Performance Snapshot</h2>
        </div>
        <p className="text-sm text-white/50">Blog and quote metrics</p>
      </div>

      {(successMessage || errorMessage) && (
        <div
          className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          data-gsap="reveal"
        >
          {errorMessage || successMessage}
        </div>
      )}

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

      <AdminAnalytics initialRange={searchParams?.range} />
    </div>
  );
}
