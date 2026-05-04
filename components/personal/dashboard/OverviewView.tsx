"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Wallet,
  Calendar,
} from "lucide-react";
import BalanceCards from "./BalanceCards";
import SpendingPie from "./SpendingPie";
import IncomeExpenseBar from "./IncomeExpenseBar";

interface OverviewViewProps {
  onTabChange: (tab: string) => void;
}

export default function OverviewView({ onTabChange }: OverviewViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(2000, index, 1);
    return {
      value: String(index + 1).padStart(2, "0"),
      label: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
      fullName: new Intl.DateTimeFormat("en", { month: "long" }).format(date),
    };
  });

  const handleMonthClick = (monthValue: string) => {
    setSelectedMonth(`${selectedYear}-${monthValue}`);
    setIsCalendarOpen(false);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    const newYear = direction === "next" ? selectedYear + 1 : selectedYear - 1;
    if (newYear >= 2020 && newYear <= 2030) {
      setSelectedYear(newYear);
    }
  };

  const currentSelectedMonth = selectedMonth.split("-")[1];
  const selectedMonthName =
    months.find((m) => m.value === currentSelectedMonth)?.fullName || "January";

  const getMonthDateRange = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  };

  // chart responsibilities moved to components

  const generateColors = (n: number) =>
    Array.from({ length: n }, (_, i) => `hsl(${Math.round((i * 360) / n)}, 65%, 55%)`);

  // Chart fetching/rendering moved into separate components below

  return (
    <>
      {/* Calendar Dropdown Filter */}
      <div className="mb-6 relative">
        <div className="flex items-center justify-end">
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Calendar size={18} />
            <span>
              {selectedMonthName} {selectedYear}
            </span>
          </button>
        </div>

        {/* Calendar Dropdown Box */}
        {isCalendarOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-teal-200 p-6 z-50 w-80">
            {/* Year Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleYearChange("prev")}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h3 className="text-xl font-bold text-gray-900">
                {selectedYear}
              </h3>
              <button
                onClick={() => handleYearChange("next")}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-3 gap-2">
              {months.map((month) => (
                <button
                  key={month.value}
                  onClick={() => handleMonthClick(month.value)}
                  className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${currentSelectedMonth === month.value &&
                    selectedYear === parseInt(selectedMonth.split("-")[0])
                    ? "bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                >
                  {month.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <BalanceCards selectedMonth={selectedMonth} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <SpendingPie selectedMonth={selectedMonth} />
        <IncomeExpenseBar selectedMonth={selectedMonth} />
      </div>
    </>
  );
}
