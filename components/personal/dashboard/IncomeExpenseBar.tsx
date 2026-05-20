"use client";

import React, { useEffect, useRef, useState } from "react";

interface Props {
  selectedMonth: string;
}

export default function IncomeExpenseBar({ selectedMonth }: Props) {
  const [barData, setBarData] = useState<{ labels: string[]; values: number[] } | null>(null);
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
        const [expRes, incRes] = await Promise.all([
          fetch(`/api/personal/expense/expenses?month=${selectedMonth}`, headers ? { headers } : undefined),
          fetch(`/api/personal/income/incomes?month=${selectedMonth}`, headers ? { headers } : undefined),
        ]);
        const expData = await expRes.json().catch(() => ({}));
        const incData = await incRes.json().catch(() => ({}));
        const expenses = expData.expenses || [];
        const incomes = incData.incomes || [];
        const { startDate, endDate } = getMonthDateRange();
        const monthExpenses = expenses.filter((e: any) => {
          const d = new Date(e.date);
          return d >= startDate && d <= endDate;
        });
        const monthIncomes = incomes.filter((i: any) => {
          const d = new Date(i.date);
          return d >= startDate && d <= endDate;
        });
        const totalExpense = monthExpenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
        const totalIncome = monthIncomes.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
        if (mounted) setBarData({ labels: ["Income", "Expense"], values: [totalIncome, totalExpense] });
      } catch (error) {
        console.error("IncomeExpenseBar fetch error:", error);
        if (mounted) setBarData(null);
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

      if (barData && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        chartRef.current = new (Chart as any)(ctx, {
          type: "bar",
          data: {
            labels: barData.labels,
            datasets: [
              {
                label: "Amount",
                data: barData.values,
                backgroundColor: ["#10b981", "#ef4444"],
              },
            ],
          },
          options: {
            plugins: { legend: { display: false } },
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
      }
    })();
  }, [barData]);

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200 hover:shadow-xl transition overflow-hidden">
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Income vs Expenses</h3>
            <p className="text-sm text-blue-700">Monthly comparison</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading chart...</p>
              </div>
            ) : barData ? (
              <div className="h-64">
                <canvas ref={canvasRef} />
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"></div>
                <p className="text-gray-700 font-semibold text-lg">No data available</p>
                <p className="text-sm text-blue-600 mt-2 max-w-xs">Track income and expenses to visualize your financial trends</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
