"use client";

import React from "react";
import { TrendingUp, Activity, Wallet, DollarSign, PieChart, BarChart3, Lightbulb, Target, TrendingDown, Sparkles } from "lucide-react";

export default function InsightsView() {
	return (
		<div>
			{/* Page Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Financial Insights & Analysis</h1>
				<p className="text-gray-600 mt-1">Understand your spending patterns and make smarter financial decisions</p>
			</div>

			{/* Personalized Recommendations */}
			<div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
						<Lightbulb size={20} className="text-white" />
					</div>
					<div>
						<h3 className="font-bold text-gray-900 text-xl">Personalized Recommendations</h3>
						<p className="text-sm text-gray-600">AI-powered insights to improve your finances</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Start Tracking */}
					<div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition">
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
								<Lightbulb size={24} className="text-yellow-600" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold text-gray-900 mb-2">Start Tracking Your Finances</h4>
								<p className="text-sm text-gray-600 mb-3">
									Begin your financial journey by recording your daily income and expenses. This helps you understand where your money goes.
								</p>
								<div className="flex gap-2">
									<span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Getting Started</span>
									<span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Basic</span>
								</div>
							</div>
						</div>
					</div>

					{/* Set Goals */}
					<div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition">
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
								<Target size={24} className="text-teal-600" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold text-gray-900 mb-2">Set Your Financial Goals</h4>
								<p className="text-sm text-gray-600 mb-3">
									Define clear financial targets like saving for emergencies, vacations, or major purchases to stay motivated.
								</p>
								<div className="flex gap-2">
									<span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">Goal Setting</span>
									<span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Planning</span>
								</div>
							</div>
						</div>
					</div>

					{/* Build Budget */}
					<div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition">
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
								<DollarSign size={24} className="text-green-600" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold text-gray-900 mb-2">Create a Monthly Budget</h4>
								<p className="text-sm text-gray-600 mb-3">
									Allocate your income wisely by setting spending limits for different categories to avoid overspending.
								</p>
								<div className="flex gap-2">
									<span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Budgeting</span>
									<span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Control</span>
								</div>
							</div>
						</div>
					</div>

					{/* Great Start */}
					<div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition">
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
								<Sparkles size={24} className="text-blue-600" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold text-gray-900 mb-2">You're Off to a Great Start!</h4>
								<p className="text-sm text-gray-600 mb-3">
									Welcome to CashSpace! Start small by adding your first transaction and watch your financial insights grow over time.
								</p>
								<div className="flex gap-2">
									<span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Motivation</span>
									<span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">Welcome</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
