import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking, Consultant } from "@/models";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth || "";
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ bookings: [] });

    await connectDB();

    const bookings = await Booking.find({ clientEmail: payload.email }).sort({ date: 1, start: 1 }).lean();

    const consultantIds = Array.from(new Set(bookings.map((b: any) => String(b.consultant))));
    const consultants = consultantIds.length ? await Consultant.find({ _id: { $in: consultantIds } }, { fullName: 1 }).lean() : [];
    const consultMap: Record<string, any> = {};
    (consultants || []).forEach((c: any) => (consultMap[String(c._id)] = c));

    const results = (bookings || []).map((b: any) => ({
      id: b._id,
      consultantId: String(b.consultant),
      consultantName: consultMap[String(b.consultant)]?.fullName || "Consultant",
      date: b.date,
      start: b.start,
      end: b.end,
      status: b.status || "",
    }));

    return NextResponse.json({ bookings: results });
  } catch (err: any) {
    console.error("personal bookings error:", err);
    return NextResponse.json({ bookings: [] });
  }
}
