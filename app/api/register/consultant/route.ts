import { connectDB } from "@/lib/db";
import { Consultant } from "@/models";
import {
  validatePassword,
  hashPassword,
  generateToken,
  validateEmail,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, password, confirmPassword } = await request.json();

    // Basic validation
    const requiredFields = [fullName, email, phone, password, confirmPassword];
    if (requiredFields.some((field) => !field)) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    // Check password match
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: "Password requirements not met", details: passwordValidation.errors }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Check if consultant with email already exists
    const existingConsultant = await Consultant.findOne({ email });
    if (existingConsultant) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new consultant
    const newConsultant = await Consultant.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      accountType: "consultant",
    });

    // Generate JWT token
    const token = generateToken({
      _id: newConsultant._id.toString(),
      email: newConsultant.email,
      accountType: "consultant",
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Consultant account created successfully",
        user: {
          id: newConsultant._id,
          fullName: newConsultant.fullName,
          email: newConsultant.email,
          accountType: newConsultant.accountType,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Consultant registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
