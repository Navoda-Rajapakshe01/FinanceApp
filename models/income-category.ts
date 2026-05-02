import mongoose from "mongoose";

export const incomeCategorySchema = new mongoose.Schema(
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
    collection: "income_categories",
    timestamps: true,
  }
);

incomeCategorySchema.index(
  { userId: 1, accountType: 1, normalizedName: 1 },
  { unique: true }
);

export const IncomeCategory =
  mongoose.models.IncomeCategory ||
  mongoose.model("IncomeCategory", incomeCategorySchema);
