import { connectDB } from "@/lib/db";
import { Review, PersonalUser } from "@/models";
import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET: /api/consultants/reviews?consultantId=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const consultantId = url.searchParams.get("consultantId");

    if (!consultantId) {
      return NextResponse.json({ error: "consultantId is required" }, { status: 400 });
    }

    await connectDB();

    const reviews = await Review.find({ consultant: consultantId })
      .sort({ createdAt: -1 })
      .lean();

    const userIds = Array.from(new Set(reviews.map((r: any) => String(r.user))));
    const users = await PersonalUser.find({ _id: { $in: userIds } }).lean();
    const userMap: Record<string, any> = {};
    users.forEach((u: any) => (userMap[String(u._id)] = u));

    const out = reviews.map((r: any) => ({
      id: r._id.toString(),
      consultant: String(r.consultant),
      user: String(r.user),
      authorName: (userMap[String(r.user)] || {}).fullName || "Anonymous",
      rating: r.rating,
      comment: r.comment || "",
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ reviews: out });
  } catch (err) {
    console.error("Reviews GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: create a new review. Body: { consultantId, rating, comment }
export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    const payload = verifyToken(token);

    if (!payload || payload.accountType !== "personal") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { consultantId, rating, comment } = body || {};

    if (!consultantId || !rating) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    // Optionally, one could verify the personal user exists
    const user = await PersonalUser.findById(payload._id).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const created = await Review.create({
      consultant: consultantId,
      user: payload._id,
      rating: Number(rating),
      comment: String(comment || ""),
    });

    const out = {
      id: created._id.toString(),
      consultant: String(created.consultant),
      user: String(created.user),
      authorName: user.fullName || "Anonymous",
      rating: created.rating,
      comment: created.comment || "",
      createdAt: created.createdAt,
    };

    return NextResponse.json({ review: out });
  } catch (err) {
    console.error("Reviews POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
