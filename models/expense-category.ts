import mongoose from "mongoose";

export const expenseCategorySchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    normalizedName: {
      type: String,
      required: [true, "Normalized category name is required"],
      trim: true,
    },
  },
  {
    collection: "expense_categories",
    timestamps: true,
  }
);

expenseCategorySchema.index(
  { userId: 1, accountType: 1, normalizedName: 1 },
  { unique: true }
);

export const ExpenseCategory =
  mongoose.models.ExpenseCategory ||
  mongoose.model("ExpenseCategory", expenseCategorySchema);
