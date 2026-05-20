"use client";

import React, { useEffect, useMemo, useState } from "react";

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
    dateSlots?: { date: string; slots: { start: string; end: string }[]; available: boolean }[];
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
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const sessionMinutes = consultant.sessionDuration || 60;

  const timeslots = useMemo(() => {
    // prefer dateSlots > weekday days > defaultSlots
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = weekdayNames[new Date(date).getDay()];

    // 1) dateSlots
    if (schedule?.dateSlots && schedule.dateSlots.length > 0) {
      const foundDate = schedule.dateSlots.find((d) => d.date === date);
      if (foundDate && foundDate.slots && foundDate.slots.length > 0) return foundDate.slots.map((s) => s.start || "");
    }

    // 2) weekday template
    if (schedule?.days && schedule.days.length > 0) {
      const found = schedule.days.find((d) => d.day === dayName);
      if (found && found.slots && found.slots.length > 0) return found.slots.map((s) => s.start || "");
    }

    // 3) default slots
    if (schedule?.defaultSlots && schedule.defaultSlots.length > 0) return schedule.defaultSlots.map((s) => s.start || "");

    return [] as string[];
  }, [date, schedule]);

  function handleBook() {
    const payload = {
      consultantId: consultant.id,
      mode,
      name,
      phone,
      email,
      service: selectedService,
      date,
      time: selectedTime,
    };
    // For now just log — backend booking endpoint can be added later
    console.log("Booking:", payload);
    alert("Booked (demo): " + JSON.stringify(payload, null, 2));
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: client details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Placeholder" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50" />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Placeholder" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50" />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Placeholder" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50" />
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

          <button onClick={handleBook} disabled={!selectedTime} className={`mt-6 px-4 py-2 rounded-md shadow ${selectedTime ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
            Book appointment
          </button>
        </div>

        {/* Right: Date & Time */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Date & Time</h3>
          <label className="text-sm text-gray-600 block mb-2">Select Date</label>
          <div className="border border-gray-100 rounded-md p-4 mb-4 bg-white">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50" />
          </div>

          <label className="text-sm text-gray-600 block mb-2">Select Time</label>
          {timeslots.length === 0 ? (
            <div className="text-sm text-gray-500">No available slots for selected date.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {timeslots.map((t) => (
                <button key={t} type="button" onClick={() => setSelectedTime(t)} className={`px-4 py-2 rounded-md border text-sm ${selectedTime === t ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-gray-50 border-gray-100 text-gray-700"}`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
