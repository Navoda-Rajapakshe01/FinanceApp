import mongoose from "mongoose";

export const incomeSchema = new mongoose.Schema(
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
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
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
    collection: "incomes",
    timestamps: true,
  }
);

export const Income =
  mongoose.models.Income || mongoose.model("Income", incomeSchema);
