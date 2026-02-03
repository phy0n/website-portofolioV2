import BlogDetailClient from './BlogDetailClient';
import blogsData from '@/data/blogs.json';
import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  let slug = '';
  try {
    slug = decodeURIComponent(rawSlug || '');
  } catch {
    slug = rawSlug || '';
  }
  slug = slug.trim();

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    const slugLower = slug.toLowerCase();
    const fallbackBlog =
      (blogsData as any[]).find(
        (blog) => String(blog.slug || '').toLowerCase() === slugLower
      ) ?? null;
    const relatedBlogs = fallbackBlog
      ? (blogsData as any[])
          .filter((blog) => {
            if (!blog) return false;
            if (String(blog.slug || '') === String(fallbackBlog.slug || '')) return false;
            if (blog.is_published === false) return false;
            return String(blog.category || '') === String(fallbackBlog.category || '');
          })
          .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
          .slice(0, 4)
      : [];
    return <BlogDetailClient blog={fallbackBlog} relatedBlogs={relatedBlogs} />;
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  let isAdmin = false;

  if (userData?.user) {
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userData.user.id)
      .maybeSingle();
    isAdmin = Boolean(adminRow);
  }

  let blogQuery = supabase
    .from('blogs')
    .select('*')
    .in('slug', slug.toLowerCase() === slug ? [slug] : [slug, slug.toLowerCase()])
    .order('date', { ascending: false })
    .limit(1);

  if (!isAdmin) {
    blogQuery = blogQuery.or('is_published.eq.true,is_published.is.null');
  }

  const { data, error } = await blogQuery.maybeSingle();

  if (error || !data) {
    const slugLower = slug.toLowerCase();
    const fallbackBlog =
      (blogsData as any[]).find(
        (blog) => String(blog.slug || '').toLowerCase() === slugLower
      ) ?? null;
    const relatedBlogs = fallbackBlog
      ? (blogsData as any[])
          .filter((blog) => {
            if (!blog) return false;
            if (String(blog.slug || '') === String(fallbackBlog.slug || '')) return false;
            if (blog.is_published === false) return false;
            return String(blog.category || '') === String(fallbackBlog.category || '');
          })
          .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
          .slice(0, 4)
      : [];
    return <BlogDetailClient blog={fallbackBlog} relatedBlogs={relatedBlogs} />;
  }

  let viewCount = 0;
  try {
    const path = `/blog/${encodeURIComponent(data.slug)}`;
    const { count } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('path', path);
    if (typeof count === 'number') {
      viewCount = count;
    }
  } catch {
    // Ignore view count failures.
  }

  const { data: relatedBlogs } = await supabase
    .from('blogs')
    .select('id, slug, title, excerpt, author, date, category, tags, image, featured, is_published')
    .eq('category', data.category)
    .neq('id', data.id)
    .or('is_published.eq.true,is_published.is.null')
    .order('date', { ascending: false })
    .limit(4);

  return (
    <BlogDetailClient
      blog={data}
      relatedBlogs={(relatedBlogs as any[]) ?? []}
      viewCount={viewCount}
    />
  );
}
