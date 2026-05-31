import { NextResponse } from 'next/server';
import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';

type RangeValue = '24h' | '7d' | '30d';

type TrafficReferrer = { label: string; count: number };

const normalizeRange = (value?: string | null): RangeValue => {
  if (value === '24h' || value === '30d') return value;
  return '7d';
};

const MAX_EVENTS_FOR_FALLBACK = 10_000;
const FALLBACK_PAGE_SIZE = 1_000;

const toCount = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getRangeConfig = (rangeValue: RangeValue) => {
  if (rangeValue === '24h') {
    return { rangeHours: 24, bucketCount: 24, bucketSizeMs: 60 * 60 * 1000, labelStep: 4 };
  }
  if (rangeValue === '30d') {
    return { rangeHours: 24 * 30, bucketCount: 30, bucketSizeMs: 24 * 60 * 60 * 1000, labelStep: 5 };
  }
  return { rangeHours: 24 * 7, bucketCount: 7, bucketSizeMs: 24 * 60 * 60 * 1000, labelStep: 1 };
};

const formatBucketLabels = (rangeValue: RangeValue, bucketStartMs: number, bucketSizeMs: number, bucketCount: number) => {
  return Array.from({ length: bucketCount }, (_, index) => {
    const labelDate = new Date(bucketStartMs + (index + 1) * bucketSizeMs);
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
};

const normalizeTopReferrers = (value: unknown): TrafficReferrer[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const rawLabel = (entry as any)?.label;
      const rawCount = (entry as any)?.count;
      const label = typeof rawLabel === 'string' ? rawLabel.trim() : '';
      const count = toCount(rawCount);
      if (!label || count <= 0) return null;
      return { label, count };
    })
    .filter((item): item is TrafficReferrer => Boolean(item));
};

