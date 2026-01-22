"use client";

import React, { useState } from "react";
import { TrendingUp, Plus, Edit2, Trash2 } from "lucide-react";

interface Income {
	id: string;
	title: string;
	category: string;
	date: string;
	amount: number;
}

export default function IncomesView() {
	// Sample income data (would come from backend)
	const [incomes, setIncomes] = useState<Income[]>([]);

	return (
		<div>
			{/* Page Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Incomes</h1>
					<p className="text-gray-600 mt-1">Track and manage your incomes</p>
				</div>
				<button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 hover:shadow-xl transition">
					<Plus size={20} />
					Add Income
				</button>
			</div>

			{/* Incomes List */}
			<div className="bg-white rounded-2xl shadow-lg border border-gray-100">
				{incomes.length > 0 ? (
					<div className="divide-y divide-gray-100">
						{incomes.map((income) => (
							<div
								key={income.id}
								className="p-6 flex items-center justify-between hover:bg-gray-50 transition"
							>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
										<TrendingUp size={24} className="text-green-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">{income.title}</h3>
										<div className="flex items-center gap-3 mt-1">
											<span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
												{income.category}
											</span>
											<span className="text-sm text-gray-500">{income.date}</span>
										</div>
									</div>
								</div>
								<div className="flex items-center gap-6">
									<span className="text-xl font-bold text-green-600">
										+{income.amount.toFixed(2)}
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
						<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
							<TrendingUp size={40} className="text-green-600" />
						</div>
						<p className="text-gray-500 font-medium">No incomes yet</p>
						<p className="text-sm text-gray-400 mt-2">
							Click "Add Income" to track your first income
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
