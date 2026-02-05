import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60;

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  status: string;
  icon?: string | null;
  sort_order?: number | null;
};

const normalizeProject = (value: any): ProjectRow | null => {
  const id = String(value?.id ?? '').trim();
  const title = String(value?.title ?? '').trim();
  const description = String(value?.description ?? '').trim();
  const link = String(value?.link ?? '').trim();
  const status = String(value?.status ?? '').trim();
  const iconRaw = typeof value?.icon === 'string' ? value.icon : '';
  const icon = iconRaw.trim() ? iconRaw.trim() : null;
  const tags = Array.isArray(value?.tags) ? (value.tags as unknown[]).map((tag) => String(tag)) : [];
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? value.sort_order : null;

  if (!id || !title || !description || !link || !status) return null;
  return { id, title, description, tags, link, status, icon, sort_order };
};

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseKey = supabaseServiceRoleKey ?? supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { projects: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('projects')
      .select('id, title, description, tags, link, status, icon, sort_order, is_published, show_on_phion')
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return NextResponse.json(
        { projects: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const projects = (data as any[])
      .filter((row) => row?.is_published !== false && row?.show_on_phion !== false)
      .map(normalizeProject)
      .filter((row): row is ProjectRow => Boolean(row));

    return NextResponse.json(
      { projects },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { projects: [] },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  }
}
