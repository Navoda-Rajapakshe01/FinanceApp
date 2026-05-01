import { connectDB } from "@/lib/db";
import { PersonalUser } from "@/models";
import {
  validatePassword,
  hashPassword,
  generateToken,
  validateEmail,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { fullName, email, phone, password, confirmPassword } =
      await request.json();

    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: "Password requirements not met", details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await PersonalUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await PersonalUser.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      accountType: "personal",
    });

    // Generate JWT token
    const token = generateToken({
      _id: newUser._id.toString(),
      email: newUser.email,
      accountType: "personal",
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          accountType: newUser.accountType,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
