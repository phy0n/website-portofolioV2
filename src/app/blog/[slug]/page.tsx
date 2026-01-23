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
  const slug = decodeURIComponent(rawSlug || '').trim();

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    const slugLower = slug.toLowerCase();
    const fallbackBlog =
      (blogsData as any[]).find(
        (blog) => String(blog.slug || '').toLowerCase() === slugLower
      ) ?? null;
    return <BlogDetailClient blog={fallbackBlog} />;
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
    .ilike('slug', slug)
    .order('date', { ascending: false })
    .limit(1);

  if (!isAdmin) {
    blogQuery = blogQuery.eq('is_published', true);
  }

  const { data, error } = await blogQuery.maybeSingle();

  if (error || !data) {
    const slugLower = slug.toLowerCase();
    const fallbackBlog =
      (blogsData as any[]).find(
        (blog) => String(blog.slug || '').toLowerCase() === slugLower
      ) ?? null;
    return <BlogDetailClient blog={fallbackBlog} />;
  }

  return <BlogDetailClient blog={data} />;
}
