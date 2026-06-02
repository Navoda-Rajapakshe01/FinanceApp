import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models";

export async function GET(req: Request, context: any) {
  const params = await context.params;
  const id = params?.id;
  if (!id) return NextResponse.json({ notifications: [] });

  try {
    await connectDB();
    const list = await Notification.find({ $or: [{ consultant: id }, { recipientId: id, recipientType: "consultant" }] }).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ notifications: list });
  } catch (err: any) {
    console.error("Failed to fetch notifications:", err?.message || err);
    return NextResponse.json({ notifications: [] });
  }
}
