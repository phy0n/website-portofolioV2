import SiteShell from '@/components/home/SiteShell';
import BlogClient from './BlogClient';
import blogsData from '@/data/blogs.json';
import dailyQuotesData from '@/data/quotes/daily.json';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/supabase/server';

export const revalidate = 60;

export default async function BlogPage() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return (
      <SiteShell contentMode="full">
        <BlogClient blogs={blogsData} quotes={dailyQuotesData} />
      </SiteShell>
    );
  }

  const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: { persistSession: false },
  });

  const [{ data: blogs, error: blogsError }, { data: quotes, error: quotesError }] = await Promise.all([
    supabase
      .from('blogs')
      .select('*')
      .or('is_published.eq.true,is_published.is.null')
      .order('date', { ascending: false }),
    supabase
      .from('quotes')
      .select('*')
      .order('date', { ascending: false }),
  ]);

  const safeBlogs = blogsError || !blogs ? blogsData : blogs;
  const safeQuotes = quotesError || !quotes ? dailyQuotesData : quotes;

  return (
    <SiteShell contentMode="full">
      <BlogClient blogs={safeBlogs} quotes={safeQuotes} />
    </SiteShell>
  );
}
