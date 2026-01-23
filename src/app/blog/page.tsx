import BlogClient from './BlogClient';
import blogsData from '@/data/blogs.json';
import dailyQuotesData from '@/data/quotes/daily.json';
import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return <BlogClient blogs={blogsData} quotes={dailyQuotesData} />;
  }

  const supabase = await createSupabaseServerClient();
  const { data: blogs, error: blogsError } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: false });

  const { data: quotes, error: quotesError } = await supabase
    .from('quotes')
    .select('*')
    .order('date', { ascending: false });

  const safeBlogs = blogsError || !blogs ? blogsData : blogs;
  const safeQuotes = quotesError || !quotes ? dailyQuotesData : quotes;

  return <BlogClient blogs={safeBlogs} quotes={safeQuotes} />;
}
