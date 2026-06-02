import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Expense, Income, PersonalUser } from "@/models";
import { verifyToken } from "@/lib/auth";
import generateTextFromGoogle from "@/lib/googleAI";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    const payload = verifyToken(token);

    if (!payload || payload.accountType !== "personal") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = payload._id;

    // compute last month period and previous months for pattern analysis
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonthMonth = String(lastMonthDate.getMonth() + 1).padStart(2, "0");
    const lastMonthPrefix = `${lastMonthYear}-${lastMonthMonth}`; // YYYY-MM

    // build month ranges: last N months (including last month)
    const monthsToCompare = 3; // last 3 months
    const monthPrefixes: string[] = [];
    for (let i = monthsToCompare - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - 1 - i, 1);
      monthPrefixes.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    // helper to get start/end dates for a month prefix
    const monthRange = (prefix: string) => {
      const [y, m] = prefix.split("-");
      const year = Number(y);
      const month = Number(m);
      const start = `${prefix}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end = `${prefix}-${String(lastDay).padStart(2, "0")}`;
      return { start, end };
    };

    // fetch expenses/incomes for last N months only
    const expPromises = monthPrefixes.map((p) => {
      const { start, end } = monthRange(p);
      return Expense.find({ userId, date: { $gte: start, $lte: end } }).lean();
    });
    const incPromises = monthPrefixes.map((p) => {
      const { start, end } = monthRange(p);
      return Income.find({ userId, date: { $gte: start, $lte: end } }).lean();
    });

    const expResults = await Promise.all(expPromises);
    const incResults = await Promise.all(incPromises);

    const monthTotals: { month: string; expenses: number; incomes: number }[] = monthPrefixes.map((p, idx) => {
      const exps = expResults[idx] || [];
      const incs = incResults[idx] || [];
      return {
        month: p,
        expenses: exps.reduce((s: number, e: any) => s + Number(e.amount || 0), 0),
        incomes: incs.reduce((s: number, i: any) => s + Number(i.amount || 0), 0),
      };
    });

    // work with last month data specifically
    const lastIdx = monthPrefixes.length - 1;
    const lastMonthExpenses = expResults[lastIdx] || [];
    const lastMonthIncomes = incResults[lastIdx] || [];

    const totalExpenses = lastMonthExpenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
    const totalIncomes = lastMonthIncomes.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);

    const byCategory: Record<string, number> = {};
    for (const e of lastMonthExpenses) {
      const k = e.category || "Uncategorized";
      byCategory[k] = (byCategory[k] || 0) + Number(e.amount || 0);
    }

    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    const largestExpense = lastMonthExpenses.slice().sort((a: any, b: any) => Number(b.amount || 0) - Number(a.amount || 0))[0] || null;

    // build prompt focusing on last month and patterns over recent months
    const promptLines: string[] = [];
    promptLines.push(`You are a helpful financial advisor. Analyze the user's finances for the last month (${lastMonthPrefix}) and compare patterns across the previous ${monthsToCompare} months. Provide:`);
    promptLines.push(`1) A concise analysis (3-5 sentences) summarizing last month's income vs expenses and notable patterns.`);
    promptLines.push(`2) Top 3 opportunities to save based on last month's top categories.`);
    promptLines.push(`3) A practical 1-month action plan with 3 clear steps.`);
    promptLines.push(`Context:`);
    promptLines.push(`Last month (${lastMonthPrefix}) income: ${totalIncomes.toFixed(2)} LKR`);
    promptLines.push(`Last month (${lastMonthPrefix}) expenses: ${totalExpenses.toFixed(2)} LKR`);
    promptLines.push(`Recent months (month: expenses / incomes):`);
    monthTotals.forEach((m) => promptLines.push(`- ${m.month}: ${m.expenses.toFixed(2)} / ${m.incomes.toFixed(2)}`));
    promptLines.push(`Top expense categories for ${lastMonthPrefix}:`);
    topCategories.forEach((c) => promptLines.push(`- ${c.category}: ${c.amount.toFixed(2)} LKR`));
    if (largestExpense) promptLines.push(`Largest expense: ${largestExpense.title || largestExpense.category} — ${Number(largestExpense.amount || 0).toFixed(2)} LKR on ${largestExpense.date}`);
    promptLines.push(`Answer in plain text, concise, actionable, and don't mention you are an AI.`);

    const prompt = promptLines.join("\n");

    const aiText = await generateTextFromGoogle(prompt);

    const result = {
      analysis: aiText || null,
      month: lastMonthPrefix,
      monthTotals,
      totals: { totalExpenses, totalIncomes },
      topCategories,
      largestExpense,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Insights analysis error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
