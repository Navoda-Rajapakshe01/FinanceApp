"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, LogOut } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-2">
        <nav className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="CashSpace"
                width={264}
                height={64}
                priority
                className="object-contain cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition">
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
