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
import OverviewView from "@/components/personal/dashboard/OverviewView";
import ExpensesView from "@/components/personal/expenses/ExpensesView";
import IncomesView from "@/components/personal/incomes/IncomesView";
import GoalsView from "@/components/personal/goals/GoalsView";
import InsightsView from "@/components/personal/dashboard/InsightsView";
import ConsultantsView from "@/components/personal/dashboard/ConsultantsView";

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
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="flex items-center justify-center gap-16 px-6 py-5 overflow-x-auto">
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
        {activeTab === "overview" && (
          <OverviewView onTabChange={setActiveTab} />
        )}
        {activeTab === "expenses" && <ExpensesView />}
        {activeTab === "incomes" && <IncomesView />}
        {activeTab === "goals" && <GoalsView />}
        {activeTab === "insights" && <InsightsView />}
        {activeTab === "consultants" && <ConsultantsView />}
      </main>
    </div>
  );
}
