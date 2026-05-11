import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60;

type EducationRow = {
  id: string;
  institution: string;
  degree: string;
  field?: string | null;
  period: string;
  location?: string | null;
  description?: string | null;
  highlights: string[];
  sort_order?: number | null;
};

const normalizeEducation = (value: any): EducationRow | null => {
  const id = String(value?.id ?? '').trim();
  const institution = String(value?.institution ?? '').trim();
  const degree = String(value?.degree ?? '').trim();
  const period = String(value?.period ?? '').trim();
  const fieldRaw = typeof value?.field === 'string' ? value.field : '';
  const locationRaw = typeof value?.location === 'string' ? value.location : '';
  const descriptionRaw = typeof value?.description === 'string' ? value.description : '';
  const field = fieldRaw.trim() ? fieldRaw.trim() : null;
  const location = locationRaw.trim() ? locationRaw.trim() : null;
  const description = descriptionRaw.trim() ? descriptionRaw.trim() : null;
  const highlights = Array.isArray(value?.highlights)
    ? (value.highlights as unknown[]).map((item) => String(item)).filter(Boolean)
    : [];
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? value.sort_order : null;

  if (!id || !institution || !degree || !period) return null;
  return { id, institution, degree, field, period, location, description, highlights, sort_order };
};

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
    const supabaseKey = supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { education: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const { data, error } = await supabase
      .from('education')
      .select(
        'id,institution,degree,field,period,location,description,highlights,sort_order,is_published,show_on_phion,created_at'
      )
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return NextResponse.json(
        { education: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const education = (data as any[])
      .filter((row) => row?.is_published !== false && row?.show_on_phion !== false)
      .map(normalizeEducation)
      .filter((row): row is EducationRow => Boolean(row));

    return NextResponse.json(
      { education },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching education:', error);
    return NextResponse.json(
      { education: [] },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  }
}
