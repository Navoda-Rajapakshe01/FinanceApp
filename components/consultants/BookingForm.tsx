"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

interface Props {
  consultant: {
    id: string;
    fullName?: string;
    specializations?: string[];
    sessionDuration?: number | null;
    hourlyRate?: number | null;
  };
  schedule?: {
    days?: {
      day: string;
      dayShort: string;
      slots: { start: string; end: string }[];
      available: boolean;
    }[];
    defaultSlots?: { start: string; end: string }[];
    dateSlots?: { date: string; slots: { start: string; end: string; booked?: boolean }[]; available: boolean }[];
  };
}

export default function BookingForm({ consultant, schedule }: Props) {
  const services = consultant.specializations && consultant.specializations.length ? consultant.specializations : ["Consultation"];
  const [mode] = useState<"online">("online");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedService, setSelectedService] = useState<string>(services[0]);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const router = useRouter();

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const sessionMinutes = consultant.sessionDuration || 60;

  // local date helpers: prevent selecting/booking past dates
  const formatLocalDate = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const minDate = formatLocalDate(new Date());
  const selectedDateObj = new Date(`${date}T00:00:00`);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isPastDate = selectedDateObj < todayStart;

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

  const selectedEndTime = selectedEnd || null;

  const timeslots = useMemo(() => {
    // prefer dateSlots > weekday days > defaultSlots
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const localDate = new Date(`${date}T00:00:00`);
    const dayName = weekdayNames[localDate.getDay()];

    // 1) dateSlots (each slot has start and end)
    if (schedule?.dateSlots && schedule.dateSlots.length > 0) {
      const foundDate = schedule.dateSlots.find((d) => d.date === date);
      if (foundDate && foundDate.slots && foundDate.slots.length > 0) return foundDate.slots.map((s) => ({ start: s.start || "", end: s.end || "", booked: !!(s as any).booked }));
      return [] as { start: string; end: string }[];
    }

    // 2) weekday template
    if (schedule?.days && schedule.days.length > 0) {
      const found = schedule.days.find((d) => d.day === dayName);
      if (found && found.slots && found.slots.length > 0) return found.slots.map((s) => ({ start: s.start || "", end: s.end || "" }));
    }

    // 3) default slots
    if (schedule?.defaultSlots && schedule.defaultSlots.length > 0) return schedule.defaultSlots.map((s) => ({ start: s.start || "", end: s.end || "" }));

    return [] as { start: string; end: string }[];
  }, [date, schedule]);

  function handleBook() {
    if (isPastDate) {
      showToast("Cannot book past dates.", "error");
      return;
    }

    if (!selectedStart) {
      showToast("Please select a time slot", "error");
      return;
    }

    const params = new URLSearchParams({
      consultantId: consultant.id,
      mode,
      name: name || "",
      phone: phone || "",
      email: email || "",
      service: selectedService,
      date,
      time: selectedStart || "",
      endTime: selectedEnd || "",
      amount: String(consultant.hourlyRate || 0),
      sessionMinutes: String(sessionMinutes),
      consultantName: consultant.fullName || "",
    });

    // navigate to checkout with booking details (personal checkout path)
    router.push(`/personal/checkout?${params.toString()}`);
  }

  return (
    <>
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: client details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Amal Perera" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50" />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="077 123 4567" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50" />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amal.perera@example.com" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50" />
            </div>
          </div>

          <h4 className="text-md font-semibold text-gray-900 mt-6 mb-2">Service</h4>
          <div className="flex flex-col gap-2">
            {services.map((s) => (
              <button key={s} type="button" onClick={() => setSelectedService(s)} className={`text-left px-4 py-2 rounded-md border ${selectedService === s ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-gray-50 border-gray-100 text-gray-700"}`}>
                {s}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">The meeting link will be sent to your email</p>

          <button onClick={handleBook} disabled={!selectedStart || isPastDate} className={`mt-6 px-4 py-2 rounded-md shadow ${!selectedStart || isPastDate ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-orange-600 text-white"}`}>
            Book appointment
          </button>
        </div>

        {/* Right: Date & Time */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Date & Time</h3>
          <label className="text-sm text-gray-600 block mb-2">Select Date</label>
          <div className="border border-gray-100 rounded-md p-4 mb-4 bg-white">
            <input type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50" />
          </div>

          <label className="text-sm text-gray-600 block mb-2">Select Time</label>
          {timeslots.length === 0 ? (
            <div className="text-sm text-gray-500">No available slots for selected date.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
                      {timeslots.map((t) => {
                        const label = `${t.start} — ${t.end}`;
                        const disabled = !!(t as any).booked;
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => { if (!disabled) { setSelectedStart(t.start); setSelectedEnd(t.end); } }}
                            disabled={disabled}
                            className={`px-4 py-2 rounded-md border text-sm ${selectedStart === t.start ? "bg-orange-50 border-orange-300 text-orange-700" : disabled ? "bg-red-50 border-red-100 text-red-700 opacity-80 cursor-not-allowed" : "bg-gray-50 border-gray-100 text-gray-700"}`}>
                            {label}
                          </button>
                        );
                      })}
            </div>
          )}
          {selectedStart && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100 text-sm text-gray-700">
              <div className="flex justify-between">
                <div className="text-gray-600">Start</div>
                <div className="font-semibold text-gray-900">{selectedStart}</div>
              </div>
              <div className="flex justify-between mt-2">
                <div className="text-gray-600">End</div>
                <div className="font-semibold text-gray-900">{selectedEndTime}</div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <div>Duration</div>
                <div>{sessionMinutes} minutes</div>
              </div>
            </div>
          )}
          {isPastDate && <div className="mt-3 text-sm text-red-600">Cannot book past dates.</div>}
        </div>
      </div>
      </div>
    </>
  );
}
