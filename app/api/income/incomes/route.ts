import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Income } from "@/models";
import { NextRequest, NextResponse } from "next/server";

function getAuthPayload(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const incomes = await Income.find({
      userId: payload._id,
      accountType: payload.accountType,
    })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      incomes: incomes.map((income) => ({
        id: income._id.toString(),
        description: income.description,
        category: income.category,
        date: income.date,
        amount: income.amount,
      })),
    });
  } catch (error) {
    console.error("Fetch incomes error:", error);
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

    const { description, category, date, amount } = await request.json();

    if (!description || !category || !date || amount === undefined) {
      return NextResponse.json(
        { error: "All income fields are required" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json(
        { error: "Please provide a valid amount" },
        { status: 400 }
      );
    }

    await connectDB();

    const created = await Income.create({
      userId: payload._id,
      accountType: payload.accountType,
      description: String(description).trim(),
      category: String(category).trim(),
      date: String(date).trim(),
      amount: parsedAmount,
    });

    return NextResponse.json(
      {
        message: "Income created",
        income: {
          id: created._id.toString(),
          description: created.description,
          category: created.category,
          date: created.date,
          amount: created.amount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create income error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const incomeId = searchParams.get("id");

    if (!incomeId) {
      return NextResponse.json(
        { error: "Income ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const income = await Income.findOne({
      _id: incomeId,
      userId: payload._id,
      accountType: payload.accountType,
    });

    if (!income) {
      return NextResponse.json(
        { error: "Income not found" },
        { status: 404 }
      );
    }

    await Income.deleteOne({ _id: incomeId });

    return NextResponse.json(
      { message: "Income deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete income error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const incomeId = searchParams.get("id");

    if (!incomeId) {
      return NextResponse.json(
        { error: "Income ID is required" },
        { status: 400 }
      );
    }

    const { description, category, date, amount } = await request.json();

    if (!description || !category || !date || amount === undefined) {
      return NextResponse.json(
        { error: "All income fields are required" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json(
        { error: "Please provide a valid amount" },
        { status: 400 }
      );
    }

    await connectDB();

    const income = await Income.findOne({
      _id: incomeId,
      userId: payload._id,
      accountType: payload.accountType,
    });

    if (!income) {
      return NextResponse.json(
        { error: "Income not found" },
        { status: 404 }
      );
    }

    const updated = await Income.findByIdAndUpdate(
      incomeId,
      {
        description: String(description).trim(),
        category: String(category).trim(),
        date: String(date).trim(),
        amount: parsedAmount,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Income updated",
        income: {
          id: updated._id.toString(),
          description: updated.description,
          category: updated.category,
          date: updated.date,
          amount: updated.amount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update income error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
