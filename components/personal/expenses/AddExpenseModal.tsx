"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, CreditCard, Tag, Wallet, X } from "lucide-react";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: {
    title: string;
    category: string;
    account: string;
    date: string;
    amount: number;
  }) => void;
  onUpdateExpense?: (expenseId: string, expense: {
    title: string;
    category: string;
    account: string;
    date: string;
    amount: number;
  }) => void;
  editingExpense?: {
    id: string;
    title: string;
    category: string;
    account: string;
    date: string;
    amount: number;
  } | null;
}

const accounts = ["Cash", "Card", "Bank Account", "Digital Wallet", "Other"];
const ADD_CATEGORY_OPTION = "__add_new_category__";

export default function AddExpenseModal({
  isOpen,
  onClose,
  onAddExpense,
  onUpdateExpense,
  editingExpense,
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    account: "Cash",
    date: new Date().toISOString().split("T")[0],
    amount: "",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    setCategoryError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCategoryError("Please log in again to load categories");
        return;
      }

      const response = await fetch("/api/expense-categories", {
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
      console.error("Failed to fetch categories:", error);
      setCategoryError("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setFormData({
          title: editingExpense.title,
          category: editingExpense.category,
          account: editingExpense.account,
          date: editingExpense.date,
          amount: String(editingExpense.amount),
        });
      } else {
        setFormData({
          title: "",
          category: "",
          account: "Cash",
          date: new Date().toISOString().split("T")[0],
          amount: "",
        });
      }
      fetchCategories();
    }
  }, [isOpen, editingExpense]);

  useEffect(() => {
    // This effect ensures that after categories are loaded, if we're editing,
    // we preserve the category from editingExpense
    if (editingExpense && categories.length > 0) {
      setFormData((prev) => ({
        ...prev,
        category: editingExpense.category,
      }));
    }
  }, [categories, editingExpense]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (
      !formData.title ||
      !formData.amount ||
      !formData.account ||
      !formData.category ||
      formData.category === ADD_CATEGORY_OPTION
    ) {
      alert("Please fill in all fields");
      return;
    }

    const parsedAmount = Number(formData.amount);

    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      alert("Please enter a valid amount");
      return;
    }

    const expenseData = {
      title: formData.title,
      category: formData.category,
      account: formData.account,
      date: formData.date,
      amount: parsedAmount,
    };

    if (editingExpense && onUpdateExpense) {
      onUpdateExpense(editingExpense.id, expenseData);
    } else {
      onAddExpense(expenseData);
    }

    setFormData({
      title: "",
      category: categories[0] || "",
      account: "Cash",
      date: new Date().toISOString().split("T")[0],
      amount: "",
    });
    onClose();
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

      const response = await fetch("/api/expense-categories", {
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
      console.error("Failed to add category:", error);
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
        <div className="px-6 py-5 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingExpense ? "Edit" : "Add"} Expense
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingExpense
                  ? "Update your expense details."
                  : "Record your spending and keep your budget accurate."}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                <Wallet size={20} className="text-red-600" />
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
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter expense title"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 text-gray-900"
            />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 text-gray-900 bg-white"
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

            {/* Account */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CreditCard size={14} className="text-gray-500" />
                Account
              </label>
              <select
                name="account"
                value={formData.account}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 text-gray-900 bg-white"
              >
                {accounts.map((account) => (
                  <option key={account} value={account} className="text-gray-900 bg-white">
                    {account}
                  </option>
                ))}
              </select>
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 text-gray-900"
              />
            </div>

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
                  className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
            >
              {editingExpense ? "Update Expense" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
