import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Goal, Expense } from "@/models";
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

    const goals = await Goal.find({
      userId: payload._id,
      accountType: payload.accountType,
    })
      .sort({ createdAt: -1 })
      .lean();

    const nowDate = new Date();

    const enriched = [];
    for (const g of goals) {
      try {
        // Determine period: from goal creation date to deadline (inclusive)
        const startDate = g.createdAt ? new Date(g.createdAt).toISOString().split("T")[0] : null;
        const endDate = g.deadline ? String(g.deadline).trim() : null;

        let totalSpent = 0;
        if (startDate && endDate) {
          const agg = await Expense.aggregate([
            {
              $match: {
                userId: payload._id,
                accountType: payload.accountType,
                category: g.category,
                date: { $gte: startDate, $lte: endDate },
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);
          totalSpent = (agg && agg[0] && agg[0].total) ? Number(agg[0].total) : 0;
        }

        // Determine status:
        // - If totalSpent already exceeds targetAmount -> lost immediately
        // - Else if deadline passed -> achieved
        // - Otherwise -> active
        let status = "active";
        const target = Number(g.targetAmount || 0);
        if (totalSpent > target) {
          status = "lost";
        } else if (g.deadline) {
          const deadlineDate = new Date(g.deadline + "T23:59:59Z");
          if (nowDate > deadlineDate) {
            status = "achieved";
          } else {
            status = "active";
          }
        }

        enriched.push({
          id: g._id.toString(),
          title: g.title,
          category: g.category,
          targetAmount: g.targetAmount,
          warningLimit: g.warningLimit,
          deadline: g.deadline,
          totalSpent,
          status,
        });
      } catch (e) {
        console.error("Failed to compute goal totals for goal", g._id, e);
        enriched.push({
          id: g._id.toString(),
          title: g.title,
          category: g.category,
          targetAmount: g.targetAmount,
          warningLimit: g.warningLimit,
          deadline: g.deadline,
          totalSpent: 0,
          status: "active",
        });
      }
    }

    return NextResponse.json({ goals: enriched });
  } catch (error) {
    console.error("Fetch goals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, category, targetAmount, deadline, warningLimit } = await request.json();

    if (!title || !category || targetAmount === undefined) {
      return NextResponse.json({ error: "All goal fields are required" }, { status: 400 });
    }

    const parsedTarget = Number(targetAmount);

    if (Number.isNaN(parsedTarget) || parsedTarget < 0) {
      return NextResponse.json({ error: "Please provide valid amounts" }, { status: 400 });
    }

    let parsedWarning: number | undefined = undefined;
    if (warningLimit !== undefined && warningLimit !== null && warningLimit !== "") {
      parsedWarning = Number(warningLimit);
      if (Number.isNaN(parsedWarning) || parsedWarning < 0) {
        return NextResponse.json({ error: "Please provide a valid warning limit" }, { status: 400 });
      }
      if (parsedWarning > parsedTarget) {
        return NextResponse.json({ error: "Warning limit cannot exceed target amount" }, { status: 400 });
      }
    }

    await connectDB();

    const created = await Goal.create({
      userId: payload._id,
      accountType: payload.accountType,
      title: String(title).trim(),
      category: String(category).trim(),
      targetAmount: parsedTarget,
      warningLimit: parsedWarning,
      deadline: String(deadline || "").trim(),
    });

    return NextResponse.json({
      message: "Goal created",
      goal: {
        id: created._id.toString(),
        title: created.title,
        category: created.category,
        targetAmount: created.targetAmount,
        warningLimit: created.warningLimit,
        deadline: created.deadline,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("id");

    if (!goalId) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }

    await connectDB();

    const goal = await Goal.findOne({ _id: goalId, userId: payload._id, accountType: payload.accountType });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await Goal.deleteOne({ _id: goalId });

    return NextResponse.json({ message: "Goal deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete goal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("id");

    if (!goalId) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }

    const { title, category, targetAmount, deadline, warningLimit } = await request.json();

    if (!title || !category || targetAmount === undefined) {
      return NextResponse.json({ error: "All goal fields are required" }, { status: 400 });
    }

    const parsedTarget = Number(targetAmount);

    if (Number.isNaN(parsedTarget) || parsedTarget < 0) {
      return NextResponse.json({ error: "Please provide valid amounts" }, { status: 400 });
    }

    let parsedWarning: number | undefined = undefined;
    if (warningLimit !== undefined && warningLimit !== null && warningLimit !== "") {
      parsedWarning = Number(warningLimit);
      if (Number.isNaN(parsedWarning) || parsedWarning < 0) {
        return NextResponse.json({ error: "Please provide a valid warning limit" }, { status: 400 });
      }
      if (parsedWarning > parsedTarget) {
        return NextResponse.json({ error: "Warning limit cannot exceed target amount" }, { status: 400 });
      }
    }

    await connectDB();

    const goal = await Goal.findOne({ _id: goalId, userId: payload._id, accountType: payload.accountType });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const updated = await Goal.findByIdAndUpdate(
      goalId,
      {
        title: String(title).trim(),
        category: String(category).trim(),
        targetAmount: parsedTarget,
        warningLimit: parsedWarning,
        deadline: String(deadline || "").trim(),
      },
      { new: true }
    );

    return NextResponse.json({
        message: "Goal updated",
      goal: {
        id: updated._id.toString(),
        title: updated.title,
        category: updated.category,
        targetAmount: updated.targetAmount,
        warningLimit: updated.warningLimit,
        deadline: updated.deadline,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
