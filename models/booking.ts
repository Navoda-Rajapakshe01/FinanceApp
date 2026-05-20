import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  start: { type: String, required: true },
  end: { type: String, required: true },
  clientName: { type: String },
  clientEmail: { type: String },
  status: { type: String, default: "confirmed" },
  createdAt: { type: Date, default: Date.now },
});

export const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
