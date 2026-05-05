"use client";

import React, { useEffect, useState } from "react";
import { Target, Plus, Edit2, Trash2 } from "lucide-react";
import AddGoalModal from "../goals/AddGoalModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";

interface Goal {
	id: string;
	title: string;
	targetAmount: number;
	warningLimit?: number;
	deadline: string;
	category: string;
}

export default function GoalsView() {
	const [goals, setGoals] = useState<Goal[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
	const [isLoadingGoals, setIsLoadingGoals] = useState(false);
	const [goalError, setGoalError] = useState("");
	const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, goalId: "" });
	const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" as "success" | "error" });

	

	const fetchGoals = async () => {
		setIsLoadingGoals(true);
		setGoalError("");
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setGoalError("Please log in again to load goals");
				return;
			}
			const response = await fetch("/api/personal/goals", {
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await response.json();
			if (!response.ok) {
				setGoalError(data.error || "Failed to load goals");
				return;
			}
			setGoals(data.goals || []);
		} catch (error) {
			console.error("Failed to fetch goals:", error);
			setGoalError("Failed to load goals");
		} finally {
			setIsLoadingGoals(false);
		}
	};

	useEffect(() => {
		void fetchGoals();
	}, []);

	const handleAddGoal = (newGoal: {
		title: string;
		category: string;
		targetAmount: number;
		warningLimit?: number;
		deadline: string;
	}) => {
		void (async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setToast({ isOpen: true, message: "Please log in again to add goals", type: "error" });
					return;
				}

				const response = await fetch("/api/personal/goals", {
					method: "POST",
					headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
					body: JSON.stringify(newGoal),
				});

				const data = await response.json();
				if (!response.ok) {
					setToast({ isOpen: true, message: data.error || "Failed to save goal", type: "error" });
					return;
				}

				await fetchGoals();
				setIsModalOpen(false);
				setToast({ isOpen: true, message: "Goal added successfully", type: "success" });
			} catch (error) {
				console.error("Failed to save goal:", error);
				setToast({ isOpen: true, message: "Failed to save goal", type: "error" });
			}
		})();
	};

	const formatCurrency = (value: number) => {
		return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	};

	const handleUpdateGoal = (goalId: string, updatedGoal: {
		title: string;
		category: string;
		targetAmount: number;
		warningLimit?: number;
		deadline: string;
	}) => {
		void (async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setToast({ isOpen: true, message: "Please log in again to update goal", type: "error" });
					return;
				}

				const response = await fetch(`/api/personal/goals?id=${goalId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
					body: JSON.stringify(updatedGoal),
				});

				const data = await response.json();
				if (!response.ok) {
					setToast({ isOpen: true, message: data.error || "Failed to update goal", type: "error" });
					return;
				}

				await fetchGoals();
				setIsModalOpen(false);
				setEditingGoal(null);
				setToast({ isOpen: true, message: "Goal updated successfully", type: "success" });
			} catch (error) {
				console.error("Failed to update goal:", error);
				setToast({ isOpen: true, message: "Failed to update goal", type: "error" });
			}
		})();
	};

	const handleDeleteGoal = async () => {
		const { goalId } = confirmDialog;
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setToast({ isOpen: true, message: "Please log in again to delete goal", type: "error" });
				return;
			}

			const response = await fetch(`/api/personal/goals?id=${goalId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.ok) {
				const data = await response.json();
				setToast({ isOpen: true, message: data.error || "Failed to delete goal", type: "error" });
				setConfirmDialog({ isOpen: false, goalId: "" });
				return;
			}

			await fetchGoals();
			setConfirmDialog({ isOpen: false, goalId: "" });
			setToast({ isOpen: true, message: "Goal deleted successfully", type: "success" });
		} catch (error) {
			console.error("Failed to delete goal:", error);
			setToast({ isOpen: true, message: "Failed to delete goal", type: "error" });
			setConfirmDialog({ isOpen: false, goalId: "" });
		}
	};

	return (
		<div>
			{/* Page Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
					<p className="text-gray-600 mt-1">Set ambitious targets and track your progress</p>
				</div>
				<button 
				onClick={() => {
					setEditingGoal(null);
					setIsModalOpen(true);
				}}
				className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold shadow-lg hover:bg-teal-700 hover:shadow-xl transition">
					<Plus size={20} />
					Create Goal
				</button>
			</div>

		<AddGoalModal
			isOpen={isModalOpen}
			onClose={() => {
				setIsModalOpen(false);
				setEditingGoal(null);
			}}
			onAddGoal={handleAddGoal}
			onUpdateGoal={handleUpdateGoal}
			editingGoal={editingGoal}
			/>

			{/* Goals List */}
			<div className="bg-white rounded-2xl shadow-lg border border-gray-100">
				{isLoadingGoals ? (
					<div className="flex flex-col items-center justify-center py-16">
						<p className="text-gray-500 font-medium">Loading goals...</p>
					</div>
				) : goals.length > 0 ? (
					<div className="divide-y divide-gray-100">
						{goals.map((goal) => {
							return (
								<div
									key={goal.id}
									className="p-6 hover:bg-gray-50 transition"
								>
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-4">
											<div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
												<Target size={24} className="text-teal-600" />
											</div>
											<div>
												<h3 className="font-semibold text-gray-900">{goal.title}</h3>
												<div className="flex items-center gap-3 mt-1">
													<span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
														{goal.category}
													</span>
													<span className="text-sm text-gray-500">Deadline: {goal.deadline}</span>
												</div>
											</div>
										</div>
										<div className="flex items-center gap-6">
											<div className="text-right">
												<p className="text-xl font-bold text-gray-900">
													Target: LKR {formatCurrency(goal.targetAmount)}
												</p>
												{goal.warningLimit !== undefined && (
													<p className="text-sm text-yellow-700 mt-1">Warning at: LKR {formatCurrency(goal.warningLimit)}</p>
												)}
											</div>
												<div className="flex items-center gap-2">
												<button 
													onClick={() => {
														setEditingGoal(goal);
														setIsModalOpen(true);
													}}
													className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
														<Edit2 size={18} />
													</button>
													<button 
														onClick={() => setConfirmDialog({ isOpen: true, goalId: goal.id })}
														className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
														<Trash2 size={18} />
													</button>
												</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-16 px-8">
						<div className="w-24 h-24 bg-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
							<Target size={48} className="text-white" />
						</div>
						<p className="text-gray-800 font-bold text-2xl mb-3">No Goals Yet</p>
						<p className="text-gray-600 text-center max-w-2xl leading-relaxed">
							Start your financial journey by setting clear, achievable goals. Whether it's saving for a vacation, building an emergency fund, or planning for a major purchase.
						</p>
						<button
							onClick={() => {
								setEditingGoal(null);
								setIsModalOpen(true);
							}}
							className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold shadow-lg hover:bg-teal-700 hover:shadow-xl transition mt-8"
						>
							<Plus size={20} />
							Create Your First Goal
						</button>
					</div>
				)}
			</div>

			<ConfirmDialog
				isOpen={confirmDialog.isOpen}
				title="Delete Goal"
				message="Are you sure you want to delete this goal? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				isDangerous={true}
				onConfirm={handleDeleteGoal}
				onCancel={() => setConfirmDialog({ isOpen: false, goalId: "" })}
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
