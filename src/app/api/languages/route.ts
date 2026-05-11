import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60;

type LanguageRow = {
  id: string;
  name: string;
  label: string;
  level: number;
  sort_order?: number | null;
};

const normalizeLanguage = (value: any): LanguageRow | null => {
  const id = String(value?.id ?? '').trim();
  const name = String(value?.name ?? '').trim();
  const label = String(value?.label ?? '').trim();
  const level = typeof value?.level === 'number' && Number.isFinite(value.level) ? Math.trunc(value.level) : 0;
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? Math.trunc(value.sort_order) : null;

  if (!id || !name || !label) return null;
  return { id, name, label, level: Math.max(0, Math.min(level, 100)), sort_order };
};

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
    const supabaseKey = supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { ok: false, languages: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('languages')
      .select('id, name, label, level, sort_order, is_published, show_on_phion')
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return NextResponse.json(
        { ok: false, languages: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const languages = (data as any[])
      .filter((row) => row?.is_published !== false && row?.show_on_phion !== false)
      .map(normalizeLanguage)
      .filter((row): row is LanguageRow => Boolean(row));

    return NextResponse.json(
      { ok: true, languages },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { ok: false, languages: [] },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  }
}
