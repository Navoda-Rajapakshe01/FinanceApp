"use client";

import React, { useEffect, useRef, useState } from "react";

interface Props {
  selectedMonth: string;
}

const generateColors = (n: number) =>
  Array.from({ length: n }, (_, i) => `hsl(${Math.round((i * 360) / n)}, 65%, 55%)`);

export default function SpendingPie({ selectedMonth }: Props) {
  const [chartData, setChartData] = useState<{ labels: string[]; values: number[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);

  const getMonthDateRange = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await fetch(`/api/expense/expenses?month=${selectedMonth}`, headers ? { headers } : undefined);
        const data = await res.json().catch(() => ({}));
        const expenses = data.expenses || [];
        const { startDate, endDate } = getMonthDateRange();
        const monthExpenses = expenses.filter((e: any) => {
          const d = new Date(e.date);
          return d >= startDate && d <= endDate;
        });
        const map: Record<string, number> = {};
        monthExpenses.forEach((e: any) => {
          const key = e.category || "Other";
          map[key] = (map[key] || 0) + Number(e.amount || 0);
        });
        const labels = Object.keys(map);
        const values = labels.map((l) => map[l]);
        if (mounted) setChartData(labels.length ? { labels, values } : null);
      } catch (error) {
        console.error("SpendingPie fetch error:", error);
        if (mounted) setChartData(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
      if (chartRef.current) {
        try {
          chartRef.current.destroy();
        } catch {}
        chartRef.current = null;
      }
    };
  }, [selectedMonth]);

  useEffect(() => {
    if (!canvasRef.current) return;
    let Chart: any;
    (async () => {
      try {
        Chart = (await import("chart.js/auto")).default;
      } catch (e) {
        Chart = (await import("chart.js/auto"));
      }

      if (chartRef.current) {
        try {
          chartRef.current.destroy();
        } catch {}
        chartRef.current = null;
      }

      if (chartData && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        chartRef.current = new (Chart as any)(ctx, {
          type: "pie",
          data: {
            labels: chartData.labels,
            datasets: [
              {
                data: chartData.values,
                backgroundColor: generateColors(chartData.labels.length),
              },
            ],
          },
          options: {
            plugins: { legend: { position: "bottom" } },
            maintainAspectRatio: false,
          },
        });
      }
    })();
  }, [chartData]);

  return (
    <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200 hover:shadow-xl transition overflow-hidden">
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Spending by Category</h3>
            <p className="text-sm text-purple-700">Distribution of your expenses</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading chart...</p>
              </div>
            ) : chartData ? (
              <div className="h-64">
                <canvas ref={canvasRef} />
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                </div>
                <p className="text-gray-700 font-semibold text-lg">No expenses yet</p>
                <p className="text-sm text-purple-600 mt-2 max-w-xs">Start adding expenses</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
