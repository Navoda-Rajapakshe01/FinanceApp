"use client";

import React, { useEffect, useState } from "react";
import { TrendingDown, Plus, Edit2, Trash2, Calendar } from "lucide-react";
import AddExpenseModal from "./AddExpenseModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";

interface Expense {
	id: string;
	title: string;
	category: string;
	account: string;
	date: string;
	amount: number;
}

interface Month {
	value: string;
	label: string;
	fullName: string;
}

export default function ExpensesView() {
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
	const [expenseError, setExpenseError] = useState("");
	const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [months, setMonths] = useState<Month[]>([]);
	const [confirmDialog, setConfirmDialog] = useState({
		isOpen: false,
		expenseId: "",
	});
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
		type: "success" as "success" | "error",
	});
	const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

	const fetchMonths = async () => {
		try {
			const response = await fetch("/api/months");
			const data = await response.json();
			if (response.ok) {
				setMonths(data.months || []);
			}
		} catch (error) {
			console.error("Failed to fetch months:", error);
		}
	};

	const fetchExpenses = async () => {
		setIsLoadingExpenses(true);
		setExpenseError("");

		try {
			const token = localStorage.getItem("token");

			if (!token) {
				setExpenseError("Please log in again to load expenses");
				return;
			}

			// Request expenses for the currently selected month only
			const url = `/api/expenses?month=${selectedMonth}`;
			const response = await fetch(url, {
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
		fetchMonths();
	}, []);

	// Refetch expenses whenever the selected month changes
	useEffect(() => {
		fetchExpenses();
	}, [selectedMonth]);

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

	const getMonthDateRange = () => {
		const [year, month] = selectedMonth.split("-").map(Number);
		const startDate = new Date(year, month - 1, 1);
		startDate.setHours(0, 0, 0, 0);
		const endDate = new Date(year, month, 0, 23, 59, 59, 999);
		return { startDate, endDate };
	};

	const { startDate, endDate } = getMonthDateRange();
	const monthExpenses = expenses.filter(
		(e) => new Date(e.date) >= startDate && new Date(e.date) <= endDate
	);
	const totalMonthExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

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
					setToast({
						isOpen: true,
						message: data.error || "Failed to save expense",
						type: "error",
					});
					return;
				}

				// Refresh the list for the selected month
				await fetchExpenses();
				setIsModalOpen(false);
				setToast({
					isOpen: true,
					message: "Expense added successfully",
					type: "success",
				});
			} catch (error) {
				console.error("Failed to save expense:", error);
				setToast({
					isOpen: true,
					message: "Failed to save expense",
					type: "error",
				});
			}
		})();
	};

	const handleUpdateExpense = (expenseId: string, updatedExpense: {
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
					setToast({
						isOpen: true,
						message: "Please log in again to update expense",
						type: "error",
					});
					return;
				}

				const response = await fetch(`/api/expenses?id=${expenseId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(updatedExpense),
				});

				const data = await response.json();

				if (!response.ok) {
					setToast({
						isOpen: true,
						message: data.error || "Failed to update expense",
						type: "error",
					});
					return;
				}
				// Refresh the list for the selected month
				await fetchExpenses();
				setIsModalOpen(false);
				setEditingExpense(null);
				setToast({
					isOpen: true,
					message: "Expense updated successfully",
					type: "success",
				});
			} catch (error) {
				console.error("Failed to update expense:", error);
				setToast({
					isOpen: true,
					message: "Failed to update expense",
					type: "error",
				});
			}
		})();
	};

	const handleDeleteExpense = async () => {
		const { expenseId } = confirmDialog;

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setToast({
					isOpen: true,
					message: "Please log in again to delete expense",
					type: "error",
				});
				return;
			}

			const response = await fetch(`/api/expenses?id=${expenseId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const data = await response.json();
				setToast({
					isOpen: true,
					message: data.error || "Failed to delete expense",
					type: "error",
				});
				setConfirmDialog({ isOpen: false, expenseId: "" });
				return;
			}

			// Refresh the list for the selected month
			await fetchExpenses();
			setConfirmDialog({ isOpen: false, expenseId: "" });
			setToast({
				isOpen: true,
				message: "Expense deleted successfully",
				type: "success",
			});
		} catch (error) {
			console.error("Failed to delete expense:", error);
			setToast({
				isOpen: true,
				message: "Failed to delete expense",
				type: "error",
			});
			setConfirmDialog({ isOpen: false, expenseId: "" });
		}
	};

	return (
		<div>
			{/* Page Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
					<p className="text-gray-600 mt-1">Track and manage your expenses</p>
				</div>
				<div className="flex items-center gap-4">
					<div className="relative">
						<button
							onClick={() => setIsCalendarOpen(!isCalendarOpen)}
							className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg font-semibold hover:bg-orange-100 transition"
						>
							<Calendar size={18} />
							<span>{selectedMonthName} {selectedYear}</span>
						</button>

						{isCalendarOpen && (
							<div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-orange-200 p-6 z-50 w-80">
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

								<div className="grid grid-cols-3 gap-2">
									{months.map((month) => (
										<button
											key={month.value}
											onClick={() => handleMonthClick(month.value)}
											className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
												currentSelectedMonth === month.value && selectedYear === parseInt(selectedMonth.split("-")[0])
													? "bg-red-500 text-white shadow-lg"
													: "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700"
											}`}
										>
											{month.label}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
				<button 
				onClick={() => {
					setEditingExpense(null);
					setIsModalOpen(true);
				}}
				className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:bg-red-700 hover:shadow-xl transition">
				<Plus size={20} />
				Add Expense
			</button>
		</div>

		<AddExpenseModal
			isOpen={isModalOpen}
			onClose={() => {
				setIsModalOpen(false);
				setEditingExpense(null);
			}}
			onAddExpense={handleAddExpense}
			onUpdateExpense={handleUpdateExpense}
			editingExpense={editingExpense}
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
			) : allExpenses.length > 0 ? (
				<div>
					<div className="p-6 bg-red-50 border-b border-red-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-red-700">Total Expenses</p>
								<p className="text-3xl font-bold text-red-600 mt-2">LKR {totalExpenses.toFixed(2)}</p>
							</div>
							<div className="text-right">
								<p className="text-sm text-red-600 font-semibold">{allExpenses.length} transactions</p>
							</div>
						</div>
					</div>
					<div className="divide-y divide-gray-100">
						{allExpenses.map((expense) => (
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
								<div className="flex items-center gap-2">
									<button 
										onClick={() => {
											setEditingExpense(expense);
											setIsModalOpen(true);
										}}
										className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
										<Edit2 size={18} />
									</button>
									<button 
										onClick={() => setConfirmDialog({ isOpen: true, expenseId: expense.id })}
										className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
										<Trash2 size={18} />
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
					) : (
					<div className="flex flex-col items-center justify-center py-16">
						<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
							<TrendingDown size={40} className="text-red-600" />
						</div>
					<p className="text-gray-500 font-medium">No expenses yet</p>
					<p className="text-sm text-gray-400 mt-2">
						Click "Add Expense" to record your expense or select a different month
						</p>
					</div>
				)}
			</div>

			<ConfirmDialog
				isOpen={confirmDialog.isOpen}
				title="Delete Expense"
				message="Are you sure you want to delete this expense? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				isDangerous={true}
				onConfirm={handleDeleteExpense}
				onCancel={() => setConfirmDialog({ isOpen: false, expenseId: "" })}
			/>

			<Toast
				isOpen={toast.isOpen}
				message={toast.message}
				type={toast.type}
				onClose={() => setToast({ ...toast, isOpen: false })}
			/>
		</div>
	);
}
