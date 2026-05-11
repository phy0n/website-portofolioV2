import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60;

type ServiceRow = {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  starting_from?: string | null;
  cta_label?: string | null;
  cta_link?: string | null;
  sort_order?: number | null;
};

const normalizeService = (value: any): ServiceRow | null => {
  const id = String(value?.id ?? '').trim();
  const title = String(value?.title ?? '').trim();
  const description = String(value?.description ?? '').trim();
  const deliverables = Array.isArray(value?.deliverables)
    ? (value.deliverables as unknown[]).map((item) => String(item)).filter(Boolean)
    : [];
  const startingFromRaw = typeof value?.starting_from === 'string' ? value.starting_from : '';
  const starting_from = startingFromRaw.trim() ? startingFromRaw.trim() : null;
  const ctaLabelRaw = typeof value?.cta_label === 'string' ? value.cta_label : '';
  const cta_label = ctaLabelRaw.trim() ? ctaLabelRaw.trim() : null;
  const ctaLinkRaw = typeof value?.cta_link === 'string' ? value.cta_link : '';
  const cta_link = ctaLinkRaw.trim() ? ctaLinkRaw.trim() : null;
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? value.sort_order : null;

  if (!id || !title || !description) return null;
  return { id, title, description, deliverables, starting_from, cta_label, cta_link, sort_order };
};

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
    const supabaseKey = supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { services: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const { data, error } = await supabase
      .from('services')
      .select(
        'id,title,description,deliverables,starting_from,cta_label,cta_link,sort_order,is_published,show_on_phion,created_at'
      )
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return NextResponse.json(
        { services: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const services = (data as any[])
      .filter((row) => row?.is_published !== false && row?.show_on_phion !== false)
      .map(normalizeService)
      .filter((row): row is ServiceRow => Boolean(row));

    return NextResponse.json(
      { services },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { services: [] },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  }
}
