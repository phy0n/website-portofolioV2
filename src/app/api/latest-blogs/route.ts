import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 30;

type BlogPreview = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags?: string[] | null;
};

const normalizePreview = (value: any): BlogPreview | null => {
  const id = String(value?.id ?? '').trim();
  const slug = String(value?.slug ?? '').trim();
  const title = String(value?.title ?? '').trim();
  const excerpt = String(value?.excerpt ?? '').trim();
  const date = String(value?.date ?? '').trim();
  const tags = Array.isArray(value?.tags) ? (value.tags as unknown[]).map((t) => String(t)) : null;

  if (!id || !slug || !title || !excerpt || !date) return null;
  return { id, slug, title, excerpt, date, tags };
};

const compareByDateDesc = (a: BlogPreview, b: BlogPreview) => {
  const aTime = Date.parse(a.date);
  const bTime = Date.parse(b.date);
  if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) return bTime - aTime;
  return String(b.date).localeCompare(String(a.date));
};

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseKey = supabaseServiceRoleKey ?? supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { blogs: [] },
        { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .or('is_published.eq.true,is_published.is.null')
      .order('date', { ascending: false })
      .limit(12);

    if (error || !data) {
      return NextResponse.json(
        { blogs: [] },
        { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } }
      );
    }

    const blogs = data
      .filter(
        (blog) =>
          (blog as any)?.is_published !== false && (blog as any)?.show_on_phion !== false
      )
      .map(normalizePreview)
      .filter((blog): blog is BlogPreview => Boolean(blog))
      .sort(compareByDateDesc)
      .slice(0, 3);

    return NextResponse.json(
      { blogs },
      { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } }
    );
  } catch (error) {
    console.error('Error fetching latest blogs:', error);
    return NextResponse.json(
      { blogs: [] },
      { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } }
    );
  }
}
