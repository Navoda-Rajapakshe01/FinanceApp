import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const daySchema = new mongoose.Schema({
  day: { type: String, required: true },
  dayShort: { type: String, required: true },
  slots: { type: [slotSchema], default: [] },
  available: { type: Boolean, default: false },
});

export const scheduleSchema = new mongoose.Schema(
  {
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: true, index: true },
    days: { type: [daySchema], default: [] },
    // defaultSlots: slots that apply to every date unless overridden
    defaultSlots: { type: [slotSchema], default: [] },
    // dateSlots: specific calendar dates with their own slots
    dateSlots: {
      type: [
        new mongoose.Schema({
          date: { type: String, required: true },
          slots: { type: [slotSchema], default: [] },
          available: { type: Boolean, default: false },
        }),
      ],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "schedules" }
);

export const Schedule = mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);
