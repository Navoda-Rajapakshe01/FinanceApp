import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Expense, Income, Goal } from "@/models";
import { NextRequest, NextResponse } from "next/server";
import generateTextFromGoogle from "@/lib/googleAI";

function getAuthPayload(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  return verifyToken(token);
}

// Google AI call moved to lib/googleAI.generateTextFromGoogle

function heuristicTips(summary: { totalIncome: number; totalExpense: number; topCategories: Array<{ category: string; amount: number }>; largestExpense?: any; goals: any[] }) {
  const tips: string[] = [];
  const { totalIncome, totalExpense, topCategories, largestExpense, goals } = summary;

  // Basic savings suggestions
  tips.push(`Try to save at least 5% of your monthly income automatically into a separate savings account.`);

  if (totalIncome > 0) {
    const ratio = Math.round((totalExpense / totalIncome) * 100);
    if (ratio > 80) {
      tips.push(`Your expenses are ${ratio}% of your income — review discretionary spending and set a monthly cap.`);
    } else if (ratio > 60) {
      tips.push(`You're spending ${ratio}% of your income; consider small monthly cuts like reducing dining out or subscriptions.`);
    } else {
      tips.push(`Good job — your spending is ${ratio}% of income. Consider increasing automated savings gradually.`);
    }
  }

  if (topCategories && topCategories.length) {
    const top = topCategories[0];
    tips.push(`Reduce spending in ${top.category} by 10% next month (LKR ${Math.round(top.amount * 0.1)}) to free up cash for savings.`);
  }

  if (largestExpense) {
    tips.push(`Review the largest expense (${largestExpense.title || largestExpense.category}) and see if any part of it can be avoided or reduced.`);
  }

  if (goals && goals.length) {
    tips.push(`Tie a small percentage of your income to your goals (e.g., 2-5%) to make steady progress.`);
  }

  return tips.slice(0, 5);
}

function cleanLine(s: string) {
  return s
    .replace(/^\s*[:\-\u2022\*\d\.\)\(\s]*/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^here are \d+.*?:/i, "")
    .replace(/^tips[:\-\s]*/i, "")
    .trim();
}

function parseAIText(aiText: string | null) {
  if (!aiText) return [];
  const text = aiText.trim();

  // Preprocess: strip code fences or single backtick language tags
  let cleaned = text.replace(/^```[a-zA-Z\s]*\n?/i, "").replace(/\n?```$/, "");
  cleaned = cleaned.replace(/^`[a-zA-Z\-]*\s*/i, "");

  // Try to locate a JSON array inside the text (handles cases like `json\n[ ... ]` split by lines)
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const possibleJson = cleaned.slice(firstBracket, lastBracket + 1);
    try {
      const parsed = JSON.parse(possibleJson);
      if (Array.isArray(parsed)) return parsed.map((p) => String(p).trim()).filter(Boolean).slice(0, 6);
    } catch (e) {
      // fallthrough to other heuristics
    }
  }

  // Try JSON parse on entire cleaned text as a last attempt
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed.map((p) => String(p).trim()).filter(Boolean).slice(0, 6);
  } catch (e) {
    // not JSON
  }

  // Remove leading header lines like "Here are 4 tips:"
  let body = text.replace(/^\s*here are .*?:\s*/i, "");

  // Extract list-like items (bullets or numbered)
  const itemRegex = /(?:^|\n)\s*(?:[-•*]|\d+[\).])\s*(.+?)(?=\n|$)/g;
  const items: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(body)) !== null) {
    items.push(cleanLine(m[1]));
  }
  if (items.length) return items.slice(0, 6);

  // Fall back to splitting on double newlines (paragraphs)
  const paras = body.split(/\n{2,}/).map((p) => cleanLine(p)).filter(Boolean);
  if (paras.length > 1) return paras.slice(0, 6);

  // Fall back to single-line split
  const lines = body.split(/\n/).map((l) => cleanLine(l)).filter(Boolean);
  if (lines.length > 1) return lines.slice(0, 6);

  // Last resort: split by sentences
  const sentences = body.split(/(?<=[\.\?\!])\s+/).map((s) => cleanLine(s)).filter(Boolean);
  return sentences.slice(0, 6);
}

export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const [expenses, incomes, goals] = await Promise.all([
      Expense.find({ userId: payload._id, accountType: payload.accountType }).lean(),
      Income.find({ userId: payload._id, accountType: payload.accountType }).lean(),
      Goal.find({ userId: payload._id, accountType: payload.accountType }).lean(),
    ]);

    // summarize last 30 days
    const now = Date.now();
    const thirty = now - 30 * 24 * 60 * 60 * 1000;
    const recentExpenses = (expenses || []).filter((e: any) => new Date(e.date).getTime() >= thirty);
    const recentIncomes = (incomes || []).filter((i: any) => new Date(i.date).getTime() >= thirty);

    const totalExpense = recentExpenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
    const totalIncome = recentIncomes.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);

    const map: Record<string, number> = {};
    for (const e of recentExpenses) {
      const k = e.category || "Uncategorized";
      map[k] = (map[k] || 0) + Number(e.amount || 0);
    }
    const topCategories = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([category, amount]) => ({ category, amount }));

    const largestExpense = recentExpenses.slice().sort((a: any, b: any) => Number(b.amount || 0) - Number(a.amount || 0))[0] || null;

    const summary = { totalIncome, totalExpense, topCategories, largestExpense, goals };

    const prompt = `You are a friendly financial coach. Given a user's last 30 days summary, provide up to 4 short, actionable monthly saving tips tailored to the data.
  Requirements:
  - Use very simple, plain English suitable for readers who are not fluent in English.
  - Keep each tip short (one sentence, 8–20 words), avoid idioms and complex words.
  - Include approximate LKR amounts when suggesting specific reductions.
  - Return ONLY a JSON array of strings, e.g. ["Tip 1","Tip 2"]. Do not add any extra text or headings.

  Summary:\n- totalIncome: ${totalIncome}\n- totalExpense: ${totalExpense}\n- topCategories: ${topCategories.map((t) => `${t.category}:${t.amount}`).join(", ")}\n- largestExpense: ${largestExpense ? `${largestExpense.title || largestExpense.category}:${largestExpense.amount}` : "none"}\n- goals: ${goals.map((g: any) => `${g.title}:${g.targetAmount}`).join(", ")}
  `;

    const aiText = await generateTextFromGoogle(prompt);
    let tips: string[] = [];
    if (aiText) {
      tips = parseAIText(aiText);
    }

    if (!tips.length) {
      tips = heuristicTips(summary as any);
    }

    return NextResponse.json({ tips });
  } catch (err) {
    console.error("Generate tips error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
