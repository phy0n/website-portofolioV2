import Link from 'next/link';
import { Award, Briefcase, FileText, LayoutGrid, Languages, Quote } from 'lucide-react';
import { requireAdmin } from '@/lib/supabase/admin';
import AdminAnalytics from '@/components/analytics/AdminAnalytics';
import AdminToast from '@/components/admin/AdminToast';

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

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4" data-gsap="reveal">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Dashboard</p>
          <h2 className="text-3xl font-semibold text-white">Portfolio Snapshot</h2>
        </div>
        <p className="text-sm text-white/50">Content + audience metrics</p>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section id="dashboard" className="space-y-5" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Content overview</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { label: 'Blogs', value: totalBlogs },
            { label: 'Blog drafts', value: draftBlogs },
            { label: 'Blog featured', value: featuredBlogs },
            { label: 'Quotes', value: totalQuotes },
            { label: 'Projects', value: totalProjects },
            { label: 'Certificates', value: totalCertificates },
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
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Experiences', value: totalExperiences, meta: `${publishedExperiences} published` },
            { label: 'Projects', value: totalProjects, meta: `${publishedProjects} published` },
            { label: 'Certificates', value: totalCertificates, meta: `${publishedCertificates} published` },
            { label: 'Languages', value: totalLanguages, meta: `${publishedLanguages} published` },
            { label: 'Draft projects', value: draftProjects, meta: 'Hidden from portfolio' },
            { label: 'Draft certificates', value: draftCertificates, meta: 'Hidden from portfolio' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
              <p className="mt-2 text-xs text-white/40">{metric.meta}</p>
            </div>
          ))}
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
