"use client";

import React, { useState } from "react";
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
}

const categories = [
  "Salary", 
  "Freelance",
  "Investments",
  "Bonus",
  "Gift",
  "Side Business",
  "Other",
];

export default function AddIncomeModal({
  isOpen,
  onClose,
  onAddIncome,
}: AddIncomeModalProps) {
  const [formData, setFormData] = useState({
    description: "",
    category: "Salary",
    date: new Date().toISOString().split("T")[0],
    amount: "",
  });
  const [errors, setErrors] = useState<{
    description?: string;
    amount?: string;
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
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

    onAddIncome({
      description: formData.description.trim(),
      category: formData.category,
      date: formData.date,
      amount: parsedAmount,
    });
    setFormData({
      description: "",
      category: "Salary",
      date: new Date().toISOString().split("T")[0],
      amount: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Income</h2>
              <p className="text-sm text-gray-600 mt-1">
                Record your income and keep your financial summary updated.
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 text-gray-900 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-gray-900 bg-white">
                    {cat}
                  </option>
                ))}
              </select>
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
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Add Income
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
