'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type RangeValue = '24h' | '7d' | '30d';

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

const normalizeRange = (value?: string): RangeValue => {
  if (value === '24h' || value === '30d') return value;
  return '7d';
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
  }, [data]);

  useEffect(() => {
    if (!data) return;
    setIsAnimating(false);
    const id = window.requestAnimationFrame(() => setIsAnimating(true));
    return () => window.cancelAnimationFrame(id);
  }, [animationKey, data]);

  const viewSeries = data?.buckets.views ?? [];
  const uniqueSeries = data?.buckets.unique ?? [];
  const chartMax = Math.max(1, ...viewSeries, ...uniqueSeries);

  const labels = data?.buckets.labels ?? [];
  const labelStep = data?.buckets.labelStep ?? 1;
  const topPages = data?.topPages ?? [];
  const topPagesMax = topPages[0]?.count ?? 0;
  const totalVisits = data?.summary.pageViews ?? 0;

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

  const chartPaths = useMemo(() => {
    const values = viewSeries.length ? viewSeries : [];
    const uniques = uniqueSeries.length ? uniqueSeries : [];
    const count = Math.max(values.length, uniques.length, 1);
    const padding = 8;
    const size = 100;
    const inner = size - padding * 2;

    const buildPath = (series: number[]) => {
      if (!series.length) return '';
      return series
        .map((value, index) => {
          const x = padding + (count === 1 ? 0 : (index / (count - 1)) * inner);
          const y = padding + (1 - value / chartMax) * inner;
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
    };

    const buildArea = (series: number[]) => {
      if (!series.length) return '';
      const path = buildPath(series);
      const lastX = padding + inner;
      const baseY = padding + inner;
      return `${path} L ${lastX} ${baseY} L ${padding} ${baseY} Z`;
    };

    return {
      viewPath: buildPath(values),
      viewArea: buildArea(values),
      uniquePath: buildPath(uniques),
      padding,
      size,
      inner,
    };
  }, [viewSeries, uniqueSeries, chartMax]);

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
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Date range</p>
                <p className="mt-2 text-lg font-semibold text-white">{rangeLabel}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-white/50">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
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
                  {totalVisits}
                </span>
              </div>
            </div>

            <div className="mt-6 h-48">
              <svg
                key={animationKey}
                viewBox="0 0 100 100"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="visits-line" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="visits-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="users-line" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.7" />
                  </linearGradient>
                </defs>

                <g stroke="rgba(255,255,255,0.08)" strokeWidth="0.6">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const y =
                      chartPaths.padding + (index / 4) * (chartPaths.size - chartPaths.padding * 2);
                    return <line key={index} x1="0" y1={y} x2="100" y2={y} />;
                  })}
                </g>

                {chartPaths.viewArea && (
                  <path
                    d={chartPaths.viewArea}
                    fill="url(#visits-area)"
                    style={{
                      opacity: isAnimating ? 1 : 0,
                      transition: 'opacity 800ms ease',
                    }}
                  />
                )}

                {chartPaths.uniquePath && (
                  <path
                    d={chartPaths.uniquePath}
                    fill="none"
                    stroke="url(#users-line)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    pathLength={1}
                    style={{
                      strokeDasharray: '1 1',
                      strokeDashoffset: isAnimating ? 0 : 1,
                      transition: 'stroke-dashoffset 900ms ease',
                    }}
                  />
                )}

                {chartPaths.viewPath && (
                  <path
                    d={chartPaths.viewPath}
                    fill="none"
                    stroke="url(#visits-line)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    pathLength={1}
                    style={{
                      strokeDasharray: '1 1',
                      strokeDashoffset: isAnimating ? 0 : 1,
                      transition: 'stroke-dashoffset 950ms ease',
                    }}
                  />
                )}

                {viewSeries.map((value, index) => {
                  const count = viewSeries.length;
                  const padding = chartPaths.padding;
                  const inner = chartPaths.inner;
                  const x = padding + (count === 1 ? 0 : (index / (count - 1)) * inner);
                  const y = padding + (1 - value / chartMax) * inner;
                  return (
                    <circle
                      key={`view-${index}`}
                      cx={x}
                      cy={y}
                      r="1.6"
                      fill="#f59e0b"
                      style={{
                        opacity: isAnimating ? 1 : 0,
                        transition: 'opacity 500ms ease',
                        transitionDelay: `${index * 35}ms`,
                      }}
                    />
                  );
                })}

                {uniqueSeries.map((value, index) => {
                  const count = uniqueSeries.length;
                  const padding = chartPaths.padding;
                  const inner = chartPaths.inner;
                  const x = padding + (count === 1 ? 0 : (index / (count - 1)) * inner);
                  const y = padding + (1 - value / chartMax) * inner;
                  return (
                    <circle
                      key={`unique-${index}`}
                      cx={x}
                      cy={y}
                      r="1.2"
                      fill="#34d399"
                      style={{
                        opacity: isAnimating ? 1 : 0,
                        transition: 'opacity 500ms ease',
                        transitionDelay: `${index * 35}ms`,
                      }}
                    />
                  );
                })}
              </svg>
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
