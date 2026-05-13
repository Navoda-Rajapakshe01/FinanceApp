import mongoose from "mongoose";

export const consultantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    specialization: {
      type: String,
      enum: ["investment", "retirement", "tax", "wealth", "estate"],
    },
    yearsOfExperience: {
      type: String,
      enum: ["0-2", "2-5", "5-10", "10+"],
    },
    certifications: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      required: true,
    },
    specializations: {
      type: [String],
      default: [],
      required: true,
    },
    hourlyRate: {
      type: Number,
      default: 0,
      required: true,
    },
    sessionDuration: {
      type: Number,
      default: 60,
      required: true,
    },
    acceptBookings: {
      type: Boolean,
      default: false,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    accountType: {
      type: String,
      default: "consultant",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "consultants" }
);

export const Consultant =
  mongoose.models.Consultant || mongoose.model("Consultant", consultantSchema);
