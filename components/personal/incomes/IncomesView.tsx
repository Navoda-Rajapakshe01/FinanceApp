"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Plus, Edit2, Trash2, Calendar } from "lucide-react";
import AddIncomeModal from "./AddIncomeModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";

interface Income {
	id: string;
	description: string;
	category: string;
	date: string;
	amount: number;
}

interface Month {
	value: string;
	label: string;
	fullName: string;
}

export default function IncomesView() {
	const [incomes, setIncomes] = useState<Income[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoadingIncomes, setIsLoadingIncomes] = useState(false);
	const [loadError, setLoadError] = useState("");
	const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [months, setMonths] = useState<Month[]>([]);
	const [confirmDialog, setConfirmDialog] = useState({
		isOpen: false,
		incomeId: "",
	});
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
		type: "success" as "success" | "error",
	});
	const [editingIncome, setEditingIncome] = useState<Income | null>(null);

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

	const fetchIncomes = async () => {
		setIsLoadingIncomes(true);
		setLoadError("");

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setLoadError("Please log in again to load incomes");
				return;
			}

			const response = await fetch("/api/incomes", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (!response.ok) {
				setLoadError(data.error || "Failed to load incomes");
				return;
			}

			setIncomes(data.incomes || []);
		} catch (error) {
			console.error("Failed to fetch incomes:", error);
			setLoadError("Failed to load incomes");
		} finally {
			setIsLoadingIncomes(false);
		}
	};

	useEffect(() => {
		fetchMonths();
		fetchIncomes();
	}, []);

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
		const endDate = new Date(year, month, 0);
		return { startDate, endDate };
	};

	const { startDate, endDate } = getMonthDateRange();
	const monthIncomes = incomes.filter(
		(i) => new Date(i.date) >= startDate && new Date(i.date) <= endDate
	);
	const totalMonthIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);

	const handleAddIncome = async (newIncome: {
		description: string;
		category: string;
		date: string;
		amount: number;
	}) => {
		// Refresh the incomes list after adding
		await fetchIncomes();
		setIsModalOpen(false);
	};

	const handleUpdateIncome = (incomeId: string, updatedIncome: {
		description: string;
		category: string;
		date: string;
		amount: number;
	}) => {
		void (async () => {
			try {
				const token = localStorage.getItem("token");

				if (!token) {
					setToast({
						isOpen: true,
						message: "Please log in again to update income",
						type: "error",
					});
					return;
				}

				const response = await fetch(`/api/incomes?id=${incomeId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(updatedIncome),
				});

				const data = await response.json();

				if (!response.ok) {
					setToast({
						isOpen: true,
						message: data.error || "Failed to update income",
						type: "error",
					});
					return;
				}

				setIncomes((prev) =>
					prev.map((i) =>
						i.id === incomeId
							? {
									...i,
									...updatedIncome,
							  }
							: i
					)
				);
				setIsModalOpen(false);
				setEditingIncome(null);
				setToast({
					isOpen: true,
					message: "Income updated successfully",
					type: "success",
				});
			} catch (error) {
				console.error("Failed to update income:", error);
				setToast({
					isOpen: true,
					message: "Failed to update income",
					type: "error",
				});
			}
		})();
	};

	const handleDeleteIncome = async () => {
		const { incomeId } = confirmDialog;

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setToast({
					isOpen: true,
					message: "Please log in again to delete income",
					type: "error",
				});
				return;
			}

			const response = await fetch(`/api/incomes?id=${incomeId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const data = await response.json();
				setToast({
					isOpen: true,
					message: data.error || "Failed to delete income",
					type: "error",
				});
				setConfirmDialog({ isOpen: false, incomeId: "" });
				return;
			}

			// Remove from local state
			setIncomes((prev) => prev.filter((i) => i.id !== incomeId));
			setConfirmDialog({ isOpen: false, incomeId: "" });
			setToast({
				isOpen: true,
				message: "Income deleted successfully",
				type: "success",
			});
		} catch (error) {
			console.error("Failed to delete income:", error);
			setToast({
				isOpen: true,
				message: "Failed to delete income",
				type: "error",
			});
			setConfirmDialog({ isOpen: false, incomeId: "" });
		}
	};

	return (
		<div>
			<AddIncomeModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingIncome(null);
				}}
				onAddIncome={handleAddIncome}
				onUpdateIncome={handleUpdateIncome}
				editingIncome={editingIncome}
			/>

			{/* Page Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Incomes</h1>
					<p className="text-gray-600 mt-1">Track and manage your incomes</p>
				</div>
				<div className="flex items-center gap-4">
					<div className="relative">
						<button
							onClick={() => setIsCalendarOpen(!isCalendarOpen)}
							className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition"
						>
							<Calendar size={18} />
							<span>{selectedMonthName} {selectedYear}</span>
						</button>

						{isCalendarOpen && (
							<div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-blue-200 p-6 z-50 w-80">
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
													? "bg-green-500 text-white shadow-lg"
													: "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700"
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
						setEditingIncome(null);
						setIsModalOpen(true);
					}}
					className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 hover:shadow-xl transition">
					<Plus size={20} />
					Add Income
				</button>
			</div>

			{/* Incomes List */}
			<div className="bg-white rounded-2xl shadow-lg border border-gray-100">
				{loadError && (
					<div className="p-6 bg-red-50 border-b border-red-200">
						<p className="text-sm text-red-600">{loadError}</p>
					</div>
				)}
				{isLoadingIncomes ? (
					<div className="flex items-center justify-center py-16">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
						<p className="text-gray-600 ml-3">Loading incomes...</p>
					</div>
			) : monthIncomes.length > 0 ? (
				<div>
					<div className="p-6 bg-green-50 border-b border-green-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-700">Total Income for {selectedMonthName} {selectedYear}</p>
								<p className="text-3xl font-bold text-green-600 mt-2">LKR {totalMonthIncome.toFixed(2)}</p>
							</div>
							<div className="text-right">
								<p className="text-sm text-green-600 font-semibold">{monthIncomes.length} transactions</p>
							</div>
						</div>
					</div>
					<div className="divide-y divide-gray-100">
						{monthIncomes.map((income) => (
							<div
								key={income.id}
								className="p-6 flex items-center justify-between hover:bg-gray-50 transition"
							>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
										<TrendingUp size={24} className="text-green-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">{income.description}</h3>
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
										LKR {income.amount.toFixed(2)}
									</span>
									<div className="flex items-center gap-2">
										<button 
											onClick={() => {
												setEditingIncome(income);
												setIsModalOpen(true);
											}}
											className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
											<Edit2 size={18} />
										</button>
										<button 
											onClick={() => setConfirmDialog({ isOpen: true, incomeId: income.id })}
											className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
											<Trash2 size={18} />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
				) : (
					<div className="flex flex-col items-center justify-center py-16">
						<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
							<TrendingUp size={40} className="text-green-600" />
						</div>
					<p className="text-gray-500 font-medium">No incomes in {selectedMonthName} {selectedYear}</p>
					<p className="text-sm text-gray-400 mt-2">
						Click "Add Income" to record your income or select a different month
						</p>
					</div>
				)}
			</div>

			<ConfirmDialog
				isOpen={confirmDialog.isOpen}
				title="Delete Income"
				message="Are you sure you want to delete this income? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				isDangerous={true}
				onConfirm={handleDeleteIncome}
				onCancel={() => setConfirmDialog({ isOpen: false, incomeId: "" })}
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
