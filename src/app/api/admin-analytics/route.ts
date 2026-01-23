import { NextResponse } from 'next/server';
import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';

type RangeValue = '24h' | '7d' | '30d';

const normalizeRange = (value?: string | null): RangeValue => {
  if (value === '24h' || value === '30d') return value;
  return '7d';
};

export async function GET(request: Request) {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 503 });
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 503 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const rangeValue = normalizeRange(searchParams.get('range'));
  const rangeHours = rangeValue === '24h' ? 24 : rangeValue === '30d' ? 24 * 30 : 24 * 7;
  const now = Date.now();
  const rangeStart = new Date(now - rangeHours * 60 * 60 * 1000).toISOString();

  const { data: analyticsData, error } = await supabase
    .from('analytics_events')
    .select('visitor_id, path, created_at')
    .gte('created_at', rangeStart);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  type AnalyticsRow = { visitor_id: string; path: string; created_at: string };
  const analyticsRows = (analyticsData as AnalyticsRow[] | null) ?? [];

  const uniqueVisitors = new Set(analyticsRows.map((row) => row.visitor_id)).size;
  const pageViews = analyticsRows.length;
  const viewsPerVisitor = uniqueVisitors ? pageViews / uniqueVisitors : 0;

  const pageCounts = new Map<string, number>();
  analyticsRows.forEach((row) => {
    const path = row.path || '/';
    pageCounts.set(path, (pageCounts.get(path) || 0) + 1);
  });

  const topPages = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, count]) => ({ path, count }));

  const bucketCount = rangeValue === '24h' ? 24 : rangeValue === '30d' ? 30 : 7;
  const bucketSizeMs = rangeValue === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const bucketStart = now - bucketCount * bucketSizeMs;
  const viewBuckets = Array.from({ length: bucketCount }, () => 0);
  const visitorBuckets = Array.from({ length: bucketCount }, () => new Set<string>());

  analyticsRows.forEach((row) => {
    const timestamp = new Date(row.created_at).getTime();
    if (Number.isNaN(timestamp) || timestamp < bucketStart || timestamp > now) return;
    const index = Math.min(
      bucketCount - 1,
      Math.floor((timestamp - bucketStart) / bucketSizeMs)
    );
    viewBuckets[index] += 1;
    visitorBuckets[index].add(row.visitor_id);
  });

  const uniqueBuckets = visitorBuckets.map((bucket) => bucket.size);
  const labelStep = rangeValue === '24h' ? 4 : rangeValue === '30d' ? 5 : 1;
  const bucketLabels = Array.from({ length: bucketCount }, (_, index) => {
    const labelDate = new Date(bucketStart + (index + 1) * bucketSizeMs);
    if (rangeValue === '24h') {
      return labelDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return labelDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  });

  const response = NextResponse.json({
    ok: true,
    range: rangeValue,
    summary: {
      uniqueVisitors,
      pageViews,
      viewsPerVisitor,
    },
    buckets: {
      labels: bucketLabels,
      views: viewBuckets,
      unique: uniqueBuckets,
      labelStep,
    },
    topPages,
    generatedAt: new Date().toISOString(),
  });

  response.headers.set('Cache-Control', 'no-store');
  return response;
}
