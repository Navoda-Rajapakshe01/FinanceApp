"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Record<string, string> = {};

		if (!formData.email) newErrors.email = "Email is required";
		if (!formData.password) newErrors.password = "Password is required";

		if (Object.keys(newErrors).length === 0) {
			setErrors({});
		} else {
			setErrors(newErrors);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center px-4 py-8">
			<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
				<Link
					href="/"
					className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 font-medium text-sm"
				>
					← Back to Home
				</Link>

				<div className="flex justify-center mb-6">
					<div className="bg-teal-500 p-4 rounded-2xl">
						<LogIn size={32} className="text-white" />
					</div>
				</div>

				<h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
					Welcome Back
				</h1>
				<p className="text-gray-600 text-center mb-8 text-sm">
					Login to access your account
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							autoComplete="off"
							className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
								errors.email ? "border-red-500" : "border-gray-300"
							}`}
							placeholder="your@email.com"
						/>
						{errors.email && (
							<p className="text-red-500 text-xs mt-1">{errors.email}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<input
							type={showPassword ? "text" : "password"}
							name="password"
							value={formData.password}
							onChange={handleChange}
							autoComplete="off"
							className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
								errors.password ? "border-red-500" : "border-gray-300"
							}`}
							placeholder="••••••••"
						/>
						{errors.password && (
							<p className="text-red-500 text-xs mt-1">{errors.password}</p>
						)}
					</div>

					<button
						type="submit"
						className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition text-sm mt-6"
					>
						Login
					</button>
				</form>

				<p className="text-center text-sm text-gray-600 mt-6">
					Don't have an account?{" "}
					<Link href="/register" className="text-teal-600 hover:text-teal-700 font-semibold">
						Register
					</Link>
				</p>
			</div>
		</div>
	);
}
