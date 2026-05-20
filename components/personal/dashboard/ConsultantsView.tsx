"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Calendar, Phone, Globe, Link as LinkIcon, Tag } from "lucide-react";

interface Consultant {
	id: string;
	name: string;
	specialty: string;
	experience: string;
	certifications: string[];
	specializations: string[];
	bio: string;
	phone?: string;
	website?: string;
	linkedin?: string;
	hourlyRate?: number | null;
	sessionDuration?: number | null;
	color: string;
}

export default function ConsultantsView() {
	const [showBrowse, setShowBrowse] = useState(true);
	const [consultants, setConsultants] = useState<Consultant[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

	useEffect(() => {
		const fetchConsultants = async () => {
			setLoading(true);
			try {
				const res = await fetch('/api/consultants');
				const data = await res.json();
				if (!res.ok) throw new Error(data?.error || 'Failed to load');

				const visible = (data.consultants || []).filter((c: any) => !!c.acceptBookings);

				const mapped: Consultant[] = visible.map((c: any) => ({
					id: c.id,
					name: c.fullName,
					specialty: c.specializations && c.specializations.length ? c.specializations[0] : (c.specialization || ""),
					experience: c.yearsOfExperience === '10+' ? '10+ years' : (c.yearsOfExperience ? `${c.yearsOfExperience} years` : ""),
					certifications: c.certifications ? (Array.isArray(c.certifications) ? c.certifications : String(c.certifications).split(',').map((s: string) => s.trim()).filter(Boolean)) : [],
					specializations: c.specializations || [],
					bio: c.bio || "",
					phone: c.phone || "",
					website: c.website || "",
					linkedin: c.linkedin || "",
					hourlyRate: c.hourlyRate ?? null,
					sessionDuration: c.sessionDuration ?? null,
					color: 'from-purple-400 to-purple-600',
				}));

				setConsultants(mapped);
			} catch (err: any) {
				console.error(err);
				setError(err.message || 'Error fetching consultants');
			} finally {
				setLoading(false);
			}
		};

		void fetchConsultants();
	}, []);

	return (
		<div>
			{/* Page Header */}
			<div className="mb-8">
				<div className="flex items-start justify-between gap-8">
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-gray-900">Financial Consultants</h1>
						<p className="text-gray-600 mt-2">
							Connect with certified financial consultants to get expert advice on managing your finances, investments, and savings strategies.
						</p>
					</div>
					<div className="flex gap-3 flex-shrink-0">
						<button
							onClick={() => setShowBrowse(false)}
							className={`px-6 py-2 rounded-lg font-semibold transition whitespace-nowrap ${!showBrowse
									? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
									: "border border-gray-300 text-gray-700 hover:bg-gray-50"
								}`}
						>
							My Appointments (0)
						</button>
					</div>
				</div>
			</div>

			{/* Content */}
			{showBrowse ? (
				// Browse Consultants
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{consultants.map((consultant) => (
						<div key={consultant.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
							<div className="flex gap-6">
								<div className={`w-16 h-16 bg-gradient-to-br ${consultant.color} rounded-full flex items-center justify-center shadow-md flex-shrink-0`}>
									<User size={32} className="text-white" />
								</div>

								<div className="flex-1">
									<div className="flex items-start justify-between">
										<div>
																					<h3 className="font-bold text-gray-900 text-lg">
																						<Link href={`/consultants/${consultant.id}`} className="hover:underline">
																							{consultant.name}
																						</Link>
																					</h3>
											<div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
												<span className="flex items-center gap-1"><Calendar size={14} />Experience: {consultant.experience}</span>
												{consultant.hourlyRate ? <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">LKR {consultant.hourlyRate} /hour</span> : null}
												{consultant.sessionDuration ? <span className="text-gray-400 text-sm">Sessions: {consultant.sessionDuration} min</span> : null}
											</div>
										</div>
									</div>

									{consultant.bio ? (
										<div className="mt-4">
											<p className={`text-gray-700 ${expandedIds.includes(consultant.id) ? "" : "line-clamp-3"}`}>{consultant.bio}</p>
											{consultant.bio.length > 220 ? (
												<button
													onClick={() => {
														setExpandedIds((prev) => prev.includes(consultant.id) ? prev.filter(i => i !== consultant.id) : [...prev, consultant.id]);
													}}
													className="mt-2 text-sm text-gray-400 font-medium"
												>
													{expandedIds.includes(consultant.id) ? "View less" : "View more"}
												</button>
											) : null}
										</div>
									) : null}

									{consultant.specializations && consultant.specializations.length ? (
										<div className="flex flex-wrap gap-2 mt-4">
											{consultant.specializations.map((s, i) => (
												<span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
													<Tag size={12} /> {s}
												</span>
											))}
										</div>
									) : null}

									<div className="mt-4 flex items-center justify-between">
										<div className="flex items-center gap-3 text-sm text-gray-600">
											{consultant.phone ? (
												<a href={`tel:${consultant.phone}`} className="flex items-center gap-2 hover:text-gray-800">
													<Phone size={14} /> <span>{consultant.phone}</span>
												</a>
											) : null}

											{consultant.website ? (
												<a href={consultant.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gray-800">
													<Globe size={14} /> <span className="underline">Website</span>
												</a>
											) : null}

											{consultant.linkedin ? (
												<a href={consultant.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gray-800">
													<LinkIcon size={14} /> <span className="underline">LinkedIn</span>
												</a>
											) : null}
										</div>

																				<Link
																					href={`/consultants/${consultant.id}`}
																					className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold shadow hover:scale-105 transition inline-flex items-center justify-center"
																				>
																					Book Appointment
																				</Link>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				// My Appointments
				<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
					<div className="flex flex-col items-center justify-center py-12">
						<div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
							<Calendar size={40} className="text-purple-600" />
						</div>
						<p className="text-gray-500 font-medium text-lg">No appointments yet</p>
						<p className="text-gray-400 mt-2 text-center max-w-md">
							Book your first consultation with a financial consultant to get expert advice on your financial goals
						</p>
						<button
							onClick={() => setShowBrowse(true)}
							className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition"
						>
							Browse Consultants
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
