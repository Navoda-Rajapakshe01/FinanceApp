import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  // legacy consultant field kept for backward compatibility
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: false, index: true },
  // generic recipient support
  recipientId: { type: String, index: true },
  recipientType: { type: String, index: true }, // e.g. 'consultant' | 'personal'
  type: { type: String, required: true },
  message: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  read: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
