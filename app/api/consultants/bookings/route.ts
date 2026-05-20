import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models";
import { verifyToken } from "@/lib/auth";

async function requireConsultant(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.split(" ")[1];
  if (!token) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const payload = verifyToken(token);
  if (!payload || payload.accountType !== "consultant") return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { payload };
}

export async function GET(request: NextRequest) {
  try {
    const req = await requireConsultant(request);
    if ((req as any).error) return (req as any).error;
    const { payload }: any = req;

    const url = new URL(request.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");
    if (!start || !end) return NextResponse.json({ error: "start and end required" }, { status: 400 });

    await connectDB();

    const bookings = await Booking.find({ consultant: payload._id, date: { $gte: start, $lte: end } }).lean();

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
