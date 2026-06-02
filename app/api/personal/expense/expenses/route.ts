import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Expense, Goal } from "@/models";
import { notifyRecipient } from "@/lib/notifications";
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

    // After creating expense, check any goals for this user/category that have warningLimit
    try {
      const goals = await Goal.find({ userId: payload._id, category: created.category, warningLimit: { $exists: true, $ne: null } }).lean();
      if (goals && goals.length) {
        for (const g of goals) {
          try {
            // limit aggregation to the goal period if deadline and createdAt exist
            const startDate = g.createdAt ? new Date(g.createdAt).toISOString().split("T")[0] : null;
            const endDate = g.deadline ? String(g.deadline).trim() : null;
            const match: any = { userId: payload._id, category: created.category };
            if (startDate && endDate) match.date = { $gte: startDate, $lte: endDate };
            const agg = await Expense.aggregate([
              { $match: match },
              { $group: { _id: null, total: { $sum: "$amount" } } },
            ]);
            const total = (agg && agg[0] && agg[0].total) ? Number(agg[0].total) : 0;
            const warning = Number(g.warningLimit || 0);
            if (warning > 0 && total >= warning) {
              // emit transient SSE for immediate toast; do not persist notification
              const remaining = (g.targetAmount || 0) - total;
              const message = `You're going to lose the goal "${g.title}" — spent LKR ${total.toFixed(2)} which meets/exceeds your warning limit of LKR ${warning.toFixed(2)}.`;
              const transient = {
                _id: `t_${Date.now()}`,
                type: "goal.warning",
                message,
                data: { goalId: String(g._id), goalTitle: g.title, totalSpent: total, warningLimit: warning, remaining: remaining },
                read: false,
                createdAt: new Date().toISOString(),
              };
              try {
                notifyRecipient("personal", String(payload._id), { type: "notification.created", notification: transient });
              } catch (e) {
                // ignore notify errors
              }
            }
          } catch (e) {
            console.error("Goal warning check failed:", e);
          }
        }
      }
    } catch (e) {
      console.error("Failed to check goals after expense create:", e);
    }

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

    // After updating expense, re-check goals for this user/category and send warnings if threshold reached
    try {
      const goals = await Goal.find({ userId: payload._id, category: updated.category, warningLimit: { $exists: true, $ne: null } }).lean();
      if (goals && goals.length) {
        for (const g of goals) {
          try {
            // limit aggregation to the goal period if deadline and createdAt exist
            const startDate = g.createdAt ? new Date(g.createdAt).toISOString().split("T")[0] : null;
            const endDate = g.deadline ? String(g.deadline).trim() : null;
            const match: any = { userId: payload._id, category: updated.category };
            if (startDate && endDate) match.date = { $gte: startDate, $lte: endDate };
            const agg = await Expense.aggregate([
              { $match: match },
              { $group: { _id: null, total: { $sum: "$amount" } } },
            ]);
            const total = (agg && agg[0] && agg[0].total) ? Number(agg[0].total) : 0;
            const warning = Number(g.warningLimit || 0);
            if (warning > 0 && total >= warning) {
              // emit transient SSE for immediate toast; do not persist notification
              const remaining = (g.targetAmount || 0) - total;
              const message = `You're going to lose the goal "${g.title}" — spent LKR ${total.toFixed(2)} which meets/exceeds your warning limit of LKR ${warning.toFixed(2)}.`;
              const transient = {
                _id: `t_${Date.now()}`,
                type: "goal.warning",
                message,
                data: { goalId: String(g._id), goalTitle: g.title, totalSpent: total, warningLimit: warning, remaining: remaining },
                read: false,
                createdAt: new Date().toISOString(),
              };
              try {
                notifyRecipient("personal", String(payload._id), { type: "notification.created", notification: transient });
              } catch (e) {
                // ignore notify errors
              }
            }
          } catch (e) {
            console.error("Goal warning check failed after update:", e);
          }
        }
      }
    } catch (e) {
      console.error("Failed to check goals after expense update:", e);
    }

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
