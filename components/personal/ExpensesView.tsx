"use client";

import React, { useEffect, useState } from "react";
import { TrendingDown, Plus, Edit2, Trash2 } from "lucide-react";
import AddExpenseModal from "./AddExpenseModal";

interface Expense {
	id: string;
	title: string;
	category: string;
	account: string;
	date: string;
	amount: number;
}

export default function ExpensesView() {
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
	const [expenseError, setExpenseError] = useState("");

	const fetchExpenses = async () => {
		setIsLoadingExpenses(true);
		setExpenseError("");

		try {
			const token = localStorage.getItem("token");

			if (!token) {
				setExpenseError("Please log in again to load expenses");
				return;
			}

			const response = await fetch("/api/expenses", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (!response.ok) {
				setExpenseError(data.error || "Failed to load expenses");
				return;
			}

			setExpenses(data.expenses || []);
		} catch (error) {
			console.error("Failed to fetch expenses:", error);
			setExpenseError("Failed to load expenses");
		} finally {
			setIsLoadingExpenses(false);
		}
	};

	useEffect(() => {
		fetchExpenses();
	}, []);

	const handleAddExpense = (newExpense: {
		title: string;
		category: string;
		account: string;
		date: string;
		amount: number;
	}) => {
		void (async () => {
			try {
				const token = localStorage.getItem("token");

				if (!token) {
					alert("Please log in again to add expenses");
					return;
				}

				const response = await fetch("/api/expenses", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(newExpense),
				});

				const data = await response.json();

				if (!response.ok) {
					alert(data.error || "Failed to save expense");
					return;
				}

				setExpenses((prev) => [data.expense, ...prev]);
				setIsModalOpen(false);
			} catch (error) {
				console.error("Failed to save expense:", error);
				alert("Failed to save expense");
			}
		})();
	};

	return (
		<div>
			{/* Page Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
					<p className="text-gray-600 mt-1">Track and manage your expenses</p>
				</div>
				<button 
					onClick={() => setIsModalOpen(true)}
					className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:bg-red-700 hover:shadow-xl transition">
					<Plus size={20} />
					Add Expense
				</button>
			</div>

			<AddExpenseModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onAddExpense={handleAddExpense}
			/>

			{expenseError && (
				<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{expenseError}
				</div>
			)}

			{/* Expenses List */}
			<div className="bg-white rounded-2xl shadow-lg border border-gray-100">
				{isLoadingExpenses ? (
					<div className="flex flex-col items-center justify-center py-16">
						<p className="text-gray-500 font-medium">Loading expenses...</p>
					</div>
				) : expenses.length > 0 ? (
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
											<span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
												{expense.account}
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
