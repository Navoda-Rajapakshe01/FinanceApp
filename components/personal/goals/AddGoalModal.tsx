"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, X } from "lucide-react";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: {
    title: string;
    category: string;
    targetAmount: number;
    warningLimit?: number;
    deadline: string;
  }) => void;
  onUpdateGoal?: (
    goalId: string,
    goal: {
      title: string;
      category: string;
      targetAmount: number;
      warningLimit?: number;
      deadline: string;
    }
  ) => void;
  editingGoal?: {
    id: string;
    title: string;
    category: string;
    targetAmount: number;
    warningLimit?: number;
    deadline: string;
  } | null;
}

export default function AddGoalModal({
  isOpen,
  onClose,
  onAddGoal,
  onUpdateGoal,
  editingGoal,
}: AddGoalModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    targetAmount: "",
    warningLimit: "",
    deadline: new Date().toISOString().split("T")[0],
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    targetAmount?: string;
    warningLimit?: string;
    submit?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    setCategoryError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCategoryError("Please log in again to load categories");
        return;
      }

      const response = await fetch("/api/expense/expense-categories", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        setCategoryError(data.error || "Failed to load categories");
        return;
      }

      const fetched = (data.categories || []).map((c: { name: string }) => c.name);
      setCategories(fetched);
      setFormData((prev) => ({
        ...prev,
        category: prev.category && fetched.includes(prev.category) ? prev.category : fetched[0] || "",
      }));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategoryError("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setFormData({
          title: editingGoal.title,
          category: editingGoal.category,
          targetAmount: String(editingGoal.targetAmount),
          warningLimit: editingGoal.warningLimit ? String(editingGoal.warningLimit) : "",
          deadline: editingGoal.deadline,
        });
      } else {
        setFormData({
          title: "",
          category: "",
          targetAmount: "",
          warningLimit: "",
          deadline: new Date().toISOString().split("T")[0],
        });
      }
      void fetchCategories();
    }
  }, [isOpen, editingGoal]);

  useEffect(() => {
    if (editingGoal && categories.length > 0) {
      setFormData((prev) => ({ ...prev, category: editingGoal.category }));
    }
  }, [categories, editingGoal]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name in errors) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name === "category") setCategoryError("");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    if (!/^\d*(\.\d{0,2})?$/.test(value)) return;
    setFormData((prev) => ({ ...prev, targetAmount: value }));
    if (errors.targetAmount) setErrors((prev) => ({ ...prev, targetAmount: undefined }));
  };

  const handleWarningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    if (!/^\d*(\.\d{0,2})?$/.test(value)) return;
    setFormData((prev) => ({ ...prev, warningLimit: value }));
    if (errors.warningLimit) setErrors((prev) => ({ ...prev, warningLimit: undefined }));
  };

  const handleWarningBlur = () => {
    if (!formData.warningLimit) return;
    const amountNumber = Number(formData.warningLimit);
    if (Number.isNaN(amountNumber)) return;
    setFormData((prev) => ({ ...prev, warningLimit: amountNumber.toFixed(2) }));
  };

  const handleAmountBlur = () => {
    if (!formData.targetAmount) return;
    const amountNumber = Number(formData.targetAmount);
    if (Number.isNaN(amountNumber)) return;
    setFormData((prev) => ({ ...prev, targetAmount: amountNumber.toFixed(2) }));
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { title?: string; targetAmount?: string; warningLimit?: string; submit?: string } = {};

    if (!formData.title) nextErrors.title = "Title is required";
    if (!formData.targetAmount) nextErrors.targetAmount = "Target amount is required";
    if (!formData.category) {
      if (!nextErrors.title && !nextErrors.targetAmount) nextErrors.submit = "Please fill in all fields";
    }

    const parsedAmount = Number(formData.targetAmount);
    if (formData.targetAmount && (Number.isNaN(parsedAmount) || parsedAmount < 0)) {
      nextErrors.targetAmount = "Please enter a valid amount";
    }

    let parsedWarning: number | undefined = undefined;
    if (formData.warningLimit) {
      parsedWarning = Number(formData.warningLimit);
      if (Number.isNaN(parsedWarning) || parsedWarning < 0) {
        nextErrors.warningLimit = "Please enter a valid warning amount";
      } else if (!Number.isNaN(parsedAmount) && parsedWarning > parsedAmount) {
        nextErrors.warningLimit = "Warning limit cannot exceed target amount";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      const goalData = {
        title: formData.title,
        category: formData.category,
        targetAmount: parsedAmount,
        warningLimit: parsedWarning,
        deadline: formData.deadline,
      };

      if (editingGoal && onUpdateGoal) {
        await onUpdateGoal(editingGoal.id, goalData as any);
      } else {
        await onAddGoal(goalData as any);
      }

      setFormData({ title: "", category: "", targetAmount: "", warningLimit: "", deadline: new Date().toISOString().split("T")[0] });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to save goal:", error);
      setErrors((prev) => ({ ...prev, submit: "Failed to save goal" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">{editingGoal ? "Edit Goal" : "Create Goal"}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Savings Goal</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="eg: Save for phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            />
            {errors.title && <p className="text-xs text-red-600 mt-2">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <div className="flex gap-2">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isLoadingCategories}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
              >
                {isLoadingCategories ? (
                  <option disabled>Loading categories...</option>
                ) : categoryError ? (
                  <option disabled>{categoryError}</option>
                ) : categories.length === 0 ? (
                  <option disabled>No categories available</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat} value={cat} className="text-gray-900 bg-white">
                      {cat}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Spending Limit (LKR) *</label>
            <input
              type="text"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              placeholder="Max amount to spend"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            />
            {errors.targetAmount && <p className="text-xs text-red-600 mt-2">{errors.targetAmount}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Warning Limit (LKR)</label>
            <input
              type="text"
              name="warningLimit"
              value={formData.warningLimit}
              onChange={handleWarningChange}
              onBlur={handleWarningBlur}
              placeholder="Amount to warn before limit"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            />
            {errors.warningLimit && <p className="text-xs text-red-600 mt-2">{errors.warningLimit}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Time Period End Date</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            />
          </div>

          {errors.submit && <p className="text-xs text-red-600">{errors.submit}</p>}

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
              disabled={isSubmitting || isLoadingCategories || !formData.category}
              className={`flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition ${isSubmitting || isLoadingCategories || !formData.category ? "opacity-50 cursor-not-allowed hover:bg-teal-600" : ""}`}
            >
              {editingGoal ? (isSubmitting ? "Updating..." : "Update Goal") : isSubmitting ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
