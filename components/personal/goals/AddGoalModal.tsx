"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: {
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  }) => void;
  onUpdateGoal?: (goalId: string, goal: {
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  }) => void;
  editingGoal?: {
    id: string;
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  } | null;
}

const categories = [
  "Food & Dining",
  "Shopping",
  "Entertainment",
  "Transportation",
  "Bills & Utilities",
  "Health & Fitness",
  "Education",
  "Emergency Fund",
  "Savings",
  "Other",
];

export default function AddGoalModal({
  isOpen,
  onClose,
  onAddGoal,
  onUpdateGoal,
  editingGoal,
}: AddGoalModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    category: "Vacation",
    targetAmount: "",
    currentAmount: "",
    deadline: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<{ title?: string; targetAmount?: string }>(
    {}
  );

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setFormData({
          title: editingGoal.title,
          category: editingGoal.category,
          targetAmount: String(editingGoal.targetAmount),
          currentAmount: String(editingGoal.currentAmount),
          deadline: editingGoal.deadline,
        });
      } else {
        setFormData({
          title: "",
          category: "Vacation",
          targetAmount: "",
          currentAmount: "",
          deadline: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [isOpen, editingGoal]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { title?: string; targetAmount?: string } = {};
    if (!formData.title) {
      nextErrors.title = "Title is required";
    }
    if (!formData.targetAmount) {
      nextErrors.targetAmount = "Target amount is required";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const goalData = {
      title: formData.title,
      category: formData.category,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline,
    };

    if (editingGoal && onUpdateGoal) {
      onUpdateGoal(editingGoal.id, goalData);
    } else {
      onAddGoal(goalData);
    }

    setFormData({
      title: "",
      category: "Vacation",
      targetAmount: "",
      currentAmount: "",
      deadline: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">{editingGoal ? "Edit Goal" : "Create Goal"}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Savings Goal
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Limit monthly shopping"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-2">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="text-gray-900 bg-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Spending Limit (LKR) *
            </label>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              placeholder="Max amount to spend"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            />
            {errors.targetAmount && (
              <p className="text-xs text-red-600 mt-2">{errors.targetAmount}</p>
            )}
          </div>

          {/* Current Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount Spent (LKR)
            </label>
            <input
              type="number"
              name="currentAmount"
              value={formData.currentAmount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Time Period End Date
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              {editingGoal ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
