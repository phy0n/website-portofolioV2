import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = supabaseServiceRoleKey ?? supabaseAnonKey;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
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

const toCount = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
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
    const response = NextResponse.json({
      ok: true,
      source: 'none',
      counts: {} as Record<string, number>,
      totals: {} as Record<string, number>,
      uniques: {} as Record<string, number>,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  const totals: Record<string, number> = {};
  const uniques: Record<string, number> = {};

  const paths = slugs.map((slug) => `/blog/${encodeURIComponent(slug)}`);

  const { data: counterRows, error: counterError } = await supabase
    .from('analytics_page_counters')
    .select('path,total_views,unique_visitors')
    .in('path', paths);

  if (!counterError && Array.isArray(counterRows)) {
    const byPath = new Map<string, { total?: unknown; unique?: unknown }>();
    counterRows.forEach((row) => {
      const key = String((row as any)?.path || '');
      if (!key) return;
      byPath.set(key, {
        total: (row as any)?.total_views,
        unique: (row as any)?.unique_visitors,
      });
    });

    const missingSlugs: string[] = [];
    slugs.forEach((slug) => {
      const path = `/blog/${encodeURIComponent(slug)}`;
      const row = byPath.get(path);
      totals[slug] = toCount(row?.total);
      uniques[slug] = toCount(row?.unique);
      if (!row) {
        missingSlugs.push(slug);
      }
    });

    if (missingSlugs.length > 0) {
      await Promise.all(
        missingSlugs.map(async (slug) => {
          const path = `/blog/${encodeURIComponent(slug)}`;
          const { count, error } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .eq('path', path);
          totals[slug] = error || typeof count !== 'number' ? 0 : count;
        })
      );
    }

    const response = NextResponse.json({
      ok: true,
      source: 'counters',
      counts: totals,
      totals,
      uniques,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  await Promise.all(
    slugs.map(async (slug) => {
      const path = `/blog/${encodeURIComponent(slug)}`;
      const { count, error } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('path', path);

      totals[slug] = error || typeof count !== 'number' ? 0 : count;
    })
  );

  const response = NextResponse.json({
    ok: true,
    source: 'events',
    counts: totals,
    totals,
    uniques,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
