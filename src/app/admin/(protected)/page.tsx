import Image from 'next/image';
import Link from 'next/link';
import {
  Award,
  Briefcase,
  Camera,
  FileText,
  ImageIcon,
  LayoutGrid,
  Languages,
  Quote,
} from 'lucide-react';
import { requireAdmin } from '@/lib/supabase/admin';
import AdminAnalytics from '@/components/analytics/AdminAnalytics';
import AdminToast from '@/components/admin/AdminToast';
import AdminDashboardSummaryChart from '@/components/analytics/AdminDashboardSummaryChart';
import AdminSubmitButton from '@/components/admin/AdminSubmitButton';
import { updateProfilePicture } from './actions';

interface BlogSummary {
  id: string;
  title: string;
  slug: string;
  date: string;
  updated_at?: string | null;
  is_published: boolean | null;
  featured: boolean;
}

const profileImageFallback = '/image/profile.png';

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
    { data: siteProfileData },
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
    supabase.from('site_profile').select('profile_image_url').eq('id', 'default').maybeSingle(),
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
  const profileImageUrl =
    typeof siteProfileData?.profile_image_url === 'string' && siteProfileData.profile_image_url.trim()
      ? siteProfileData.profile_image_url.trim()
      : profileImageFallback;

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

  const quickActions = [
    {
      href: '/admin/blogs',
      eyebrow: 'Manage',
      title: 'Blogs',
      body: 'Create, edit, and publish stories.',
      icon: FileText,
    },
    {
      href: '/admin/quotes',
      eyebrow: 'Manage',
      title: 'Quotes',
      body: 'Curate daily inspiration snippets.',
      icon: Quote,
    },
    {
      href: '/admin/experiences',
      eyebrow: 'Manage',
      title: 'Experiences',
      body: 'Update timelines and roles.',
      icon: Briefcase,
    },
    {
      href: '/admin/projects',
      eyebrow: 'Manage',
      title: 'Projects',
      body: 'Showcase portfolio work.',
      icon: LayoutGrid,
    },
    {
      href: '/admin/certificates',
      eyebrow: 'Manage',
      title: 'Certificates',
      body: 'Track achievements and proof.',
      icon: Award,
    },
    {
      href: '/admin/languages',
      eyebrow: 'Manage',
      title: 'Languages',
      body: 'Set spoken language levels.',
      icon: Languages,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="admin-panel admin-panel-accent p-5 sm:p-7" data-gsap="reveal">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[var(--admin-accent)]">
              Dashboard
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Portfolio Snapshot
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/58 sm:text-base">
              Monitor content, drafts, and profile assets from one clean workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/admin/blogs" className="admin-button">
              <FileText className="h-4 w-4" />
              Blogs
            </Link>
            <Link href="/admin/quotes" className="admin-button">
              <Quote className="h-4 w-4" />
              Quotes
            </Link>
            <Link href="/admin/projects" className="admin-button-primary">
              <LayoutGrid className="h-4 w-4" />
              Projects
            </Link>
          </div>
        </div>

        {toast && <div className="mt-6">{<AdminToast message={toast.message} tone={toast.tone} />}</div>}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]" data-gsap="reveal">
        <div className="admin-panel overflow-hidden">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4">
            {contentMetrics.map((metric) => (
              <div key={metric.label} className="admin-stat-card p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
                  {metric.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
                <p className="mt-2 text-xs text-white/42">{metric.meta}</p>
              </div>
            ))}
          </div>
        </div>

        <form action={updateProfilePicture} className="admin-panel p-5">
          <input type="hidden" name="redirect_to" value="/admin" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/42">
                Profile
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">Main photo</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/52">
                Used by the homepage hero and navbar avatar.
              </p>
            </div>
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[var(--admin-border-strong)] bg-[#111111]">
              <Image src={profileImageUrl} alt="Current profile picture" fill sizes="64px" className="object-cover" />
            </div>
          </div>
          <label className="admin-file-label mt-5 flex items-center gap-3">
            <ImageIcon className="h-4 w-4 text-white/60" />
            <input
              name="image_file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="admin-file-input"
            />
          </label>
          <AdminSubmitButton pendingText="Uploading..." className="admin-button-primary mt-4 w-full justify-center">
            <Camera className="h-4 w-4" />
            Update photo
          </AdminSubmitButton>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-3" data-gsap="reveal">
        <div className="admin-panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/42">Summary</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Content distribution</h3>
              <p className="mt-2 text-sm text-white/52">Quick view of totals across sections.</p>
            </div>
            <div className="admin-muted-pill">Counts</div>
          </div>
          <div className="mt-5 h-56">
            <AdminDashboardSummaryChart metrics={chartMetrics} />
          </div>
        </div>

        <div className="admin-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/42">Notes</p>
          <h3 className="mt-2 text-lg font-semibold text-white">At a glance</h3>
          <div className="mt-4 space-y-3 text-sm text-white/62">
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/42">
              Actions
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">Quick actions</h3>
          </div>
          <p className="text-sm text-white/52">Jump to content updates</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="admin-link-card group p-5">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/42">{item.eyebrow}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-white/52">{item.body}</p>
                  </div>
                  <div className="admin-icon-box">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2" data-gsap="reveal">
        <div className="admin-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/42">Queue</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Drafts to review</h3>
            </div>
            <Link href="/admin/blogs" className="admin-text-link">
              Open
            </Link>
          </div>
          {recentDrafts.length === 0 ? (
            <p className="mt-4 text-sm text-white/52">No drafts right now.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentDrafts.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/admin/blogs?edit=${encodeURIComponent(blog.id)}`}
                  className="admin-row-link block px-4 py-3"
                >
                  <p className="text-xs text-white/42">/{blog.slug}</p>
                  <p className="mt-2 line-clamp-1 text-sm font-semibold text-white">{blog.title}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="admin-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/42">Recent</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Latest stories</h3>
            </div>
            <Link href="/admin/blogs" className="admin-text-link">
              Manage
            </Link>
          </div>
          {recentBlogs.length === 0 ? (
            <p className="mt-4 text-sm text-white/52">No stories yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${encodeURIComponent(blog.slug)}`}
                  className="admin-row-link flex items-start justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-white/42">{blog.is_published === false ? 'Draft' : 'Published'}</p>
                    <p className="mt-1 line-clamp-1 text-sm font-semibold text-white">{blog.title}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-white/42">/{blog.slug}</span>
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
