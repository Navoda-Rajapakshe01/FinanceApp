import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ExpenseCategory } from "@/models";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Health & Fitness",
  "Education",
  "Other",
];

function getAuthPayload(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  return verifyToken(token);
}

function normalizeCategoryName(name: string): string {
  return name.trim().toLowerCase();
}

async function ensureDefaultCategories(userId: string, accountType: "personal" | "consultant") {
  await ExpenseCategory.bulkWrite(
    DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
      updateOne: {
        filter: {
          userId,
          accountType,
          normalizedName: normalizeCategoryName(name),
        },
        update: {
          $setOnInsert: {
            userId,
            accountType,
            name,
            normalizedName: normalizeCategoryName(name),
          },
        },
        upsert: true,
      },
    }))
  );
}

export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    await ensureDefaultCategories(payload._id, payload.accountType);

    const categories = await ExpenseCategory.find({
      userId: payload._id,
      accountType: payload.accountType,
    })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      categories: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
      })),
    });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return NextResponse.json(
        { error: "Category name cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedName.length > 50) {
      return NextResponse.json(
        { error: "Category name is too long" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedName = normalizeCategoryName(trimmedName);

    const existing = await ExpenseCategory.findOne({
      userId: payload._id,
      accountType: payload.accountType,
      normalizedName,
    }).lean();

    if (existing) {
      return NextResponse.json(
        {
          message: "Category already exists",
          category: {
            id: existing._id.toString(),
            name: existing.name,
          },
        },
        { status: 200 }
      );
    }

    const created = await ExpenseCategory.create({
      userId: payload._id,
      accountType: payload.accountType,
      name: trimmedName,
      normalizedName,
    });

    return NextResponse.json(
      {
        message: "Category created",
        category: {
          id: created._id.toString(),
          name: created.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
