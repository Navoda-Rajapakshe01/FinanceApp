import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Consultant } from "@/models";
import { verifyToken } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    const token = auth?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.accountType !== "consultant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await request.json();

    await connectDB();

    const allowed: Record<string, boolean> = {
      bio: true,
      specializations: true,
      hourlyRate: true,
      sessionDuration: true,
      acceptBookings: true,
      location: true,
      phone: true,
      yearsOfExperience: true,
      website: true,
      linkedin: true,
    };

    const docUpdates: any = {};
    Object.keys(updates).forEach((key) => {
      if (allowed[key]) {
        if (key === "specializations") {
          const val = updates[key];
          if (Array.isArray(val)) docUpdates[key] = val;
          else if (typeof val === "string") docUpdates[key] = val.split(",").map((s: string) => s.trim()).filter(Boolean);
        } else {
          docUpdates[key] = updates[key];
        }
      }
    });

    docUpdates.updatedAt = new Date();

    const updated = await Consultant.findByIdAndUpdate(payload._id, { $set: docUpdates }, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: "Consultant not found" }, { status: 404 });

    const sanitized = {
      id: updated._id.toString(),
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone || "",
      bio: updated.bio || "",
      specializations: updated.specializations || [],
      hourlyRate: updated.hourlyRate || null,
      sessionDuration: updated.sessionDuration || null,
      acceptBookings: !!updated.acceptBookings,
      location: updated.location || "",
      website: updated.website || "",
      linkedin: updated.linkedin || "",
      yearsOfExperience: updated.yearsOfExperience || "",
      accountType: updated.accountType,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    return NextResponse.json({ message: "Profile updated", consultant: sanitized });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    const token = auth?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.accountType !== "consultant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const consult = await Consultant.findById(payload._id, { password: 0 }).lean();
    if (!consult) return NextResponse.json({ error: "Consultant not found" }, { status: 404 });

    const sanitized = {
      id: consult._id.toString(),
      fullName: consult.fullName,
      email: consult.email,
      phone: consult.phone || "",
      bio: consult.bio || "",
      specializations: consult.specializations || [],
      hourlyRate: consult.hourlyRate || null,
      sessionDuration: consult.sessionDuration || null,
      acceptBookings: !!consult.acceptBookings,
      location: consult.location || "",
      website: consult.website || "",
      linkedin: consult.linkedin || "",
      yearsOfExperience: consult.yearsOfExperience || "",
      accountType: consult.accountType,
      createdAt: consult.createdAt,
      updatedAt: consult.updatedAt,
    };

    return NextResponse.json({ consultant: sanitized });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
