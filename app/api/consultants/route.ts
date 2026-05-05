import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Consultant } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const consultants = await Consultant.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();

    const sanitized = consultants.map((c: any) => ({
      id: c._id.toString(),
      fullName: c.fullName,
      specialization: c.specialization,
      yearsOfExperience: c.yearsOfExperience,
      certifications: c.certifications || "",
      phone: c.phone || "",
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ consultants: sanitized });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
