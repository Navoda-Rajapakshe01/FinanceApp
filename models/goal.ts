import mongoose from "mongoose";

export const goalSchema = new mongoose.Schema(
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
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [0, "Target amount must be positive"],
    },
    warningLimit: {
      type: Number,
      required: false,
      min: [0, "Warning limit must be non-negative"],
    },
    deadline: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    collection: "goals",
    timestamps: true,
  }
);

export const Goal = mongoose.models.Goal || mongoose.model("Goal", goalSchema);
