"use client";

import React, { useState, useEffect } from "react";
import { User, Calendar } from "lucide-react";

interface Consultant {
	id: string;
	name: string;
	specialty: string;
	experience: string;
	certifications: string[];
	color: string;
}

export default function ConsultantsView() {
	const [showBrowse, setShowBrowse] = useState(true);
	const [consultants, setConsultants] = useState<Consultant[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchConsultants = async () => {
			setLoading(true);
			try {
				const res = await fetch('/api/consultants');
				const data = await res.json();
				if (!res.ok) throw new Error(data?.error || 'Failed to load');

				const mapped: Consultant[] = (data.consultants || []).map((c: any) => ({
					id: c.id,
					name: c.fullName,
					specialty: c.specialization,
					experience: c.yearsOfExperience === '10+' ? '10+ years' : `${c.yearsOfExperience} years`,
					certifications: c.certifications ? c.certifications.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
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
						<div
							key={consultant.id}
							className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition"
						>
							{/* Consultant Info */}
							<div className="flex items-center gap-4 mb-6">
								<div className={`w-14 h-14 bg-gradient-to-br ${consultant.color} rounded-full flex items-center justify-center shadow-md`}>
									<User size={28} className="text-white" />
								</div>
								<div>
									<h3 className="font-bold text-gray-900 text-lg">{consultant.name}</h3>
									<p className="text-purple-600 font-medium text-sm">{consultant.specialty}</p>
									<div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
										<span className="flex items-center gap-1">
											<Calendar size={14} />
											{consultant.experience}
										</span>
									</div>
								</div>
							</div>

							{/* Certifications */}
							<div className="flex flex-wrap gap-2 mb-6">
								{consultant.certifications.map((cert, idx) => (
									<span
										key={idx}
										className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
									>
										{cert}
									</span>
								))}
							</div>

							{/* Book Button */}
							<button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
								Book Appointment
							</button>
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
