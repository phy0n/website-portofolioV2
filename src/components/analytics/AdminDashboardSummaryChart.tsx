'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Metric = {
  label: string;
  value: number;
};

export default function AdminDashboardSummaryChart({
  metrics,
}: {
  metrics: Metric[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<'bar'> | null>(null);

  const labels = useMemo(() => metrics.map((m) => m.label), [metrics]);
  const values = useMemo(() => metrics.map((m) => m.value), [metrics]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const maxValue = Math.max(1, ...values);

    const data: ChartData<'bar'> = {
      labels,
      datasets: [
        {
          label: 'Items',
          data: values,
          backgroundColor: 'rgba(59,130,246,0.25)',
          borderColor: 'rgba(59,130,246,0.75)',
          borderWidth: 1,
          borderRadius: 10,
          barPercentage: 0.7,
          categoryPercentage: 0.75,
        },
      ],
    };

    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 900,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 15, 20, 0.92)',
          borderColor: 'rgba(255,255,255,0.15)',
          borderWidth: 1,
          titleColor: 'rgba(255,255,255,0.7)',
          bodyColor: '#f8fafc',
          padding: 10,
          cornerRadius: 12,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: 'rgba(255,255,255,0.55)',
            maxRotation: 0,
            autoSkip: true,
          },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          suggestedMax: Math.ceil(maxValue * 1.15),
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: { color: 'rgba(255,255,255,0.55)' },
          border: { display: false },
        },
      },
    };

    chartRef.current = new Chart(canvas, {
      type: 'bar',
      data,
      options,
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, values]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
