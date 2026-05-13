import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Consultant } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Only return consultants who acceptBookings
    const consultants = await Consultant.find({ acceptBookings: true }, { password: 0 }).sort({ createdAt: -1 }).lean();

    const sanitized = consultants.map((c: any) => ({
      id: c._id.toString(),
      fullName: c.fullName,
      bio: c.bio || "",
      specializations: c.specializations || (c.specialization ? [c.specialization] : []),
      yearsOfExperience: c.yearsOfExperience || "",
      certifications: c.certifications || "",
      phone: c.phone || "",
      hourlyRate: c.hourlyRate || null,
      sessionDuration: c.sessionDuration || null,
      acceptBookings: !!c.acceptBookings,
      location: c.location || "",
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ consultants: sanitized });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
