"use client";

import React from "react";
import Image from "next/image";

type Props = {
	title?: string;
};

export default function Navbar({ title = "CashSpace" }: Props) {
	return (
        <header className="w-full bg-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-0">
            <nav className="flex h-16 items-center justify-between">
            <div className="flex items-center">
                <Image
                src="/logo.png"
                alt={title}
                width={264}
                height={64}
                priority
                className="object-contain"
                />
            </div>
            <div>
                <button
                type="button"
                className="inline-flex items-center px-4 py-2 rounded-md border border-[#009689] shadow-sm bg-white text-[#009689] hover:bg-[#009689] hover:text-white cursor-pointer transition"
                >
                Sign in
                </button>
            </div>
            </nav>
        </div>
        </header>

	);
}

