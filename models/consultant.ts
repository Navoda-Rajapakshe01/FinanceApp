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
      required: [true, "Specialization is required"],
      enum: ["investment", "retirement", "tax", "wealth", "estate"],
    },
    yearsOfExperience: {
      type: String,
      required: [true, "Years of experience is required"],
      enum: ["0-2", "2-5", "5-10", "10+"],
    },
    certifications: {
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
