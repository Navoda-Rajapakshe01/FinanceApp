"use client";

import React from "react";
import Link from "next/link";
import { Bell, LogOut, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Wallet } from "lucide-react";

export default function DashboardPage() {
	const userName = "User"; // This would come from backend/auth

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div>
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-lg">C</span>
							</div>
							<h1 className="text-xl font-bold text-gray-900">CashSpace</h1>
						</div>
						<p className="text-sm text-gray-600 mt-1">Welcome back, {userName}</p>
					</div>
					<div className="flex items-center gap-4">
						<button className="relative p-2 text-gray-600 hover:text-gray-900">
							<Bell size={20} />
							<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
						</button>
						<Link href="/">
							<button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg">
								<LogOut size={18} />
								<span className="text-sm">Logout</span>
							</button>
						</Link>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-6 py-8">
				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					{/* Total Income */}
					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center justify-between mb-2">
							<p className="text-sm text-gray-600">Total Income</p>
							<TrendingUp size={18} className="text-green-500" />
						</div>
						<h2 className="text-3xl font-bold text-gray-900">LKR 0.00</h2>
						<p className="text-xs text-gray-500 mt-1">January 2026</p>
					</div>

					{/* Total Expenses */}
					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center justify-between mb-2">
							<p className="text-sm text-gray-600">Total Expenses</p>
							<TrendingDown size={18} className="text-red-500" />
						</div>
						<h2 className="text-3xl font-bold text-gray-900">LKR 0.00</h2>
						<p className="text-xs text-gray-500 mt-1">January 2026</p>
					</div>

					{/* Current Balance */}
					<div className="bg-gradient-to-r from-teal-500 to-green-500 rounded-xl shadow-sm p-6 text-white">
						<div className="flex items-center justify-between mb-2">
							<p className="text-sm">Current Balance</p>
							<DollarSign size={18} />
						</div>
						<h2 className="text-3xl font-bold">LKR 0.00</h2>
						<p className="text-xs mt-1 opacity-90">No balance yet</p>
					</div>
				</div>

				{/* Navigation Tabs */}
				<div className="bg-white rounded-xl shadow-sm mb-8">
					<div className="flex items-center gap-8 px-6 py-4 border-b overflow-x-auto">
						<button className="flex items-center gap-2 text-teal-600 font-medium pb-1 border-b-2 border-teal-600 whitespace-nowrap">
							<PieChart size={18} />
							Overview
						</button>
						<button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 whitespace-nowrap">
							<TrendingDown size={18} />
							Expenses
						</button>
						<button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 whitespace-nowrap">
							<TrendingUp size={18} />
							Incomes
						</button>
						<button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 whitespace-nowrap">
							<Wallet size={18} />
							Goals
						</button>
						<button className="text-gray-600 hover:text-gray-900 whitespace-nowrap">
							Insights & Recommendations
						</button>
						<button className="text-gray-600 hover:text-gray-900 whitespace-nowrap">
							Consultants
						</button>
					</div>
				</div>

				{/* Charts Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					{/* Spending by Category */}
					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
								<PieChart size={20} className="text-purple-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Spending by Category</h3>
								<p className="text-sm text-gray-500">Distribution of your expenses</p>
							</div>
						</div>
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<PieChart size={32} className="text-gray-400" />
								</div>
								<p className="text-gray-500 font-medium">No expenses yet</p>
								<p className="text-sm text-gray-400 mt-1">Start adding expenses to see your spending breakdown</p>
							</div>
						</div>
					</div>

					{/* Income vs Expenses */}
					<div className="bg-white rounded-xl shadow-sm p-6">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
								<BarChart3 size={20} className="text-blue-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Income vs Expenses</h3>
								<p className="text-sm text-gray-500">Monthly comparison</p>
							</div>
						</div>
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<BarChart3 size={32} className="text-gray-400" />
								</div>
								<p className="text-gray-500 font-medium">No data available</p>
								<p className="text-sm text-gray-400 mt-1">Add income and expenses to see your financial overview</p>
							</div>
						</div>
					</div>
				</div>

				{/* Recent Transactions */}
				<div className="bg-white rounded-xl shadow-sm p-6">
					<h3 className="font-semibold text-gray-900 mb-6">Recent Transactions</h3>
					<div className="flex flex-col items-center justify-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<Wallet size={32} className="text-gray-400" />
						</div>
						<p className="text-gray-500 font-medium">No transactions yet</p>
						<p className="text-sm text-gray-400 mt-2 text-center max-w-md">
							Start tracking your finances by adding your first income or expense
						</p>
						<div className="flex gap-3 mt-6">
							<button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
								Add Income
							</button>
							<button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
								Add Expense
							</button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