const isValidRpcReport = (value: unknown) => {
  if (!value || typeof value !== 'object') return false;
  const report = value as any;
  if (!report.summary || typeof report.summary !== 'object') return false;
  if (!report.buckets || typeof report.buckets !== 'object') return false;
  if (!Array.isArray(report.buckets.views)) return false;
  if (!Array.isArray(report.buckets.unique)) return false;
  if (!('topPages' in report) || !Array.isArray(report.topPages)) return false;
  if (!report.traffic || typeof report.traffic !== 'object') return false;
  return true;
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
  const { rangeHours, bucketCount, bucketSizeMs, labelStep } = getRangeConfig(rangeValue);
  const nowMs = Date.now();
  const rangeStart = new Date(nowMs - rangeHours * 60 * 60 * 1000).toISOString();

  const { data: reportData, error: reportError } = await supabase.rpc('admin_analytics_report', {
    range_value: rangeValue,
  });

  const rpcCandidate = Array.isArray(reportData) ? (reportData[0] as any) : (reportData as any);

  if (!reportError && reportData && isValidRpcReport(rpcCandidate)) {
    const report = rpcCandidate;
    const generatedAtIso =
      typeof report?.generatedAt === 'string' ? report.generatedAt : new Date().toISOString();

    const generatedAtMs = new Date(generatedAtIso).getTime();
    const safeEndMs = Number.isFinite(generatedAtMs) ? generatedAtMs : nowMs;
    const safeBucketCount = toCount(report?.bucketCount) || bucketCount;
    const bucketSizeSeconds = toCount(report?.bucketSizeSeconds);
    const safeBucketSizeMs = bucketSizeSeconds ? bucketSizeSeconds * 1000 : bucketSizeMs;
    const safeLabelStep = toCount(report?.labelStep) || labelStep;
    const bucketStartMs = safeEndMs - safeBucketCount * safeBucketSizeMs;

    const pageViews = toCount(report?.summary?.pageViews);
    const uniqueVisitors = toCount(report?.summary?.uniqueVisitors);
    const viewsPerVisitor = uniqueVisitors ? pageViews / uniqueVisitors : 0;

    const viewsRaw = Array.isArray(report?.buckets?.views) ? report.buckets.views : [];
    const uniqueRaw = Array.isArray(report?.buckets?.unique) ? report.buckets.unique : [];

    const views = Array.from({ length: safeBucketCount }, (_, index) => toCount(viewsRaw[index]));
    const unique = Array.from({ length: safeBucketCount }, (_, index) => toCount(uniqueRaw[index]));

    const topPages = Array.isArray(report?.topPages)
      ? report.topPages
          .map((entry: any) => ({
            path: String(entry?.path ?? ''),
            count: toCount(entry?.count),
          }))
          .filter((entry: { path: string; count: number }) => entry.path && entry.count >= 0)
      : [];

    const traffic = report?.traffic && typeof report.traffic === 'object' ? report.traffic : null;
    const direct = toCount(traffic?.direct);
    const referrals = toCount(traffic?.referrals);
    const topReferrers = normalizeTopReferrers(traffic?.topReferrers);

    const response = NextResponse.json({
      ok: true,
      range: rangeValue,
      summary: {
        uniqueVisitors,
        pageViews,
        viewsPerVisitor,
      },
      buckets: {
        labels: formatBucketLabels(rangeValue, bucketStartMs, safeBucketSizeMs, safeBucketCount),
        views,
        unique,
        labelStep: safeLabelStep,
      },
      topPages,
      traffic: {
        direct,
        referrals,
        topReferrers,
      },
      generatedAt: generatedAtIso,
    });

    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
  const rpcPayloadIncomplete = !reportError && reportData && !isValidRpcReport(rpcCandidate);

  const [pageViewsResult, directResult, referralResult] = await Promise.all([
    supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', rangeStart),
    supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', rangeStart)
      .is('referrer', null),
    supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', rangeStart)
      .not('referrer', 'is', null),
  ]);

  const pageViews = pageViewsResult.error ? 0 : toCount(pageViewsResult.count);
  const direct = directResult.error ? 0 : toCount(directResult.count);
  const referrals = referralResult.error ? 0 : toCount(referralResult.count);

  type AnalyticsRow = {
    visitor_id: string;
    ip_hash: string | null;
    path: string;
    created_at: string;
    referrer: string | null;
  };

  const analyticsRows: AnalyticsRow[] = [];

  for (
    let offset = 0;
    offset < MAX_EVENTS_FOR_FALLBACK;
    offset += FALLBACK_PAGE_SIZE
  ) {
    const { data: rows, error } = await supabase
      .from('analytics_events')
      .select('visitor_id, ip_hash, path, created_at, referrer')
      .gte('created_at', rangeStart)
      .order('created_at', { ascending: false })
      .range(offset, offset + FALLBACK_PAGE_SIZE - 1);

    if (error) break;
    if (!rows || rows.length === 0) break;
    analyticsRows.push(...(rows as AnalyticsRow[]));
    if (rows.length < FALLBACK_PAGE_SIZE) break;
  }

  const visitorKeyForRow = (row: AnalyticsRow) => row.visitor_id || row.ip_hash || '';

  const uniqueVisitors = new Set(analyticsRows.map(visitorKeyForRow)).size;
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

  const bucketStartMs = nowMs - bucketCount * bucketSizeMs;
  const viewBuckets = Array.from({ length: bucketCount }, () => 0);
  const visitorBuckets = Array.from({ length: bucketCount }, () => new Set<string>());

  analyticsRows.forEach((row) => {
    const timestamp = new Date(row.created_at).getTime();
    if (Number.isNaN(timestamp) || timestamp < bucketStartMs || timestamp > nowMs) return;
    const index = Math.min(bucketCount - 1, Math.floor((timestamp - bucketStartMs) / bucketSizeMs));
    viewBuckets[index] += 1;
    visitorBuckets[index].add(visitorKeyForRow(row));
  });

  const uniqueBuckets = visitorBuckets.map((bucket) => bucket.size);

  const referrerCounts = new Map<string, number>();
  analyticsRows.forEach((row) => {
    const raw = typeof row.referrer === 'string' ? row.referrer.trim() : '';
    if (!raw) return;
    try {
      const host = new URL(raw).hostname.replace(/^www\./i, '').trim();
      if (!host) return;
      referrerCounts.set(host, (referrerCounts.get(host) || 0) + 1);
    } catch {
      return;
    }
  });

  const topReferrers = Array.from(referrerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  const response = NextResponse.json({
    ok: true,
    range: rangeValue,
    summary: {
      uniqueVisitors,
      pageViews,
      viewsPerVisitor,
    },
    buckets: {
      labels: formatBucketLabels(rangeValue, bucketStartMs, bucketSizeMs, bucketCount),
      views: viewBuckets,
      unique: uniqueBuckets,
      labelStep,
    },
    topPages,
    traffic: {
      direct,
      referrals,
      topReferrers,
    },
    capped: analyticsRows.length >= MAX_EVENTS_FOR_FALLBACK,
    generatedAt: new Date(nowMs).toISOString(),
    source: reportError || rpcPayloadIncomplete ? 'fallback' : 'events',
    rpcError: reportError?.message ?? (rpcPayloadIncomplete ? 'RPC payload incomplete' : undefined),
  });

  response.headers.set('Cache-Control', 'no-store');
  return response;
}
