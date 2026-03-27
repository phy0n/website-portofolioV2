import Link from 'next/link';
import { Award, Briefcase, FileText, LayoutGrid, Languages, Quote } from 'lucide-react';
import { requireAdmin } from '@/lib/supabase/admin';
import AdminAnalytics from '@/components/analytics/AdminAnalytics';
import AdminToast from '@/components/admin/AdminToast';
import AdminDashboardSummaryChart from '@/components/analytics/AdminDashboardSummaryChart';

interface BlogSummary {
  id: string;
  title: string;
  slug: string;
  date: string;
  updated_at?: string | null;
  is_published: boolean | null;
  featured: boolean;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string; range?: string };
}) {
  const { supabase } = await requireAdmin();
  const safeDecode = (value?: string) => {
    if (!value) return '';
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const toCount = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

  const [
    { data: recentBlogsData },
    { data: recentDraftsData },
    blogsTotalRes,
    blogsDraftRes,
    blogsFeaturedRes,
    quotesTotalRes,
    experiencesTotalRes,
    experiencesDraftRes,
    projectsTotalRes,
    projectsDraftRes,
    certificatesTotalRes,
    certificatesDraftRes,
    languagesTotalRes,
    languagesDraftRes,
  ] = await Promise.all([
    supabase
      .from('blogs')
      .select('id, title, slug, date, updated_at, is_published, featured')
      .order('date', { ascending: false })
      .limit(5),
    supabase
      .from('blogs')
      .select('id, title, slug, date, updated_at, is_published, featured')
      .eq('is_published', false)
      .order('updated_at', { ascending: false, nullsFirst: false })
      .order('date', { ascending: false })
      .limit(5),
    supabase.from('blogs').select('id', { count: 'exact', head: true }),
    supabase.from('blogs').select('id', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('blogs').select('id', { count: 'exact', head: true }).eq('featured', true),
    supabase.from('quotes').select('id', { count: 'exact', head: true }),
    supabase.from('experiences').select('id', { count: 'exact', head: true }),
    supabase.from('experiences').select('id', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('certificates').select('id', { count: 'exact', head: true }),
    supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('languages').select('id', { count: 'exact', head: true }),
    supabase.from('languages').select('id', { count: 'exact', head: true }).eq('is_published', false),
  ]);

  const totalBlogs = !blogsTotalRes.error ? toCount(blogsTotalRes.count) : 0;
  const draftBlogs = !blogsDraftRes.error ? toCount(blogsDraftRes.count) : 0;
  const featuredBlogs = !blogsFeaturedRes.error ? toCount(blogsFeaturedRes.count) : 0;
  const publishedBlogs = Math.max(0, totalBlogs - draftBlogs);
  const totalQuotes = !quotesTotalRes.error ? toCount(quotesTotalRes.count) : 0;

  const totalExperiences = !experiencesTotalRes.error ? toCount(experiencesTotalRes.count) : 0;
  const draftExperiences = !experiencesDraftRes.error ? toCount(experiencesDraftRes.count) : 0;
  const publishedExperiences = Math.max(0, totalExperiences - draftExperiences);

  const totalProjects = !projectsTotalRes.error ? toCount(projectsTotalRes.count) : 0;
  const draftProjects = !projectsDraftRes.error ? toCount(projectsDraftRes.count) : 0;
  const publishedProjects = Math.max(0, totalProjects - draftProjects);

  const totalCertificates = !certificatesTotalRes.error ? toCount(certificatesTotalRes.count) : 0;
  const draftCertificates = !certificatesDraftRes.error ? toCount(certificatesDraftRes.count) : 0;
  const publishedCertificates = Math.max(0, totalCertificates - draftCertificates);

  const totalLanguages = !languagesTotalRes.error ? toCount(languagesTotalRes.count) : 0;
  const draftLanguages = !languagesDraftRes.error ? toCount(languagesDraftRes.count) : 0;
  const publishedLanguages = Math.max(0, totalLanguages - draftLanguages);

  const recentBlogs = (recentBlogsData as BlogSummary[] | null) ?? [];
  const recentDrafts = (recentDraftsData as BlogSummary[] | null) ?? [];

  const successMessage = safeDecode(searchParams?.success);
  const errorMessage = safeDecode(searchParams?.error);
  const toast = errorMessage
    ? { message: errorMessage, tone: 'error' as const }
    : successMessage
      ? { message: successMessage, tone: 'success' as const }
      : null;

  const contentMetrics = [
    { label: 'Blogs', value: totalBlogs, meta: `${publishedBlogs} published` },
    { label: 'Drafts', value: draftBlogs, meta: 'Hidden from portfolio' },
    { label: 'Featured', value: featuredBlogs, meta: 'Pinned on home' },
    { label: 'Quotes', value: totalQuotes, meta: 'Short highlights' },
    { label: 'Projects', value: totalProjects, meta: `${publishedProjects} published` },
    { label: 'Certificates', value: totalCertificates, meta: `${publishedCertificates} published` },
    { label: 'Experiences', value: totalExperiences, meta: `${publishedExperiences} published` },
    { label: 'Languages', value: totalLanguages, meta: `${publishedLanguages} published` },
  ];

  const chartMetrics = [
    { label: 'Blogs', value: totalBlogs },
    { label: 'Drafts', value: draftBlogs },
    { label: 'Quotes', value: totalQuotes },
    { label: 'Projects', value: totalProjects },
    { label: 'Experiences', value: totalExperiences },
    { label: 'Certificates', value: totalCertificates },
    { label: 'Languages', value: totalLanguages },
  ];

  return (
    <div className="space-y-10">
      <section
        className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_44%),linear-gradient(135deg,rgba(24,24,27,0.48),rgba(9,9,11,0.96))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8"
        data-gsap="reveal"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200/80">Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Portfolio Snapshot
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
              Monitor content status and audience metrics without extra layers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/blogs"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <FileText className="h-4 w-4" />
              Blogs
            </Link>
            <Link
              href="/admin/quotes"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <Quote className="h-4 w-4" />
              Quotes
            </Link>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <LayoutGrid className="h-4 w-4" />
              Projects
            </Link>
          </div>
        </div>

        {toast && <div className="mt-6">{<AdminToast message={toast.message} tone={toast.tone} />}</div>}
      </section>

      <section className="rounded-3xl border border-white/10 bg-zinc-950/60 shadow-[0_20px_60px_rgba(0,0,0,0.35)]" data-gsap="reveal">
        <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
          {contentMetrics.map((metric) => (
            <div
              key={metric.label}
              className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r sm:last:border-r-0 xl:border-b xl:border-r xl:last:border-r-0"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
              <p className="mt-2 text-xs text-white/40">{metric.meta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3" data-gsap="reveal">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Summary</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Content distribution</h3>
              <p className="mt-2 text-sm text-white/50">Quick view of totals across sections.</p>
            </div>
            <div className="text-xs text-white/40">Counts</div>
          </div>
          <div className="mt-5 h-56">
            <AdminDashboardSummaryChart metrics={chartMetrics} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Notes</p>
          <h3 className="mt-2 text-lg font-semibold text-white">At a glance</h3>
          <div className="mt-4 space-y-3 text-sm text-white/60">
            <p>
              Draft blogs: <span className="font-semibold text-white">{draftBlogs}</span>
            </p>
            <p>
              Featured blogs: <span className="font-semibold text-white">{featuredBlogs}</span>
            </p>
            <p>
              Draft projects: <span className="font-semibold text-white">{draftProjects}</span>
            </p>
            <p>
              Draft certificates: <span className="font-semibold text-white">{draftCertificates}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4" data-gsap="reveal">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">Quick actions</h3>
          <p className="text-sm text-white/50">Jump to content updates</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          <Link
            href="/admin/experiences"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:border-white/30 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Manage</p>
                <p className="mt-2 text-lg font-semibold text-white">Experiences</p>
                <p className="mt-2 text-sm text-white/50">Update timelines and roles.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition group-hover:border-white/40 group-hover:text-white">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </Link>
          <Link
            href="/admin/projects"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:border-white/30 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Manage</p>
                <p className="mt-2 text-lg font-semibold text-white">Projects</p>
                <p className="mt-2 text-sm text-white/50">Showcase portfolio work.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition group-hover:border-white/40 group-hover:text-white">
                <LayoutGrid className="h-5 w-5" />
              </div>
            </div>
          </Link>
          <Link
            href="/admin/certificates"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:border-white/30 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Manage</p>
                <p className="mt-2 text-lg font-semibold text-white">Certificates</p>
                <p className="mt-2 text-sm text-white/50">Track achievements and proof.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition group-hover:border-white/40 group-hover:text-white">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </Link>
          <Link
            href="/admin/languages"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:border-white/30 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Manage</p>
                <p className="mt-2 text-lg font-semibold text-white">Languages</p>
                <p className="mt-2 text-sm text-white/50">Set spoken language levels.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition group-hover:border-white/40 group-hover:text-white">
                <Languages className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2" data-gsap="reveal">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Queue</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Drafts to review</h3>
            </div>
            <Link
              href="/admin/blogs"
              className="text-xs text-white/50 hover:text-white transition"
            >
              Open
            </Link>
          </div>
          {recentDrafts.length === 0 ? (
            <p className="mt-4 text-sm text-white/50">No drafts right now.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentDrafts.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/admin/blogs?edit=${encodeURIComponent(blog.id)}`}
                  className="group block rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/30 hover:bg-white/10"
                >
                  <p className="text-xs text-white/40">/{blog.slug}</p>
                  <p className="mt-2 text-sm font-semibold text-white line-clamp-1">
                    {blog.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Recent</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Latest stories</h3>
            </div>
            <Link
              href="/admin/blogs"
              className="text-xs text-white/50 hover:text-white transition"
            >
              Manage
            </Link>
          </div>
          {recentBlogs.length === 0 ? (
            <p className="mt-4 text-sm text-white/50">No stories yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${encodeURIComponent(blog.slug)}`}
                  className="group flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/30 hover:bg-white/10"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-white/40">{blog.is_published === false ? 'Draft' : 'Published'}</p>
                    <p className="mt-1 text-sm font-semibold text-white line-clamp-1">
                      {blog.title}
                    </p>
                  </div>
                  <span className="text-xs text-white/40 whitespace-nowrap">/{blog.slug}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <AdminAnalytics initialRange={searchParams?.range} />
    </div>
  );
}
