import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    start: { type: String },
    end: { type: String },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    day: { type: String },
    available: { type: Boolean, default: false },
    slots: { type: [slotSchema], default: [] },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: true, index: true },
    days: { type: [daySchema], default: [] },
    // per-date slots for specific dates (YYYY-MM-DD)
    dates: {
      type: [
        new mongoose.Schema(
          {
            date: { type: String },
            slots: { type: [slotSchema], default: [] },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true, collection: "schedules" }
);

export const Schedule = mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);
