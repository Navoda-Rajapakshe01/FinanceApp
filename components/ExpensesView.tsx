"use client";

import React, { useState } from "react";
import { TrendingDown, Plus, Edit2, Trash2 } from "lucide-react";

interface Expense {
	id: string;
	title: string;
	category: string;
	date: string;
	amount: number;
}

export default function ExpensesView() {
	// Sample expense data (would come from backend)
	const [expenses, setExpenses] = useState<Expense[]>([]);

	return (
		<div>
			{/* Page Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
					<p className="text-gray-600 mt-1">Track and manage your expenses</p>
				</div>
				<button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:bg-red-700 hover:shadow-xl transition">
					<Plus size={20} />
					Add Expense
				</button>
			</div>

			{/* Expenses List */}
			<div className="bg-white rounded-2xl shadow-lg border border-gray-100">
				{expenses.length > 0 ? (
					<div className="divide-y divide-gray-100">
						{expenses.map((expense) => (
							<div
								key={expense.id}
								className="p-6 flex items-center justify-between hover:bg-gray-50 transition"
							>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
										<TrendingDown size={24} className="text-red-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">{expense.title}</h3>
										<div className="flex items-center gap-3 mt-1">
											<span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
												{expense.category}
											</span>
											<span className="text-sm text-gray-500">{expense.date}</span>
										</div>
									</div>
								</div>
								<div className="flex items-center gap-6">
									<span className="text-xl font-bold text-red-600">
										-{expense.amount.toFixed(2)}
									</span>
									<div className="flex items-center gap-2">
										<button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
											<Edit2 size={18} />
										</button>
										<button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
											<Trash2 size={18} />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-16">
						<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
							<TrendingDown size={40} className="text-red-600" />
						</div>
						<p className="text-gray-500 font-medium">No expenses yet</p>
						<p className="text-sm text-gray-400 mt-2">
							Click "Add Expense" to track your first expense
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
