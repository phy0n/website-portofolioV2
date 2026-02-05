import SiteShell from '@/components/home/SiteShell';
import BlogClient from './BlogClient';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/supabase/server';

export const revalidate = 60;

export default async function BlogPage() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return (
      <SiteShell contentMode="full">
        <BlogClient blogs={[]} quotes={[]} />
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

  const safeBlogs =
    blogsError || !blogs ? [] : blogs.filter((blog) => (blog as any)?.show_on_phion !== false);
  const safeQuotes =
    quotesError || !quotes ? [] : quotes.filter((quote) => (quote as any)?.show_on_phion !== false);

  return (
    <SiteShell contentMode="full">
      <BlogClient blogs={safeBlogs} quotes={safeQuotes} />
    </SiteShell>
  );
}
