'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
);

type Point = {
  label: string;
  visits: number;
  unique: number;
};

export default function AdminAnalyticsLineChart({
  points,
}: {
  points: Point[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<'line'> | null>(null);

  const labels = useMemo(() => points.map((p) => p.label), [points]);
  const visits = useMemo(() => points.map((p) => p.visits), [points]);
  const unique = useMemo(() => points.map((p) => p.unique), [points]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Always recreate to avoid stale datasets/options when range changes.
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const maxValue = Math.max(1, ...visits, ...unique);

    const data: ChartData<'line'> = {
      labels,
      datasets: [
        {
          label: 'Visits',
          data: visits,
          borderColor: '#d14a4a',
          backgroundColor: 'rgba(209,74,74,0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'Unique users',
          data: unique,
          borderColor: '#f4f4f5',
          backgroundColor: 'rgba(244,244,245,0)',
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 900,
        easing: 'easeOutQuart',
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#111111',
          borderColor: '#2b1515',
          borderWidth: 1,
          titleColor: 'rgba(255,255,255,0.7)',
          bodyColor: '#f8fafc',
          padding: 10,
          cornerRadius: 8,
          displayColors: true,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
            color: 'rgba(255,255,255,0.5)',
            maxRotation: 0,
            autoSkip: true,
          },
          border: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax: Math.ceil(maxValue * 1.15),
          grid: {
            color: 'rgba(255,255,255,0.08)',
          },
          ticks: {
            color: 'rgba(255,255,255,0.5)',
          },
          border: {
            display: false,
          },
        },
      },
    };

    chartRef.current = new Chart(canvas, {
      type: 'line',
      data,
      options,
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, visits, unique]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
