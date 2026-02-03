import SiteShell from '@/components/home/SiteShell';
import BlogClient from './BlogClient';
import blogsData from '@/data/blogs.json';
import dailyQuotesData from '@/data/quotes/daily.json';
import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return (
      <SiteShell contentMode="full">
        <BlogClient blogs={blogsData} quotes={dailyQuotesData} viewCounts={{}} />
      </SiteShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: blogs, error: blogsError } = await supabase
    .from('blogs')
    .select('*')
    .or('is_published.eq.true,is_published.is.null')
    .order('date', { ascending: false });

  const { data: quotes, error: quotesError } = await supabase
    .from('quotes')
    .select('*')
    .order('date', { ascending: false });

  const safeBlogs = blogsError || !blogs ? blogsData : blogs;
  const safeQuotes = quotesError || !quotes ? dailyQuotesData : quotes;

  const viewCounts: Record<string, number> = {};
  try {
    await Promise.all(
      (safeBlogs as any[]).map(async (blog) => {
        const slug = String(blog?.slug || '').trim();
        if (!slug) return;
        const path = `/blog/${encodeURIComponent(slug)}`;
        const { count, error } = await supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('path', path);
        if (error || typeof count !== 'number') return;
        viewCounts[slug] = count;
      })
    );
  } catch {
    // Ignore view count failures.
  }

  return (
    <SiteShell contentMode="full">
      <BlogClient blogs={safeBlogs} quotes={safeQuotes} viewCounts={viewCounts} />
    </SiteShell>
  );
}
