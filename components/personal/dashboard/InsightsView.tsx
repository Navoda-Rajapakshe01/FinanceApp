"use client";

import React from "react";
import { Lightbulb, RefreshCw, Copy, DollarSign, ArrowDown, ArrowUp, PieChart, Zap } from "lucide-react";

export default function InsightsView() {
	const formatMonthLabel = (prefix: string | null) => {
		if (!prefix) return null;
		const [y, m] = prefix.split("-");
		const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
		const mi = Number(m) - 1;
		return `${monthNames[mi] || m} ${y}`;
	};
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

	const totalIncome = React.useMemo(() => incomes.reduce((s, i) => s + Number(i.amount || 0), 0), [incomes]);

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
	const [analysis, setAnalysis] = React.useState<string | null>(null);
	const [analysisLoading, setAnalysisLoading] = React.useState(false);
	const [analysisMonth, setAnalysisMonth] = React.useState<string | null>(null);
	const [monthTotalsState, setMonthTotalsState] = React.useState<any[] | null>(null);
	const [analysisTotalsState, setAnalysisTotalsState] = React.useState<any | null>(null);
	const [analysisTopCategories, setAnalysisTopCategories] = React.useState<any[] | null>(null);
	const [analysisLargestExpense, setAnalysisLargestExpense] = React.useState<any | null>(null);

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

	React.useEffect(() => {
		let mounted = true;
		const fetchAnalysis = async () => {
			setAnalysisLoading(true);
			try {
				const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
				const headers: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
				const res = await fetch(`/api/personal/insights/analysis`, { headers });
				const json = await res.json().catch(() => ({}));
				if (!mounted) return;
				setAnalysis(json.analysis || null);
				setAnalysisMonth(json.month || null);
				setMonthTotalsState(json.monthTotals || null);
				setAnalysisTotalsState(json.totals || null);
				setAnalysisTopCategories(json.topCategories || null);
				setAnalysisLargestExpense(json.largestExpense || null);
			} catch (err) {
				console.error("Failed to fetch analysis", err);
			} finally {
				if (mounted) setAnalysisLoading(false);
			}
		};

		// fetch analysis when core data is loaded
		if (!loading) {
			void fetchAnalysis();
		}

		return () => {
			mounted = false;
		};
	}, [loading, expenses, incomes]);

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


					{/* AI Analysis report (styled) */}
					<div className="mt-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Metric cards */}
							<div className="lg:col-span-2 grid grid-cols-3 gap-4">
								<div className="bg-white p-4 rounded-xl border border-gray-100 shadow flex items-center gap-4">
									<div className="p-3 bg-emerald-50 rounded-lg">
										<DollarSign className="text-emerald-600" />
									</div>
									<div>
										<div className="text-sm text-gray-500">Total Income (last month)</div>
										<div className="text-lg font-semibold text-gray-900">LKR {formatCurrency(analysisTotalsState?.totalIncomes ?? totalIncome)}</div>
									</div>
								</div>

								<div className="bg-white p-4 rounded-xl border border-gray-100 shadow flex items-center gap-4">
									<div className="p-3 bg-rose-50 rounded-lg">
										<ArrowDown className="text-rose-600" />
									</div>
									<div>
										<div className="text-sm text-gray-500">Total Expenses (last month)</div>
										<div className="text-lg font-semibold text-rose-600">LKR {formatCurrency(analysisTotalsState?.totalExpenses ?? totalExpense)}</div>
									</div>
								</div>

								<div className="bg-white p-4 rounded-xl border border-gray-100 shadow flex items-center gap-4">
									<div className="p-3 bg-sky-50 rounded-lg">
										<ArrowUp className="text-sky-600" />
									</div>
									<div>
										<div className="text-sm text-gray-500">Net (last month)</div>
										<div className={`text-lg font-semibold ${(analysisTotalsState ? (analysisTotalsState.totalIncomes - analysisTotalsState.totalExpenses >= 0) : (totalIncome - totalExpense >= 0)) ? "text-emerald-600" : "text-rose-600"}`}>LKR {formatCurrency((analysisTotalsState ? (analysisTotalsState.totalIncomes - analysisTotalsState.totalExpenses) : (totalIncome - totalExpense)))}</div>
									</div>
								</div>
							</div>

							{/* Analysis card */}
							<div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow">
										<div className="flex items-start gap-4">
									<div className="p-3 bg-amber-100 rounded-md">
										<Zap className="text-amber-600" />
									</div>
									<div className="flex-1">
												<div className="flex items-center justify-between">
													<div>
														<h3 className="font-semibold text-gray-900">AI Financial Analysis</h3>
														{analysisMonth ? <div className="text-xs text-gray-500">Analysis for {formatMonthLabel(analysisMonth)}</div> : <p className="text-sm text-gray-500">Personalized insights and a short action plan</p>}
													</div>
													<p className="text-sm text-gray-500">Personalized insights and a short action plan</p>
												</div>
										<div className="mt-4">
											{analysisLoading ? (
												<div className="text-sm text-gray-600">Generating analysis…</div>
											) : analysis ? (
												<div className="prose prose-sm text-gray-700 max-w-none">
													{(() => {
														// Render the AI analysis without raw markdown asterisks or bullet markers.
														const lines = analysis.split("\n").map((l) => l.trim()).filter(Boolean);

														// Helper to remove inline markdown emphasis markers
														const cleanInline = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/^[\*\-\u2022]\s+/, "");

														// If analysis contains numbered items (1., 2., etc.), render as ordered list
														const numbered = lines.filter((l) => /^\d+\.\s+/.test(l));
														if (numbered.length >= 1) {
															return (
																<ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
																	{numbered.map((l, i) => (
																		<li key={i} className="leading-snug">{cleanInline(l.replace(/^\d+\.\s+/, ""))}</li>
																	))}
																</ol>
															);
														}

														// Fallback: render paragraphs with bullets/asterisks removed
														return lines.map((l, i) => (
															<p key={i} className="text-sm text-gray-700">{cleanInline(l)}</p>
														));
													})()}
												</div>
											) : (
												<div className="text-sm text-gray-500">No analysis available. Add transactions or regenerate.</div>
											)}
										</div>
										<div className="mt-4 flex items-center gap-3 justify-end">
											<button
												className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 border border-gray-200 rounded-md text-sm text-gray-700 hover:shadow"
												onClick={async () => {
													setAnalysis(null);
													setAnalysisLoading(true);
													try {
														const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
														const headers: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
														const res = await fetch(`/api/personal/insights/analysis`, { headers });
														const json = await res.json().catch(() => ({}));
														setAnalysis(json.analysis || null);
														setAnalysisMonth(json.month || null);
														setMonthTotalsState(json.monthTotals || null);
														setAnalysisTotalsState(json.totals || null);
														setAnalysisTopCategories(json.topCategories || null);
														setAnalysisLargestExpense(json.largestExpense || null);
													} catch (err) {
														console.error(err);
													} finally {
														setAnalysisLoading(false);
													}
												}}
											>
												<RefreshCw className="w-4 h-4" />
												<span>Regenerate</span>
											</button>
										</div>
									</div>
								</div>
							</div>

							{/* Right column: top categories & largest expense */}
							<div className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
								<h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><PieChart /> Top Categories</h4>
								{(analysisTopCategories && analysisTopCategories.length) ? (
									<ul className="space-y-3">
										{(analysisTopCategories || topCategories).map((c: any) => {
											const baseTotal = (analysisTotalsState?.totalExpenses ?? totalExpense) || 1;
											const pct = Math.round((c.amount / baseTotal) * 100);
											return (
												<li key={c.category} className="space-y-1">
													<div className="flex items-center justify-between">
														<div className="text-sm font-medium text-gray-800">{c.category}</div>
														<div className="text-sm text-gray-700">LKR {formatCurrency(c.amount)}</div>
													</div>
													<div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
														<div className="h-2 bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
														</div>
													</li>
												);
											})}
									</ul>
								) : (
									<div className="text-sm text-gray-500">No categories yet.</div>
								)}

								<div className="mt-4 border-t pt-4">
									<h5 className="text-sm text-gray-600">Largest Expense</h5>
									{(analysisLargestExpense || largestExpense) ? (
										<div className="mt-2">
											<div className="text-sm font-medium">{(analysisLargestExpense || largestExpense).title || (analysisLargestExpense || largestExpense).category}</div>
											<div className="text-xs text-gray-500">{new Date((analysisLargestExpense || largestExpense).date).toLocaleDateString()}</div>
											<div className="mt-1 text-lg font-semibold text-rose-600">LKR {formatCurrency(Number((analysisLargestExpense || largestExpense).amount || 0))}</div>
										</div>
									) : (
										<div className="text-sm text-gray-500">No expenses yet</div>
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
