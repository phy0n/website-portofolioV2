import Image from 'next/image';
import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/admin';
import AdminToast from '@/components/admin/AdminToast';
import AdminSubmitButton from '@/components/admin/AdminSubmitButton';
import { updateProfilePicture } from './actions';

interface BlogSummary {
  id: string;
  title: string;
  slug: string;
  date: string;
  is_published: boolean | null;
}

const profileImageFallback = '/image/profile.png';

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  
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
    projectsTotalRes,
    experiencesTotalRes,
  ] = await Promise.all([
    supabase.from('blogs').select('id, title, slug, date, is_published').order('date', { ascending: false }).limit(4),
    supabase.from('blogs').select('id, title, slug, date, is_published').eq('is_published', false).order('updated_at', { ascending: false, nullsFirst: false }).limit(4),
    supabase.from('site_profile').select('profile_image_url').eq('id', 'default').maybeSingle(),
    supabase.from('blogs').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('experiences').select('id', { count: 'exact', head: true }),
  ]);

  const totalBlogs = !blogsTotalRes.error ? toCount(blogsTotalRes.count) : 0;
  const totalProjects = !projectsTotalRes.error ? toCount(projectsTotalRes.count) : 0;
  const totalExperiences = !experiencesTotalRes.error ? toCount(experiencesTotalRes.count) : 0;

  const recentBlogs = (recentBlogsData as BlogSummary[] | null) ?? [];
  const recentDrafts = (recentDraftsData as BlogSummary[] | null) ?? [];
  const profileImageUrl = typeof siteProfileData?.profile_image_url === 'string' && siteProfileData.profile_image_url.trim()
      ? siteProfileData.profile_image_url.trim()
      : profileImageFallback;

  const successMessage = safeDecode(params?.success);
  const errorMessage = safeDecode(params?.error);
  const toast = errorMessage ? { message: errorMessage, tone: 'error' as const } : successMessage ? { message: successMessage, tone: 'success' as const } : null;

  const navLinks = [
    { href: '/admin/blogs', label: 'Blogs' },
    { href: '/admin/projects', label: 'Projects' },
    { href: '/admin/experiences', label: 'Experiences' },
    { href: '/admin/education', label: 'Education' },
    { href: '/admin/certificates', label: 'Certificates' },
    { href: '/admin/languages', label: 'Languages' },
    { href: '/admin/quotes', label: 'Quotes' },
  ];

  return (
    <div className="w-full space-y-16 pb-20 font-manrope">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col-reverse md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">
            Workspace
          </h1>
          <p className="text-sm font-geist-mono text-white/40 uppercase tracking-[0.2em]">
            Admin Control Center
          </p>
        </div>

        <form action={updateProfilePicture} className="flex items-center gap-4">
          <input type="hidden" name="redirect_to" value="/admin" />
          <div className="flex flex-col items-end gap-2">
            <label className="text-[10px] font-geist-mono uppercase tracking-widest text-white/40 hover:text-white/80 cursor-pointer transition-colors">
              Select Photo
              <input name="image_file" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" />
            </label>
            <AdminSubmitButton pendingText="Saving..." className="text-[10px] font-geist-mono uppercase tracking-widest text-[var(--admin-accent)] bg-transparent border-none p-0 h-auto hover:text-white transition-colors">
              Save
            </AdminSubmitButton>
          </div>
          <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/20">
            <Image src={profileImageUrl} alt="Profile" fill sizes="56px" className="object-cover" />
          </div>
        </form>
      </header>

      {toast && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <AdminToast message={toast.message} tone={toast.tone} />
        </div>
      )}

      {/* METRICS STRIP */}
      <section className="flex flex-wrap items-center gap-12 md:gap-24">
        {[
          { label: 'Articles', value: totalBlogs },
          { label: 'Projects', value: totalProjects },
          { label: 'Timeline', value: totalExperiences },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2">
            <span className="text-5xl font-light text-white">{stat.value}</span>
            <span className="text-[10px] font-geist-mono uppercase tracking-widest text-white/40">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* NAVIGATION PILLS */}
      <section className="space-y-6">
        <h2 className="text-[11px] font-geist-mono uppercase tracking-[0.25em] text-white/30">Modules</h2>
        <div className="flex flex-wrap gap-3">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="px-6 py-2.5 rounded-full border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300 font-light"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* RECENT LISTS */}
      <section className="grid md:grid-cols-2 gap-16 pt-8">
        
        {/* LATEST */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-[11px] font-geist-mono uppercase tracking-[0.25em] text-white/30">Latest Published</h2>
            <Link href="/admin/blogs" className="text-[11px] font-geist-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors">View All</Link>
          </div>
          <div className="space-y-4">
            {recentBlogs.length === 0 ? (
              <p className="text-sm font-light text-white/40">No entries yet.</p>
            ) : (
              recentBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block">
                  <p className="text-base font-light text-white/80 group-hover:text-white transition-colors line-clamp-1">{blog.title}</p>
                  <p className="text-xs font-geist-mono text-white/30 mt-1">/{blog.slug}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* DRAFTS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-[11px] font-geist-mono uppercase tracking-[0.25em] text-white/30">Draft Queue</h2>
          </div>
          <div className="space-y-4">
            {recentDrafts.length === 0 ? (
              <p className="text-sm font-light text-white/40">Queue is empty.</p>
            ) : (
              recentDrafts.map((blog) => (
                <Link key={blog.id} href={`/admin/blogs?edit=${blog.id}`} className="group block">
                  <p className="text-base font-light text-[var(--admin-accent)] group-hover:text-white transition-colors line-clamp-1">{blog.title}</p>
                  <p className="text-xs font-geist-mono text-white/30 mt-1">Needs review</p>
                </Link>
              ))
            )}
          </div>
        </div>

      </section>

    </div>
  );
}
