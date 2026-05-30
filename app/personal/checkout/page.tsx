"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";

export default function Page() {
  const search = useSearchParams();
  const router = useRouter();

  const consultantId = search.get("consultantId") || "";
  const consultantName = search.get("consultantName") || "";
  const service = search.get("service") || "";
  const date = search.get("date") || "";
  const time = search.get("time") || "";
  const amount = search.get("amount") || "0";
  const sessionMinutes = search.get("sessionMinutes") || "30";

  const amountNumber = Number(amount) || 0;
  const minutesNumber = Number(sessionMinutes) || 30;
  const proratedAmount = Math.round((amountNumber * (minutesNumber / 60)) * 100) / 100;

  function addMinutesToTime(start: string, minutes: number) {
    const parts = (start || "").split(":").map((p) => Number(p));
    if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return start;
    const [hh, mm] = parts;
    const dt = new Date();
    dt.setHours(hh, mm, 0, 0);
    dt.setMinutes(dt.getMinutes() + minutes);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }

  const endTime = time ? addMinutesToTime(time, minutesNumber) : "";
  // prefer explicit endTime query param (slot end) if present
  const explicitEnd = search.get("endTime");
  const displayEndTime = explicitEnd || endTime;
  const clientName = search.get("name") || "";
  const clientEmail = search.get("email") || "";

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  function handlePay() {
    (async () => {
      try {
        const res = await fetch("/api/personal/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            consultantId,
            consultantName,
            service,
            date,
            time,
            amount,
            sessionMinutes,
            endTime: displayEndTime,
            clientName,
            clientEmail,
          }),
        });

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (data.url) {
          window.location.assign(data.url);
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (err: any) {
        showToast(err?.message || "Payment failed", "error");
      }
    })();
  }

  return (
    <>
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto shadow-lg rounded-md overflow-hidden">
          <div className="grid grid-cols-12">
            <div className="col-span-7 p-12 bg-white">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment</h1>
              <a className="text-sm text-blue-600 inline-flex items-center mb-8" href="#">December invoice Finangel Services (PDF)</a>

              <div className="mt-6">
                <div className="bg-white border border-gray-100 rounded-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment summary</h3>
                  <div className="text-sm text-gray-700 space-y-3">
                    <div className="flex justify-between">
                      <div className="text-gray-600">Consultant</div>
                      <div className="font-semibold text-gray-900">{consultantName || "—"}</div>
                    </div>

                    <div className="flex justify-between">
                      <div className="text-gray-600">Service</div>
                      <div className="font-semibold">{service || "—"}</div>
                    </div>

                    <div className="flex justify-between">
                      <div className="text-gray-600">Date</div>
                      <div className="font-semibold text-gray-900">{date || "—"}</div>
                    </div>

                    <div className="flex justify-between">
                      <div className="text-gray-600">Time</div>
                      <div className="font-semibold text-gray-900">{time}{time && displayEndTime ? ` — ${displayEndTime}` : ""}</div>
                    </div>

                    <div className="flex justify-between">
                      <div className="text-gray-600">Duration</div>
                      <div className="font-semibold">{minutesNumber} minutes</div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <div className="text-gray-600">Amount</div>
                        <div className="font-semibold text-gray-900">{proratedAmount} LKR</div>
                      </div>

                      <div className="flex justify-between mt-2">
                        <div className="text-gray-600">Tax</div>
                        <div className="font-semibold">—</div>
                      </div>

                      <div className="flex justify-between mt-4">
                        <div className="text-gray-600">Total</div>
                        <div className="text-xl font-bold text-blue-600">{proratedAmount} LKR</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-5 p-10 bg-gray-50 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Secure payment</h2>
                <p className="text-sm text-gray-600 mb-6">You'll be redirected to Stripe's secure checkout page to enter card details and complete payment.</p>

                <div className="bg-white border border-gray-100 rounded-md p-4 text-sm text-gray-700">
                  <div className="font-semibold">Amount to pay</div>
                  <div className="text-lg text-blue-600 font-bold mt-1">{proratedAmount} LKR</div>
                </div>
              </div>

              <div className="mt-6">
                <button onClick={() => router.back()} className="w-full mb-3 px-4 py-3 rounded-md border-2 border-orange-600 text-orange-600 bg-orange-50 hover:bg-orange-100 font-semibold">Cancel</button>
                <button onClick={handlePay} className="w-full px-4 py-3 rounded-md bg-blue-600 text-white text-lg font-semibold">Pay now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
