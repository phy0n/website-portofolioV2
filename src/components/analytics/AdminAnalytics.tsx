'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Audience</p>
          <h3 className="text-xl font-semibold text-white">User Analytics</h3>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
          {rangeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`cursor-pointer rounded-full px-3 py-1 transition ${
                range === option
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white'
              }`}
              aria-pressed={range === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-base font-semibold text-white">Analytics not configured</p>
          <p className="mt-2 text-white/50">{error}</p>
        </div>
      ) : showSkeleton ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`metric-skeleton-${index}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="h-3 w-32 rounded-full bg-white/10 animate-pulse" />
                <div className="mt-4 h-7 w-16 rounded-full bg-white/10 animate-pulse" />
                <div className="mt-3 h-3 w-24 rounded-full bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="h-4 w-40 rounded-full bg-white/10 animate-pulse" />
            <div className="mt-5 h-52 w-full rounded-2xl bg-white/5 animate-pulse" />
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:col-span-3">
              <div className="h-4 w-28 rounded-full bg-white/10 animate-pulse" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`page-skeleton-${index}`} className="space-y-2">
                    <div className="h-3 w-48 rounded-full bg-white/10 animate-pulse" />
                    <div className="h-2 w-full rounded-full bg-white/5 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:col-span-2">
              <div className="h-4 w-32 rounded-full bg-white/10 animate-pulse" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`meta-skeleton-${index}`} className="flex items-center justify-between">
                    <div className="h-3 w-28 rounded-full bg-white/10 animate-pulse" />
                    <div className="h-3 w-12 rounded-full bg-white/10 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Unique users (IP)', value: uniqueVisitors.toLocaleString() },
              { label: 'Page views', value: totalVisits.toLocaleString() },
              {
                label: 'Views per user',
                value: viewsPerVisitor.toFixed(1),
              },
            ].map((metricItem) => (
              <div
                key={metricItem.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  {metricItem.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">{metricItem.value}</p>
                <p className="mt-2 text-xs text-white/40">
                  {isLoading ? 'Refreshing...' : `Last ${range}`}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Date range</p>
                <p className="mt-2 text-lg font-semibold text-white">{rangeLabel}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-white/50">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    Visits
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Unique users
                  </span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
                <span>Total visits</span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-white">
                  {totalVisits.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 h-52">
              {!hasMounted ? (
                <div className="flex h-full items-center justify-center text-sm text-white/40">
                  Loading chart...
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-white/40">
                  No chart data yet.
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minHeight={180}
                  minWidth={280}
                  key={animationKey}
                >
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="4 6"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      tickFormatter={(value, index) =>
                        index % labelStep === 0 ? String(value) : ''
                      }
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 15, 20, 0.92)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                      itemStyle={{ color: '#f8fafc' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      name="Visits"
                      stroke="#fb923c"
                      strokeWidth={2}
                      fill="rgba(251,146,60,0.14)"
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                    <Line
                      type="monotone"
                      dataKey="unique"
                      name="Unique users"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3 }}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
            <div
              className="mt-3 grid text-[10px] text-white/40"
              style={{ gridTemplateColumns: `repeat(${labels.length || 1}, minmax(0, 1fr))` }}
            >
              {labels.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className={`text-center ${
                    index % labelStep === 0 ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-white/40">
              Auto-refresh every 30s - Updated {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString('en-GB') : '--'}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:col-span-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Top pages</p>
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  Last {range}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {isLoading && !topPages.length && (
                  <p className="text-sm text-white/50">Loading pages...</p>
                )}
                {!isLoading && topPages.length === 0 && (
                  <p className="text-sm text-white/50">No data yet.</p>
                )}
                {topPages.map((page) => (
                  <div key={page.path} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span className="truncate">{page.path}</span>
                      <span className="text-white/50">{page.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-orange-400/80 transition-[width] duration-700 ease-out"
                        style={{
                          width: topPagesMax ? `${(page.count / topPagesMax) * 100}%` : '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:col-span-2">
              <p className="text-sm font-semibold text-white">Traffic overview</p>
              <div className="mt-4 space-y-4 text-sm text-white/60">
                <div className="flex items-center justify-between">
                  <span>Total events</span>
                  <span className="text-white">{totalVisits.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unique visitors</span>
                  <span className="text-white">{uniqueVisitors.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                      Direct
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {trafficDirect.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                      Referrals
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {trafficReferrals.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                      Top referrers
                    </p>
                    {data?.capped ? (
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                        capped
                      </span>
                    ) : null}
                  </div>
                  {topReferrers.length === 0 ? (
                    <p className="mt-2 text-xs text-white/40">No referrer data yet.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {topReferrers.map((entry) => (
                        <div key={entry.label} className="space-y-1">
                          <div className="flex items-center justify-between gap-3 text-xs text-white/60">
                            <span className="truncate">{entry.label}</span>
                            <span className="text-white/60">{entry.count}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-emerald-400/70 transition-[width] duration-700 ease-out"
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
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/50">
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
