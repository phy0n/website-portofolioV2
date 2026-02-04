import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;

const MAX_SLUGS = 80;

const normalizeSlug = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 140) return null;
  return trimmed;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('slugs') ?? '';
  const slugs = raw
    .split(',')
    .map((slug) => normalizeSlug(slug))
    .filter((slug): slug is string => Boolean(slug))
    .slice(0, MAX_SLUGS);

  if (!supabase || slugs.length === 0) {
    const response = NextResponse.json({ ok: true, counts: {} as Record<string, number> });
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return response;
  }

  const counts: Record<string, number> = {};

  await Promise.all(
    slugs.map(async (slug) => {
      const path = `/blog/${encodeURIComponent(slug)}`;
      const { count, error } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('path', path);

      counts[slug] = error || typeof count !== 'number' ? 0 : count;
    })
  );

  const response = NextResponse.json({ ok: true, counts });
  response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
  return response;
}

