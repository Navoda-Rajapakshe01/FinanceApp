"use client";

import React, { useState } from "react";
import { Target, Plus, Edit2, Trash2 } from "lucide-react";
import AddGoalModal from "./AddGoalModal";

interface Goal {
	id: string;
	title: string;
	targetAmount: number;
	currentAmount: number;
	deadline: string;
	category: string;
}

export default function GoalsView() {
	// Sample goals data (would come from backend)
	const [goals, setGoals] = useState<Goal[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

	const handleAddGoal = (newGoal: {
		title: string;
		category: string;
		targetAmount: number;
		currentAmount: number;
		deadline: string;
	}) => {
		const goal: Goal = {
			id: Date.now().toString(),
			...newGoal,
		};
		setGoals((prev) => [...prev, goal]);
		setIsModalOpen(false);
	};

	const handleUpdateGoal = (goalId: string, updatedGoal: {
		title: string;
		category: string;
		targetAmount: number;
		currentAmount: number;
		deadline: string;
	}) => {
		setGoals((prev) =>
			prev.map((g) =>
				g.id === goalId
					? {
							...g,
							...updatedGoal,
					  }
					: g
			)
		);
		setIsModalOpen(false);
		setEditingGoal(null);
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
				{goals.length > 0 ? (
					<div className="divide-y divide-gray-100">
						{goals.map((goal) => {
							const progress = (goal.currentAmount / goal.targetAmount) * 100;
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
													LKR {goal.currentAmount.toFixed(2)}
												</p>
												<p className="text-sm text-gray-500">
													of LKR {goal.targetAmount.toFixed(2)}
												</p>
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
												<button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
													<Trash2 size={18} />
												</button>
											</div>
										</div>
									</div>
									{/* Progress Bar */}
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-gradient-to-r from-teal-500 to-green-500 h-2 rounded-full transition-all"
											style={{ width: `${Math.min(progress, 100)}%` }}
										></div>
									</div>
									<p className="text-sm text-gray-600 mt-2">{progress.toFixed(1)}% completed</p>
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
		</div>
	);
}
