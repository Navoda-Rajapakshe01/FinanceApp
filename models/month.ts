import mongoose from "mongoose";

export const monthSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: [true, "Month value is required"],
      enum: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
      unique: true,
    },
    label: {
      type: String,
      required: [true, "Month label is required"],
      enum: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    },
    fullName: {
      type: String,
      required: [true, "Month full name is required"],
      enum: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
  },
  {
    collection: "months",
    timestamps: false,
  }
);

export const Month =
  mongoose.models.Month || mongoose.model("Month", monthSchema);
