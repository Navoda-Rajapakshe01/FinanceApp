"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutSuccess() {
  const router = useRouter();
  const search = useSearchParams();
  const sessionId = search.get("session_id");

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const iv = setInterval(() => setCountdown((c) => c - 1), 1000);
    const t = setTimeout(() => router.push("/dashboard"), 5000);
    // notify other tabs that bookings may have been updated; increment local counter
    try {
      const prev = Number(localStorage.getItem("bookingsCount") || "0");
      localStorage.setItem("bookingsCount", String(prev + 1));
      localStorage.setItem("bookingsUpdated", String(Date.now()));
    } catch (e) {}

    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
            <p className="mt-2 text-gray-600">Thank you — your payment has been processed and your appointment is confirmed.</p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                <div className="text-xs text-gray-500">Reference</div>
                <div className="font-medium text-gray-900 break-all">{sessionId || "—"}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                <div className="text-xs text-gray-500">Next</div>
                <div className="font-medium text-gray-900">Redirecting to dashboard in {countdown}s</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => router.push("/dashboard")} className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold">Go to dashboard</button>
              <button onClick={() => router.push("/personal") } className="px-4 py-2 rounded-md border border-gray-200 text-gray-700">View bookings</button>
              <button onClick={() => router.push("/")} className="ml-auto text-sm text-gray-500">Back to home</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
