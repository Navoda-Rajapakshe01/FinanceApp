"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Tag, TrendingUp, X } from "lucide-react";

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncome: (income: {
    description: string;
    category: string;
    date: string;
    amount: number;
  }) => void;
  onUpdateIncome?: (incomeId: string, income: {
    description: string;
    category: string;
    date: string;
    amount: number;
  }) => void;
  editingIncome?: {
    id: string;
    description: string;
    category: string;
    date: string;
    amount: number;
  } | null;
}

const ADD_CATEGORY_OPTION = "__add_new_category__";

export default function AddIncomeModal({
  isOpen,
  onClose,
  onAddIncome,
  onUpdateIncome,
  editingIncome,
}: AddIncomeModalProps) {
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [errors, setErrors] = useState<{
    description?: string;
    amount?: string;
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

      const response = await fetch("/api/income-categories", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setCategoryError(data.error || "Failed to load categories");
        return;
      }

      const fetchedCategories = (data.categories || []).map(
        (category: { name: string }) => category.name
      );

      setCategories(fetchedCategories);
      setFormData((prev) => ({
        ...prev,
        category:
          prev.category && fetchedCategories.includes(prev.category)
            ? prev.category
            : fetchedCategories[0] || "",
      }));
    } catch (error) {
      console.error("Failed to fetch income categories:", error);
      setCategoryError("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (editingIncome) {
        setFormData({
          description: editingIncome.description,
          category: editingIncome.category,
          date: editingIncome.date,
          amount: String(editingIncome.amount),
        });
      } else {
        setFormData({
          description: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
          amount: "",
        });
      }
      fetchCategories();
    }
  }, [isOpen, editingIncome]);

  useEffect(() => {
    // This effect ensures that after categories are loaded, if we're editing,
    // we preserve the category from editingIncome
    if (editingIncome && categories.length > 0) {
      setFormData((prev) => ({
        ...prev,
        category: editingIncome.category,
      }));
    }
  }, [categories, editingIncome]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");

    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      amount: value,
    }));

    setErrors((prev) => ({ ...prev, amount: "" }));
  };

  const handleAmountBlur = () => {
    if (!formData.amount) {
      return;
    }

    const amountNumber = Number(formData.amount);

    if (Number.isNaN(amountNumber)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      amount: amountNumber.toFixed(2),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { description?: string; amount?: string } = {};

    if (!formData.description.trim()) {
      nextErrors.description = "Description is required";
    }

    const parsedAmount = Number(formData.amount);
    if (!formData.amount.trim()) {
      nextErrors.amount = "Amount is required";
    } else if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      nextErrors.amount = "Please enter a valid amount";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    submitIncome({
      description: formData.description.trim(),
      category: formData.category,
      date: formData.date,
      amount: parsedAmount,
    });
  };

  const submitIncome = async (incomeData: {
    description: string;
    category: string;
    date: string;
    amount: number;
  }) => {
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors((prev) => ({ ...prev, submit: "Please log in again to update income" }));
        return;
      }

      const method = editingIncome ? "PUT" : "POST";
      const url = editingIncome ? `/api/incomes?id=${editingIncome.id}` : "/api/incomes";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(incomeData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors((prev) => ({ ...prev, submit: data.error || "Failed to save income" }));
        return;
      }

      if (editingIncome && onUpdateIncome) {
        onUpdateIncome(editingIncome.id, incomeData);
      } else {
        onAddIncome(incomeData);
      }
      setFormData({
        description: "",
        category: categories[0] || "",
        date: new Date().toISOString().split("T")[0],
        amount: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to save income:", error);
      setErrors((prev) => ({ ...prev, submit: "Failed to save income" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    const categoryName = newCategory.trim();

    if (!categoryName) {
      alert("Please enter a category name");
      return;
    }

    setIsAddingCategory(true);
    setCategoryError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCategoryError("Please log in again to add categories");
        return;
      }

      const response = await fetch("/api/income-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCategoryError(data.error || "Failed to add category");
        return;
      }

      const createdName = data.category?.name || categoryName;

      setCategories((prev) => {
        if (prev.includes(createdName)) {
          return prev;
        }

        return [...prev, createdName].sort((a, b) => a.localeCompare(b));
      });

      setFormData((prev) => ({ ...prev, category: createdName }));
      setNewCategory("");
    } catch (error) {
      console.error("Failed to add income category:", error);
      setCategoryError("Failed to add category");
    } finally {
      setIsAddingCategory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingIncome ? "Edit" : "Add"} Income
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingIncome
                  ? "Update your income details."
                  : "Record your income and keep your financial summary updated."}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter income description"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 text-gray-900"
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-2">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={14} className="text-gray-500" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isLoadingCategories}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 text-gray-900 bg-white"
              >
                {categories.length === 0 ? (
                  <option value="" className="text-gray-900 bg-white">
                    {isLoadingCategories ? "Loading categories..." : "No categories yet"}
                  </option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat} value={cat} className="text-gray-900 bg-white">
                      {cat}
                    </option>
                  ))
                )}
                <option value={ADD_CATEGORY_OPTION} className="text-gray-900 bg-white">
                  + Add new category
                </option>
              </select>
              {categoryError && (
                <p className="text-xs text-red-600 mt-2">{categoryError}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarDays size={14} className="text-gray-500" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 text-gray-900"
              />
            </div>
          </div>

          {formData.category === ADD_CATEGORY_OPTION && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Type category name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={isAddingCategory}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {isAddingCategory ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (LKR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                LKR
              </span>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                placeholder="30000.00"
                inputMode="decimal"
                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 text-gray-900"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-600 mt-2">{errors.amount}</p>
            )}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSubmitting ? (editingIncome ? "Updating..." : "Adding...") : (editingIncome ? "Update Income" : "Add Income")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
