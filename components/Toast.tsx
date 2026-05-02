"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  isOpen,
  message,
  type = "success",
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50 animate-fade-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${
          isSuccess ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {isSuccess ? (
          <CheckCircle size={20} />
        ) : (
          <AlertCircle size={20} />
        )}
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
