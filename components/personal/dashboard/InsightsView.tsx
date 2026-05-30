"use client";

import React from "react";
import { Lightbulb, RefreshCw, Copy } from "lucide-react";

export default function InsightsView() {
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [expenses, setExpenses] = React.useState<any[]>([]);
	const [incomes, setIncomes] = React.useState<any[]>([]);
	const [goals, setGoals] = React.useState<any[]>([]);

	React.useEffect(() => {
		let mounted = true;
		const fetchAll = async () => {
			try {
				const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
				const headers: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;

				const [expRes, incRes, goalsRes] = await Promise.all([
					fetch(`/api/personal/expense/expenses`, { headers }),
					fetch(`/api/personal/income/incomes`, { headers }),
					fetch(`/api/personal/goals`, { headers }),
				]);

				const expJson = await expRes.json().catch(() => ({}));
				const incJson = await incRes.json().catch(() => ({}));
				const goalsJson = await goalsRes.json().catch(() => ({}));

				if (!mounted) return;

				setExpenses(expJson.expenses || []);
				setIncomes(incJson.incomes || []);
				setGoals(goalsJson.goals || []);
			} catch (err: any) {
				console.error("Insights fetch error:", err);
				if (mounted) setError("Failed to load insights");
			} finally {
				if (mounted) setLoading(false);
			}
		};

		fetchAll();
		return () => {
			mounted = false;
		};
	}, []);

	const formatCurrency = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

	const totalExpense = React.useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses]);

	const topCategories = React.useMemo(() => {
		const map: Record<string, number> = {};
		for (const e of expenses) {
			const k = e.category || "Uncategorized";
			map[k] = (map[k] || 0) + Number(e.amount || 0);
		}
		return Object.entries(map)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([category, amount]) => ({ category, amount }));
	}, [expenses]);

	const largestExpense = React.useMemo(() => {
		if (!expenses.length) return null;
		return expenses.slice().sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0];
	}, [expenses]);

	const anomalies = React.useMemo(() => {
		if (expenses.length < 5) return [];
		const amounts = expenses.map((e) => Number(e.amount || 0)).sort((a, b) => a - b);
		const p90 = amounts[Math.floor(amounts.length * 0.9)] || amounts[amounts.length - 1];
		return expenses.filter((e) => Number(e.amount || 0) >= p90).slice(0, 5);
	}, [expenses]);

	const [tips, setTips] = React.useState<string[] | null>(null);

	React.useEffect(() => {
		let mounted = true;
		const fetchTips = async () => {
			try {
				const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
				const headers: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
				const res = await fetch(`/api/personal/insights/tips`, { headers });
				if (!mounted) return;
				const json = await res.json().catch(() => ({}));
				setTips(json.tips || null);
			} catch (err) {
				console.error("Tips fetch error:", err);
			}
		};

		fetchTips();
		return () => {
			mounted = false;
		};
	}, [expenses, incomes, goals]);

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Financial Insights & Analysis</h1>
				<p className="text-gray-600 mt-1">Key highlights about your finances — concise and actionable.</p>
			</div>

			{loading ? (
				<div className="py-8">Loading insights…</div>
			) : error ? (
				<div className="py-8 text-rose-600">{error}</div>
			) : (
				<div className="space-y-6">

					{/* Main content */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-semibold text-gray-900">Top Spending Categories</h3>
								<p className="text-sm text-gray-500">Where most of your money goes</p>
							</div>
							{topCategories.length ? (
								<ul className="space-y-4">
									{topCategories.map((c) => {
										const pct = Math.round((c.amount / (totalExpense || 1)) * 100);
										return (
											<li key={c.category} className="space-y-2">
												<div className="flex items-center justify-between">
													<div>
														<p className="font-medium text-gray-800">{c.category}</p>
														<p className="text-sm text-gray-500">{pct}% of expenses</p>
													</div>
													<div className="text-gray-700">LKR {formatCurrency(c.amount)}</div>
												</div>
												<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
												<div className="h-2 bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
												</div>
											</li>
										);
									})}
								</ul>
							) : (
								<p className="text-sm text-gray-500">No expenses recorded yet.</p>
							)}
						</div>

						<div className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-semibold text-gray-900">Quick Highlights</h3>
								<p className="text-sm text-gray-500">At a glance</p>
							</div>
							<div className="space-y-4">
								<div>
									<p className="text-sm text-gray-500">Largest Expense</p>
									{largestExpense ? (
										<div className="flex items-center justify-between">
											<div>
												<p className="font-medium">{largestExpense.title || largestExpense.category}</p>
												<p className="text-sm text-gray-500">{new Date(largestExpense.date).toLocaleDateString()}</p>
											</div>
											<div className="text-lg font-semibold text-rose-600">LKR {formatCurrency(Number(largestExpense.amount || 0))}</div>
										</div>
									) : (
										<p className="text-sm text-gray-500">No expenses yet</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Full-width Saving Tips (below insights) */}
					<div className="mt-6 bg-gradient-to-r from-amber-50 via-white to-sky-50 rounded-2xl p-6 border border-gray-100 shadow-lg">
						<div className="flex items-center gap-4 mb-4">
							<div className="p-3 bg-white rounded-lg shadow-sm">
								<Lightbulb className="text-amber-500" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">Monthly Saving Tips</h3>
								<p className="text-sm text-gray-500">Personalized suggestions based on your recent activity</p>
							</div>
							<div className="ml-auto flex items-center gap-2">
								<button
									className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 border border-gray-200 rounded-md text-sm text-gray-700 hover:shadow"
									onClick={async () => {
										setTips([]);
										try {
											const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
											const headers: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
											const res = await fetch(`/api/personal/insights/tips`, { headers });
											const json = await res.json().catch(() => ({}));
											setTips(json.tips || []);
										} catch (err) {
											console.error("Regenerate tips failed", err);
										}
									}}
								>
									<RefreshCw className="w-4 h-4" />
									<span>Regenerate</span>
								</button>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{tips === null ? (
								<div className="p-6 bg-white rounded-lg border border-gray-100 flex items-center gap-4 justify-center">
									<Lightbulb className="w-6 h-6 text-amber-500" />
									<div>
										<div className="font-medium text-gray-800">No tips available</div>
										<div className="text-sm text-gray-500">Try regenerating tips or check your recent transactions.</div>
									</div>
								</div>
							) : tips.length ? (
								tips.map((t, i) => (
									<div key={i} className="p-4 bg-white rounded-lg border border-gray-100 flex items-start gap-3">
										<div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold">{i + 1}</div>
										<div className="flex-1 text-sm text-gray-700">{t}</div>
										<button
											className="ml-2 p-1 rounded-md text-gray-500 hover:bg-gray-100"
											onClick={() => {
												navigator.clipboard?.writeText(t).catch(() => {});
											}}
											aria-label="Copy tip"
										>
											<Copy className="w-4 h-4" />
										</button>
									</div>
								))
							) : (
								<div className="p-6 bg-white rounded-lg border border-gray-100 flex items-center gap-3 justify-center">
									<RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
									<div className="font-medium text-gray-800">Generating tips…</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
