import BlogDetailClient from './BlogDetailClient';
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
    return <BlogDetailClient blog={null} relatedBlogs={[]} />;
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

  if (error || !data || (data as any)?.show_on_phion === false) {
    return <BlogDetailClient blog={null} relatedBlogs={[]} />;
  }

  const { data: relatedBlogs } = await supabase
    .from('blogs')
    .select(
      'id, slug, title, excerpt, author, date, category, tags, image, featured, is_published, show_on_phion'
    )
    .eq('category', data.category)
    .neq('id', data.id)
    .or('is_published.eq.true,is_published.is.null')
    .order('date', { ascending: false })
    .limit(12);

  const relatedBlogRows = ((relatedBlogs as any[]) ?? [])
    .filter((blog) => (blog as any)?.show_on_phion !== false)
    .slice(0, 4);

  return (
    <BlogDetailClient
      blog={data}
      relatedBlogs={relatedBlogRows}
    />
  );
}
