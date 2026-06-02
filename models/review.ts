import mongoose from "mongoose";

export const reviewSchema = new mongoose.Schema(
  {
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "PersonalUser", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "reviews" }
);

export const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
