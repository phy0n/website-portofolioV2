'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import AdminAnalyticsLineChart from '@/components/analytics/AdminAnalyticsLineChart';

type RangeValue = '24h' | '7d' | '30d';

type CountValue = number | string;

type AnalyticsPayload = {
  ok: boolean;
  range: RangeValue;
  summary: {
    uniqueVisitors: CountValue;
    pageViews: CountValue;
    viewsPerVisitor: number | string;
  };
  buckets: {
    labels: string[];
    views: CountValue[];
    unique: CountValue[];
    labelStep: number;
  };
  topPages: { path: string; count: number }[];
  traffic?: {
    direct?: CountValue;
    referrals?: CountValue;
    topReferrers?: { label: string; count: CountValue }[];
  };
  capped?: boolean;
  generatedAt: string;
  error?: string;
};

const rangeOptions: RangeValue[] = ['24h', '7d', '30d'];

const normalizeRange = (value?: string): RangeValue => {
  if (value === '24h' || value === '30d') return value;
  return '7d';
};

const toCount = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export default function AdminAnalytics({
  initialRange,
}: {
  initialRange?: string;
}) {
  const [range, setRange] = useState<RangeValue>(normalizeRange(initialRange));
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const refreshTimer = useRef<number | null>(null);
  const showSkeleton = isLoading && !data;

  const loadAnalytics = async (targetRange: RangeValue) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin-analytics?range=${targetRange}`, {
        cache: 'no-store',
      });
      const payload = (await response.json()) as AnalyticsPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Analytics unavailable');
      }
      setData(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analytics unavailable');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    loadAnalytics(range);
    if (refreshTimer.current) {
      window.clearInterval(refreshTimer.current);
    }
    refreshTimer.current = window.setInterval(() => loadAnalytics(range), 30000);
    return () => {
      if (refreshTimer.current) {
        window.clearInterval(refreshTimer.current);
      }
    };
  }, [range]);

  useEffect(() => {
    if (!data) return;
    setAnimationKey((prev) => prev + 1);
  }, [data]);

  const labels = data?.buckets.labels ?? [];
  const labelStep = data?.buckets.labelStep ?? 1;
  const topPages = useMemo(() => {
    return (data?.topPages ?? [])
      .map((entry) => ({ path: entry.path, count: toCount(entry.count) }))
      .filter((entry) => entry.path);
  }, [data?.topPages]);
  const topPagesMax = topPages[0]?.count ?? 0;
  const totalVisits = toCount(data?.summary.pageViews);
  const uniqueVisitors = toCount(data?.summary.uniqueVisitors);
  const viewsPerVisitor =
    uniqueVisitors > 0 ? totalVisits / uniqueVisitors : toCount(data?.summary.viewsPerVisitor);

  const rangeLabel = useMemo(() => {
    if (!data?.generatedAt) return '--';
    const end = new Date(data.generatedAt);
    const rangeHours = range === '24h' ? 24 : range === '30d' ? 24 * 30 : 24 * 7;
    const start = new Date(end.getTime() - rangeHours * 60 * 60 * 1000);
    const formatOptions: Intl.DateTimeFormatOptions =
      range === '24h'
        ? { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }
        : { month: 'short', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-US', formatOptions);
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }, [data?.generatedAt, range]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.buckets.labels.map((label, index) => ({
      label,
      visits: toCount(data.buckets.views[index]),
      unique: toCount(data.buckets.unique[index]),
    }));
  }, [data]);

  const trafficDirect = toCount(data?.traffic?.direct);
  const trafficReferrals = toCount(data?.traffic?.referrals);
  const topReferrers = useMemo(() => {
    const entries = data?.traffic?.topReferrers ?? [];
    if (!Array.isArray(entries)) return [];
    return entries
      .map((entry) => {
        const label = String(entry?.label ?? '').trim();
        const count = toCount(entry?.count);
        if (!label || count <= 0) return null;
        return { label, count };
      })
      .filter((entry): entry is { label: string; count: number } => Boolean(entry))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data?.traffic?.topReferrers]);
  const topReferrersMax = topReferrers[0]?.count ?? 0;

  return (
    <section id="audience" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--admin-accent)]">Audience</p>
          <h3 className="text-xl font-semibold text-[var(--home-ink)]">User Analytics</h3>
        </div>
        <div className="admin-analytics-range">
          {rangeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`admin-analytics-range-button cursor-pointer ${range === option ? 'is-active' : ''}`}
              aria-pressed={range === option}>
              {option}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-soft)] p-5 text-sm text-[var(--home-ink)] opacity-70 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-base font-semibold text-[var(--home-ink)]">Analytics not configured</p>
          <p className="mt-2 text-[var(--home-muted)] opacity-50">{error}</p>
        </div>
      ) : showSkeleton ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-sm text-[var(--home-muted)] opacity-50">Loading analytics...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Unique users (device)', value: uniqueVisitors.toLocaleString() },
              { label: 'Page views', value: totalVisits.toLocaleString() },
              {
                label: 'Views per user',
                value: viewsPerVisitor.toFixed(1),
              },
            ].map((metricItem) => (
              <div
                key={metricItem.label}
                className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-soft)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">
                  {metricItem.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-[var(--home-ink)]">{metricItem.value}</p>
                <p className="mt-2 text-xs text-[var(--home-muted)] opacity-40">
                  {isLoading ? 'Refreshing...' : `Last ${range}`}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-soft)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">Date range</p>
                <p className="mt-2 text-lg font-semibold text-[var(--home-ink)]">{rangeLabel}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-[var(--home-muted)] opacity-50">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--admin-accent)]" />
                    Visits
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--home-soft)]" />
                    Unique users
                  </span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-60">
                <span>Total visits</span>
                <span className="rounded-full bg-[var(--home-soft)] px-2 py-1 text-[var(--home-ink)]">
                  {totalVisits.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 h-52">
              {!hasMounted ? (
                <div className="flex h-full items-center justify-center text-sm text-[var(--home-muted)] opacity-40">
                  Loading chart...
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[var(--home-muted)] opacity-40">
                  No chart data yet.
                </div>
              ) : (
                <div className="h-full w-full" key={animationKey}>
                  <AdminAnalyticsLineChart points={chartData} />
                </div>
              )}
            </div>
            <div
              className="mt-3 grid text-[10px] text-[var(--home-muted)] opacity-40"
              style={{ gridTemplateColumns: `repeat(${labels.length || 1}, minmax(0, 1fr))` }}>
              {labels.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className={`text-center ${
                    index % labelStep === 0 ? 'opacity-100' : 'opacity-0'
                  }`}>
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-[var(--home-muted)] opacity-40">
              Auto-refresh every 30s - Updated {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString('en-GB') : '--'}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-soft)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:col-span-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--home-ink)]">Top pages</p>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">
                  Last {range}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {isLoading && !topPages.length && (
                  <p className="text-sm text-[var(--home-muted)] opacity-50">Loading pages...</p>
                )}
                {!isLoading && topPages.length === 0 && (
                  <p className="text-sm text-[var(--home-muted)] opacity-50">No data yet.</p>
                )}
                {topPages.map((page) => (
                  <div key={page.path} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-[var(--home-ink)] opacity-70">
                      <span className="truncate">{page.path}</span>
                      <span className="text-[var(--home-muted)] opacity-50">{page.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--home-soft)]">
                      <div
                        className="h-full rounded-full bg-[var(--admin-accent)] transition-[width] duration-700 ease-out"
                        style={{
                          width: topPagesMax ? `${(page.count / topPagesMax) * 100}%` : '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-soft)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:col-span-2">
              <p className="text-sm font-semibold text-[var(--home-ink)]">Traffic overview</p>
              <div className="mt-4 space-y-4 text-sm text-[var(--home-muted)] opacity-60">
                <div className="flex items-center justify-between">
                  <span>Total events</span>
                  <span className="text-[var(--home-ink)]">{totalVisits.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unique visitors</span>
                  <span className="text-[var(--home-ink)]">{uniqueVisitors.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[var(--home-border)] bg-[var(--home-soft)] p-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">
                      Direct
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--home-ink)]">
                      {trafficDirect.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--home-border)] bg-[var(--home-soft)] p-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">
                      Referrals
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--home-ink)]">
                      {trafficReferrals.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--home-border)] bg-[var(--home-soft)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">
                      Top referrers
                    </p>
                    {data?.capped ? (
                      <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">
                        capped
                      </span>
                    ) : null}
                  </div>
                  {topReferrers.length === 0 ? (
                    <p className="mt-2 text-xs text-[var(--home-muted)] opacity-40">No referrer data yet.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {topReferrers.map((entry) => (
                        <div key={entry.label} className="space-y-1">
                          <div className="flex items-center justify-between gap-3 text-xs text-[var(--home-muted)] opacity-60">
                            <span className="truncate">{entry.label}</span>
                            <span className="text-[var(--home-muted)] opacity-60">{entry.count}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--home-soft)]">
                            <div
                              className="h-full rounded-full bg-[var(--home-soft)] transition-[width] duration-700 ease-out"
                              style={{
                                width: topReferrersMax
                                  ? `${(entry.count / topReferrersMax) * 100}%`
                                  : '0%',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-[var(--home-border)] bg-[var(--home-soft)] p-3 text-xs text-[var(--home-muted)] opacity-50">
                  Watch live movement as visitors arrive. The chart auto-updates.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

