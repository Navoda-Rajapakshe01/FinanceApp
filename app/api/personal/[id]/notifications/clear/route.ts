import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models";

export async function POST(req: Request, context: any) {
  const params = await context.params;
  const id = params?.id;
  if (!id) return NextResponse.json({ ok: false });

  try {
    await connectDB();
    await Notification.deleteMany({ recipientId: id, recipientType: "personal" });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Failed to clear personal notifications:", err?.message || err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
