'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type RangeValue = '24h' | '7d' | '30d';
type MetricValue = 'users' | 'views';

type AnalyticsPayload = {
  ok: boolean;
  range: RangeValue;
  summary: {
    uniqueVisitors: number;
    pageViews: number;
    viewsPerVisitor: number;
  };
  buckets: {
    labels: string[];
    views: number[];
    unique: number[];
    labelStep: number;
  };
  topPages: { path: string; count: number }[];
  generatedAt: string;
  error?: string;
};

const rangeOptions: RangeValue[] = ['24h', '7d', '30d'];
const metricOptions: { id: MetricValue; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'views', label: 'Views' },
];

const normalizeRange = (value?: string): RangeValue => {
  if (value === '24h' || value === '30d') return value;
  return '7d';
};

const normalizeMetric = (value?: string): MetricValue => {
  if (value === 'views') return 'views';
  return 'users';
};

export default function AdminAnalytics({
  initialRange,
  initialMetric,
}: {
  initialRange?: string;
  initialMetric?: string;
}) {
  const [range, setRange] = useState<RangeValue>(normalizeRange(initialRange));
  const [metric, setMetric] = useState<MetricValue>(normalizeMetric(initialMetric));
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const refreshTimer = useRef<number | null>(null);

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
  }, [data, metric]);

  useEffect(() => {
    if (!data) return;
    setIsAnimating(false);
    const id = window.requestAnimationFrame(() => setIsAnimating(true));
    return () => window.cancelAnimationFrame(id);
  }, [animationKey, data]);

  const chartSeries = useMemo(() => {
    if (!data) return [];
    return metric === 'views' ? data.buckets.views : data.buckets.unique;
  }, [data, metric]);

  const chartMax = Math.max(1, ...chartSeries);
  const labels = data?.buckets.labels ?? [];
  const labelStep = data?.buckets.labelStep ?? 1;
  const topPages = data?.topPages ?? [];
  const topPagesMax = topPages[0]?.count ?? 0;

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
              className={`rounded-full px-3 py-1 transition ${
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
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Unique users', value: data?.summary.uniqueVisitors ?? 0 },
              { label: 'Page views', value: data?.summary.pageViews ?? 0 },
              {
                label: 'Views per user',
                value: data ? data.summary.viewsPerVisitor.toFixed(1) : '0.0',
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
                <p className="text-sm font-semibold text-white">Traffic trend</p>
                <p className="text-xs text-white/40">
                  {metric === 'views' ? 'Page views' : 'Unique users'} per
                  {range === '24h' ? ' hour' : ' day'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                {metricOptions.map((metricOption) => (
                  <button
                    key={metricOption.id}
                    type="button"
                    onClick={() => setMetric(metricOption.id)}
                    className={`rounded-full px-3 py-1 transition ${
                      metric === metricOption.id
                        ? 'bg-white text-black'
                        : 'text-white/60 hover:text-white'
                    }`}
                    aria-pressed={metric === metricOption.id}
                  >
                    {metricOption.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 h-32">
              <div className="flex h-full items-end gap-1">
                {chartSeries.map((value, index) => (
                  <div key={`${animationKey}-${index}`} className="group flex h-full flex-1 items-end">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-red-500/80 via-red-400/80 to-red-300/80 transition-[height,transform] duration-700 ease-out group-hover:scale-y-105"
                      style={{
                        height: isAnimating ? `${(value / chartMax) * 100}%` : '2px',
                        minHeight: isAnimating && value ? '6%' : '2px',
                        transitionDelay: `${index * 30}ms`,
                      }}
                      title={`${labels[index] ?? ''}: ${value}`}
                    />
                  </div>
                ))}
              </div>
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
                        className="h-full rounded-full bg-gradient-to-r from-red-500/80 via-red-400/80 to-red-300/80 transition-[width] duration-700 ease-out"
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
                  <span className="text-white">{data?.summary.pageViews ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unique visitors</span>
                  <span className="text-white">{data?.summary.uniqueVisitors ?? 0}</span>
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
