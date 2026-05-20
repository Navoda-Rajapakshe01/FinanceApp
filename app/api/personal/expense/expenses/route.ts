import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Expense } from "@/models";
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

    const expenses = await Expense.find({
      userId: payload._id,
      accountType: payload.accountType,
    })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      expenses: expenses.map((expense) => ({
        id: expense._id.toString(),
        title: expense.title,
        category: expense.category,
        account: expense.account,
        date: expense.date,
        amount: expense.amount,
      })),
    });
  } catch (error) {
    console.error("Fetch expenses error:", error);
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

    const { title, category, account, date, amount } = await request.json();

    if (!title || !category || !account || !date || amount === undefined) {
      return NextResponse.json(
        { error: "All expense fields are required" },
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

    const created = await Expense.create({
      userId: payload._id,
      accountType: payload.accountType,
      title: String(title).trim(),
      category: String(category).trim(),
      account: String(account).trim(),
      date: String(date).trim(),
      amount: parsedAmount,
    });

    return NextResponse.json(
      {
        message: "Expense created",
        expense: {
          id: created._id.toString(),
          title: created.title,
          category: created.category,
          account: created.account,
          date: created.date,
          amount: created.amount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create expense error:", error);
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
    const expenseId = searchParams.get("id");

    if (!expenseId) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const expense = await Expense.findOne({
      _id: expenseId,
      userId: payload._id,
      accountType: payload.accountType,
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    await Expense.deleteOne({ _id: expenseId });

    return NextResponse.json(
      { message: "Expense deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete expense error:", error);
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
    const expenseId = searchParams.get("id");

    if (!expenseId) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    const { title, category, account, date, amount } = await request.json();

    if (!title || !category || !account || !date || amount === undefined) {
      return NextResponse.json(
        { error: "All expense fields are required" },
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

    const expense = await Expense.findOne({
      _id: expenseId,
      userId: payload._id,
      accountType: payload.accountType,
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    const updated = await Expense.findByIdAndUpdate(
      expenseId,
      {
        title: String(title).trim(),
        category: String(category).trim(),
        account: String(account).trim(),
        date: String(date).trim(),
        amount: parsedAmount,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Expense updated",
        expense: {
          id: updated._id.toString(),
          title: updated.title,
          category: updated.category,
          account: updated.account,
          date: updated.date,
          amount: updated.amount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update expense error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
