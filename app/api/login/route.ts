import { connectDB } from "@/lib/db";
import { Consultant, PersonalUser } from "@/models";
import { comparePassword, generateToken, validateEmail } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = String(email).toLowerCase();

    const personalUser = await PersonalUser.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (personalUser) {
      const isMatch = await comparePassword(password, personalUser.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = generateToken({
        _id: personalUser._id.toString(),
        email: personalUser.email,
        accountType: "personal",
      });

      return NextResponse.json({
        message: "Login successful",
        user: {
          id: personalUser._id,
          fullName: personalUser.fullName,
          email: personalUser.email,
          accountType: personalUser.accountType,
        },
        token,
      });
    }

    const consultant = await Consultant.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!consultant) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isConsultantMatch = await comparePassword(password, consultant.password);
    if (!isConsultantMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = generateToken({
      _id: consultant._id.toString(),
      email: consultant.email,
      accountType: "consultant",
    });

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: consultant._id,
        fullName: consultant.fullName,
        email: consultant.email,
        specialization: consultant.specialization,
        accountType: consultant.accountType,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
