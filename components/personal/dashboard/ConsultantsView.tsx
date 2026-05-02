"use client";

import React, { useState } from "react";
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

	// Sample consultants data
	const consultants: Consultant[] = [
		{
			id: "1",
			name: "Nimal Perera",
			specialty: "Financial Planning",
			experience: "10+ years",
			certifications: ["CFP", "CFA"],
			color: "from-purple-400 to-purple-600",
		},
		{
			id: "2",
			name: "Dilshan Fernando",
			specialty: "Investment Advisory",
			experience: "6-10 years",
			certifications: ["CFA", "MBA"],
			color: "from-purple-400 to-purple-600",
		},
		{
			id: "3",
			name: "Amara Jayasinghe",
			specialty: "Retirement Planning",
			experience: "10+ years",
			certifications: ["CFP", "CHFC"],
			color: "from-purple-400 to-purple-600",
		},
		{
			id: "4",
			name: "Kasun Wickramasinghe",
			specialty: "Tax Planning",
			experience: "6-10 years",
			certifications: ["CPA", "CFP"],
			color: "from-purple-400 to-purple-600",
		},
		{
			id: "5",
			name: "Sanduni De Silva",
			specialty: "Wealth Management",
			experience: "10+ years",
			certifications: ["CFP", "CFA", "CIMA"],
			color: "from-purple-400 to-purple-600",
		},
		{
			id: "6",
			name: "Thilina Rajapaksa",
			specialty: "Business Finance",
			experience: "6-10 years",
			certifications: ["MBA", "CFP"],
			color: "from-purple-400 to-purple-600",
		},
		{
			id: "7",
			name: "Chamari Gunasekara",
			specialty: "Estate Planning",
			experience: "10+ years",
			certifications: ["CFP", "JD"],
			color: "from-purple-400 to-purple-600",
		},
		{
			id: "8",
			name: "Rohan Bandara",
			specialty: "Insurance Planning",
			experience: "3-6 years",
			certifications: ["CFP", "CLU"],
			color: "from-purple-400 to-purple-600",
		},
	];

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
							onClick={() => setShowBrowse(true)}
							className={`px-6 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
								showBrowse
									? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
									: "border border-gray-300 text-gray-700 hover:bg-gray-50"
							}`}
						>
							Browse Consultants
						</button>
						<button
							onClick={() => setShowBrowse(false)}
							className={`px-6 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
								!showBrowse
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
