"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, PieChart, BarChart3, Wallet, Calendar } from "lucide-react";

interface OverviewViewProps {
  onTabChange: (tab: string) => void;
}

export default function OverviewView({ onTabChange }: OverviewViewProps) {
	const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
	const [selectedYear, setSelectedYear] = useState(2026);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	const months = [
		{ value: "01", label: "Jan", fullName: "January" },
		{ value: "02", label: "Feb", fullName: "February" },
		{ value: "03", label: "Mar", fullName: "March" },
		{ value: "04", label: "Apr", fullName: "April" },
		{ value: "05", label: "May", fullName: "May" },
		{ value: "06", label: "Jun", fullName: "June" },
		{ value: "07", label: "Jul", fullName: "July" },
		{ value: "08", label: "Aug", fullName: "August" },
		{ value: "09", label: "Sep", fullName: "September" },
		{ value: "10", label: "Oct", fullName: "October" },
		{ value: "11", label: "Nov", fullName: "November" },
		{ value: "12", label: "Dec", fullName: "December" },
	];

	const handleMonthClick = (monthValue: string) => {
		setSelectedMonth(`${selectedYear}-${monthValue}`);
		setIsCalendarOpen(false);
	};

	const handleYearChange = (direction: 'prev' | 'next') => {
		const newYear = direction === 'next' ? selectedYear + 1 : selectedYear - 1;
		if (newYear >= 2020 && newYear <= 2030) {
			setSelectedYear(newYear);
		}
	};

	const currentSelectedMonth = selectedMonth.split("-")[1];
	const selectedMonthName = months.find(m => m.value === currentSelectedMonth)?.fullName || "January";

	return (
		<>
			{/* Calendar Dropdown Filter */}
			<div className="mb-6 relative">
				<div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
								<Calendar size={20} className="text-white" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Filter by Month</h3>
								<p className="text-xs text-gray-500">View data for a specific period</p>
							</div>
						</div>
						<button
							onClick={() => setIsCalendarOpen(!isCalendarOpen)}
							className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
						>
							<Calendar size={18} />
							<span>{selectedMonthName} {selectedYear}</span>
						</button>
					</div>
				</div>

				{/* Calendar Dropdown Box */}
				{isCalendarOpen && (
					<div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-teal-200 p-6 z-50 w-80">
						{/* Year Navigation */}
						<div className="flex items-center justify-between mb-4">
							<button
								onClick={() => handleYearChange('prev')}
								className="p-2 hover:bg-gray-100 rounded-lg transition"
							>
								<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<h3 className="text-xl font-bold text-gray-900">{selectedYear}</h3>
							<button
								onClick={() => handleYearChange('next')}
								className="p-2 hover:bg-gray-100 rounded-lg transition"
							>
								<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>

						{/* Month Grid */}
						<div className="grid grid-cols-3 gap-2">
							{months.map((month) => (
								<button
									key={month.value}
									onClick={() => handleMonthClick(month.value)}
									className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
										currentSelectedMonth === month.value && selectedYear === parseInt(selectedMonth.split("-")[0])
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
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				{/* Spending by Category */}
				<div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200 hover:shadow-xl transition overflow-hidden">
					<div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
					<div className="relative">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
								<PieChart size={24} className="text-white" />
							</div>
							<div>
								<h3 className="font-bold text-gray-900">Spending by Category</h3>
								<p className="text-sm text-purple-700">Distribution of your expenses</p>
							</div>
						</div>
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
									<PieChart size={40} className="text-white" />
								</div>
								<p className="text-gray-700 font-semibold text-lg">No expenses yet</p>
								<p className="text-sm text-purple-600 mt-2 max-w-xs">
									Start adding expenses to see your beautiful spending breakdown 📊
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Income vs Expenses */}
				<div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200 hover:shadow-xl transition overflow-hidden">
					<div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
					<div className="relative">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
								<BarChart3 size={24} className="text-white" />
							</div>
							<div>
								<h3 className="font-bold text-gray-900">Income vs Expenses</h3>
								<p className="text-sm text-blue-700">Monthly comparison</p>
							</div>
						</div>
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
									<BarChart3 size={40} className="text-white" />
								</div>
								<p className="text-gray-700 font-semibold text-lg">No data available</p>
								<p className="text-sm text-blue-600 mt-2 max-w-xs">
									Track income and expenses to visualize your financial trends 📈
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Transactions */}
			<div className="relative bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl shadow-lg p-8 border-2 border-gray-200 overflow-hidden">
				<div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-200 rounded-full blur-3xl opacity-20"></div>
				<div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
				<div className="relative">
					<div className="flex items-center gap-3 mb-8">
						<div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center shadow-md">
							<Wallet size={20} className="text-white" />
						</div>
						<h3 className="font-bold text-gray-900 text-xl">Recent Transactions</h3>
					</div>
					<div className="flex flex-col items-center justify-center py-12">
						<div className="w-24 h-24 bg-gradient-to-br from-teal-400 via-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl animate-pulse">
							<Wallet size={40} className="text-white" />
						</div>
						<p className="text-gray-800 font-bold text-xl">No transactions yet</p>
						<p className="text-sm text-gray-600 mt-3 text-center max-w-md">
							🚀 Start your financial journey by adding your first income or expense!
						</p>
						<div className="flex gap-4 mt-8">
						<button 
							onClick={() => onTabChange("incomes")}
							className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
						>
							<TrendingUp size={20} />
							Add Income
						</button>
						<button 
							onClick={() => onTabChange("expenses")}
							className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
						>
								<TrendingDown size={20} />
								Add Expense
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
