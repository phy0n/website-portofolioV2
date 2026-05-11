import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60;

type ExperienceRow = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
  status: string;
  sort_order?: number | null;
};

const normalizeExperience = (value: any): ExperienceRow | null => {
  const id = String(value?.id ?? '').trim();
  const role = String(value?.role ?? '').trim();
  const company = String(value?.company ?? '').trim();
  const period = String(value?.period ?? '').trim();
  const description = String(value?.description ?? '').trim();
  const highlights = Array.isArray(value?.highlights)
    ? (value.highlights as unknown[]).map((item) => String(item)).filter(Boolean)
    : [];
  const status = String(value?.status ?? '').trim();
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? value.sort_order : null;

  if (!id || !role || !company || !period || !description || !status) return null;
  return { id, role, company, period, description, highlights, status, sort_order };
};

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
    const supabaseKey = supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { experiences: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('experiences')
      .select(
        'id, role, company, period, description, highlights, status, sort_order, is_published, show_on_phion'
      )
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return NextResponse.json(
        { experiences: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const experiences = (data as any[])
      .filter((row) => row?.is_published !== false && row?.show_on_phion !== false)
      .map(normalizeExperience)
      .filter((row): row is ExperienceRow => Boolean(row));

    return NextResponse.json(
      { experiences },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json(
      { experiences: [] },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  }
}
