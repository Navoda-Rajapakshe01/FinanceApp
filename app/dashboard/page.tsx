"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  LogOut,
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
} from "lucide-react";
import OverviewView from "@/components/personal/OverviewView";
import ExpensesView from "@/components/personal/ExpensesView";
import IncomesView from "@/components/personal/IncomesView";
import GoalsView from "@/components/personal/GoalsView";
import InsightsView from "@/components/personal/InsightsView";
import ConsultantsView from "@/components/personal/ConsultantsView";

export default function DashboardPage() {
  const [userName, setUserName] = useState("there");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser) as { fullName?: string };
      if (parsedUser.fullName) {
        setUserName(parsedUser.fullName);
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-2">
          <nav className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="CashSpace"
                  width={264}
                  height={64}
                  priority
                  className="object-contain cursor-pointer"
                />
              </Link>
            </div>
            <div className="flex items-center gap-8">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition">
                  <LogOut size={18} />
                  <span className="text-sm">Logout</span>
                </button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
            Hi, {userName}!
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Here's your financial overview for January 2026{" "}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Income */}
          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-200 hover:shadow-xl transition-shadow group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  +0%
                </span>
              </div>
              <p className="text-sm font-medium text-green-700 mb-1">
                Total Income
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                LKR 0.00
              </h2>
              <p className="text-xs text-gray-600">January 2026</p>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 border-2 border-orange-200 hover:shadow-xl transition-shadow group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingDown size={24} className="text-white" />
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                  0%
                </span>
              </div>
              <p className="text-sm font-medium text-orange-700 mb-1">
                Total Expenses
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                LKR 0.00
              </h2>
              <p className="text-xs text-gray-600">January 2026</p>
            </div>
          </div>

          {/* Current Balance */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200 hover:shadow-xl transition-shadow group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet size={24} className="text-white" />
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  Current
                </span>
              </div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                Available Balance
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                LKR 0.00
              </h2>
              <p className="text-xs text-gray-600">Ready to start tracking!</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="flex items-center gap-4 px-6 py-5 overflow-x-auto">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === "overview" 
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <PieChart size={18} />
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("expenses")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === "expenses" 
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <TrendingDown size={18} />
              Expenses
            </button>
            <button 
              onClick={() => setActiveTab("incomes")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === "incomes" 
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <TrendingUp size={18} />
              Incomes
            </button>
            <button 
              onClick={() => setActiveTab("goals")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === "goals" 
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Wallet size={18} />
              Goals
            </button>
            <button 
              onClick={() => setActiveTab("insights")}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === "insights" 
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Insights
            </button>
            <button 
              onClick={() => setActiveTab("consultants")}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === "consultants" 
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Consultants
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewView onTabChange={setActiveTab} />}
        {activeTab === "expenses" && <ExpensesView />}
        {activeTab === "incomes" && <IncomesView />}
        {activeTab === "goals" && <GoalsView />}
        {activeTab === "insights" && <InsightsView />}
        {activeTab === "consultants" && <ConsultantsView />}
      </main>
    </div>
  );
}
