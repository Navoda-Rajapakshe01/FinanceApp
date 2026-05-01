import mongoose from "mongoose";

export const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    accountType: {
      type: String,
      required: [true, "Account type is required"],
      enum: ["personal", "consultant"],
      default: "personal",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    account: {
      type: String,
      required: [true, "Account is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
  },
  {
    collection: "expenses",
    timestamps: true,
  }
);

export const Expense =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
