"use client";

import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface Props {
  totalIncome?: number;
  totalExpense?: number;
  selectedMonth?: string;
}

export default function BalanceCards({ totalIncome: incomeProp, totalExpense: expenseProp, selectedMonth }: Props) {
  const [totalIncome, setTotalIncome] = React.useState<number>(incomeProp ?? 0);
  const [totalExpense, setTotalExpense] = React.useState<number>(expenseProp ?? 0);
  

  const formatCurrency = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const remaining = totalIncome - totalExpense;

  const savingsPercent = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const shouldShowSavings = (() => {
    if (!selectedMonth) return false;
    const [y, m] = selectedMonth.split("-").map(Number);
    const end = new Date(y, m, 0, 23, 59, 59, 999);
    const now = new Date();
    return now >= end && totalIncome > 0;
  })();

  

  React.useEffect(() => {
    let mounted = true;
    if (!selectedMonth) return;

    const fetchTotals = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const [expRes, incRes] = await Promise.all([
          fetch(`/api/expense/expenses?month=${selectedMonth}`, headers ? { headers } : undefined),
          fetch(`/api/income/incomes?month=${selectedMonth}`, headers ? { headers } : undefined),
        ]);
        const expData = await expRes.json().catch(() => ({}));
        const incData = await incRes.json().catch(() => ({}));
        const expenses = expData.expenses || [];
        const incomes = incData.incomes || [];
        const [startDate, endDate] = (() => {
          const [y, m] = selectedMonth.split("-").map(Number);
          const sd = new Date(y, m - 1, 1);
          sd.setHours(0, 0, 0, 0);
          const ed = new Date(y, m, 0, 23, 59, 59, 999);
          return [sd, ed];
        })();
        const monthExpenses = expenses.filter((e: any) => {
          const d = new Date(e.date);
          return d >= (startDate as Date) && d <= (endDate as Date);
        });
        const monthIncomes = incomes.filter((i: any) => {
          const d = new Date(i.date);
          return d >= (startDate as Date) && d <= (endDate as Date);
        });
        const tExp = monthExpenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
        const tInc = monthIncomes.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
        if (mounted) {
          setTotalExpense(tExp);
          setTotalIncome(tInc);
        }
      } catch (err) {
        console.error("BalanceCards fetch error:", err);
      }
    };

    fetchTotals();

    return () => {
      mounted = false;
    };
  }, [selectedMonth]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600">LKR {formatCurrency(totalIncome)}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Expense</p>
            <p className="text-2xl font-bold text-red-600">LKR {formatCurrency(totalExpense)}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <TrendingDown className="text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Remaining Balance</p>
            <p className={`text-2xl font-bold ${remaining >= 0 ? "text-teal-600" : "text-rose-600"}`}>
              LKR {formatCurrency(remaining)}
            </p>
          </div>
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
            <Wallet className="text-teal-600" />
          </div>
        </div>
      </div>
      {shouldShowSavings && (
        <div className="sm:col-span-3 relative">
              <div
                className={`mt-2 p-4 rounded-2xl text-center flex items-center justify-center gap-3 transition ${
                  savingsPercent > 0
                    ? "bg-emerald-50 border border-emerald-200 shadow-lg"
                    : "bg-indigo-50 border border-indigo-100"
                }`}
                role="status"
              >
                {savingsPercent > 0 ? (
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shadow-md">
                    <TrendingUp className="text-emerald-600" />
                  </div>
                ) : savingsPercent < 0 ? (
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shadow-sm">
                    <TrendingDown className="text-rose-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                    <TrendingUp className="text-indigo-600" />
                  </div>
                )}
            <p className={`text-sm font-medium ${savingsPercent > 0 ? "text-emerald-700" : "text-indigo-700"}`}>
              You saved <span className="font-semibold">{savingsPercent}%</span> this month
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
