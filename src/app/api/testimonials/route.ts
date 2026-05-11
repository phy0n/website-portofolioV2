import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60;

type TestimonialRow = {
  id: string;
  name: string;
  title?: string | null;
  company?: string | null;
  quote: string;
  avatar_url?: string | null;
  source_url?: string | null;
  sort_order?: number | null;
};

const normalizeTestimonial = (value: any): TestimonialRow | null => {
  const id = String(value?.id ?? '').trim();
  const name = String(value?.name ?? '').trim();
  const quote = String(value?.quote ?? '').trim();
  const titleRaw = typeof value?.title === 'string' ? value.title : '';
  const companyRaw = typeof value?.company === 'string' ? value.company : '';
  const avatarRaw = typeof value?.avatar_url === 'string' ? value.avatar_url : '';
  const sourceRaw = typeof value?.source_url === 'string' ? value.source_url : '';
  const title = titleRaw.trim() ? titleRaw.trim() : null;
  const company = companyRaw.trim() ? companyRaw.trim() : null;
  const avatar_url = avatarRaw.trim() ? avatarRaw.trim() : null;
  const source_url = sourceRaw.trim() ? sourceRaw.trim() : null;
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? value.sort_order : null;

  if (!id || !name || !quote) return null;
  return { id, name, quote, title, company, avatar_url, source_url, sort_order };
};

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
    const supabaseKey = supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { testimonials: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const { data, error } = await supabase
      .from('testimonials')
      .select(
        'id,name,title,company,quote,avatar_url,source_url,sort_order,is_published,show_on_phion,created_at'
      )
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return NextResponse.json(
        { testimonials: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const testimonials = (data as any[])
      .filter((row) => row?.is_published !== false && row?.show_on_phion !== false)
      .map(normalizeTestimonial)
      .filter((row): row is TestimonialRow => Boolean(row));

    return NextResponse.json(
      { testimonials },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { testimonials: [] },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  }
}
