"use client";

import React from "react";
import { TrendingUp, TrendingDown, PieChart, BarChart3, Wallet } from "lucide-react";

export default function OverviewView() {
	return (
		<>
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
							<button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
								<TrendingUp size={20} />
								Add Income
							</button>
							<button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
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
