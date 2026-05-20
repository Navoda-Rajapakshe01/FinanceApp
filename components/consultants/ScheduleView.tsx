"use client";

import React, { useState, useEffect } from "react";
import { Clock, Edit2, Calendar } from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  day: string;
  dayShort: string;
  slots: TimeSlot[];
  available: boolean;
}

interface DateSlotEntry {
  date: string;
  slots: TimeSlot[];
  available: boolean;
}


export default function ScheduleView() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [defaultSlots, setDefaultSlots] = useState<TimeSlot[]>([]);
  const [dateSlots, setDateSlots] = useState<DateSlotEntry[]>([]);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [viewDate, setViewDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newSlotStart, setNewSlotStart] = useState("");
  const [newSlotEnd, setNewSlotEnd] = useState("");
  const [newDefaultStart, setNewDefaultStart] = useState("");
  const [newDefaultEnd, setNewDefaultEnd] = useState("");
  const [dateForSlot, setDateForSlot] = useState("");
  const [newDateStart, setNewDateStart] = useState("");
  const [newDateEnd, setNewDateEnd] = useState("");

  useEffect(() => {
    void fetchSchedule();
  }, []);

  async function fetchSchedule() {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/consultants/schedule", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        console.error("Failed to load schedule");
        return;
      }
      const data = await res.json();
      const days = (data.schedule?.days || data.schedule || []) as DaySchedule[];
      setSchedule(days);
      setDefaultSlots(data.schedule?.defaultSlots || []);
      setDateSlots(data.schedule?.dateSlots || []);
      // fetch bookings for current week
      const week = getCurrentWeekRange();
      void fetchBookings(week.start, week.end);
    } catch (err) {
      console.error(err);
    }
  }

  function formatDate(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  function getCurrentWeekRange() {
    const today = new Date();
    const day = today.getDay();
    // calculate Monday (day 1). If Sunday (0), subtract 6 days
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: formatDate(monday), end: formatDate(sunday), monday };
  }

  async function fetchBookings(start: string, end: string) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const url = `/api/consultants/bookings?start=${start}&end=${end}`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) {
        console.error("Failed to load bookings");
        return;
      }
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function addSlot(day: string) {
    if (!newSlotStart || !newSlotEnd) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/consultants/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ day, start: newSlotStart, end: newSlotEnd }),
      });
      if (!res.ok) throw new Error("Failed to add slot");
      const data = await res.json();
      setSchedule(data.schedule.days || data.schedule);
      setNewSlotStart("");
      setNewSlotEnd("");
      setEditingDay(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function addDefaultSlot() {
    if (!newDefaultStart || !newDefaultEnd) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/consultants/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ defaultSlot: true, start: newDefaultStart, end: newDefaultEnd }),
      });
      if (!res.ok) throw new Error("Failed to add default slot");
      const data = await res.json();
      setDefaultSlots(data.schedule.defaultSlots || []);
      setNewDefaultStart("");
      setNewDefaultEnd("");
    } catch (err) {
      console.error(err);
    }
  }

  async function removeDefaultSlot(index: number) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/consultants/schedule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ defaultIndex: index }),
      });
      if (!res.ok) throw new Error("Failed to remove default slot");
      const data = await res.json();
      setDefaultSlots(data.schedule.defaultSlots || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function addDateSlot() {
    if (!dateForSlot || !newDateStart || !newDateEnd) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/consultants/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ date: dateForSlot, start: newDateStart, end: newDateEnd }),
      });
      if (!res.ok) throw new Error("Failed to add date slot");
      const data = await res.json();
      setDateSlots(data.schedule.dateSlots || []);
      setDateForSlot("");
      setNewDateStart("");
      setNewDateEnd("");
    } catch (err) {
      console.error(err);
    }
  }

  async function removeDateSlot(date: string, index: number) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/consultants/schedule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ date, index }),
      });
      if (!res.ok) throw new Error("Failed to remove date slot");
      const data = await res.json();
      setDateSlots(data.schedule.dateSlots || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function removeSlot(day: string, index: number) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/consultants/schedule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ day, index }),
      });
      if (!res.ok) throw new Error("Failed to delete slot");
      const data = await res.json();
      setSchedule(data.schedule.days || data.schedule);
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleAvailable(day: string) {
    const updated = schedule.map((d) => (d.day === day ? { ...d, available: !d.available } : d));
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/consultants/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ days: updated }),
      });
      if (!res.ok) throw new Error("Failed to update availability");
      const data = await res.json();
      setSchedule(data.schedule.days || data.schedule);
    } catch (err) {
      console.error(err);
    }
  }

  // render helper to keep JSX balanced and simple
  const renderDay = (daySchedule: DaySchedule, index: number) => {
    const week = getCurrentWeekRange();
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIndex = weekdayNames.indexOf(daySchedule.day);
    const dayDate = new Date(week.monday);
    const mondayIndex = 1;
    const offset = dayIndex === 0 ? 6 : dayIndex - mondayIndex;
    dayDate.setDate(week.monday.getDate() + offset);
    const dayDateStr = formatDate(dayDate);
    const isPast = new Date(dayDateStr) < new Date(new Date().toISOString().slice(0,10));

    // resolve slots for this specific date: dateSlots -> weekday slots -> defaultSlots
    const ds = dateSlots.find((d) => d.date === dayDateStr);
    const resolvedSlots: TimeSlot[] = ds && ds.slots && ds.slots.length > 0
      ? ds.slots
      : (daySchedule.slots && daySchedule.slots.length > 0)
        ? daySchedule.slots
        : defaultSlots;

    const source = ds && ds.slots && ds.slots.length > 0 ? 'date' : (daySchedule.slots && daySchedule.slots.length > 0 ? 'day' : 'default');

    return (
      <div
        key={index}
        className={`rounded-xl border-2 p-6 transition ${
          daySchedule.available
            ? "bg-teal-50 border-teal-200 hover:shadow-lg"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                daySchedule.available ? "bg-teal-500" : "bg-gray-400"
              }`}
            >
              {daySchedule.dayShort}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{daySchedule.day} <span className="text-sm text-gray-500">({dayDateStr})</span></h3>
              <p className="text-sm text-gray-600">
                {resolvedSlots.length} time slot{resolvedSlots.length !== 1 ? "s" : ""} • {isPast ? "Locked" : "Editable"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleAvailable(daySchedule.day)}
              disabled={isPast}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                daySchedule.available ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-700"
              } ${isPast ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {daySchedule.available ? "Available" : "Unavailable"}
            </button>
            <button
              onClick={() => setEditingDay(editingDay === daySchedule.day ? null : daySchedule.day)}
              disabled={isPast}
              className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2 ${isPast ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Edit2 size={16} />
              {editingDay === daySchedule.day ? "Close" : "Edit"}
            </button>
          </div>
        </div>

        {/* Time Slots */}
        {resolvedSlots.length > 0 && (
          <div className="flex items-center gap-4 pl-16 flex-wrap">
            {resolvedSlots.map((slot, slotIndex) => {
              const booked = bookings.some((b) => b.date === dayDateStr && b.start === slot.start);
              return (
                <div
                  key={slotIndex}
                  className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg border ${booked ? "border-red-200" : "border-gray-200"}`}
                >
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {slot.start} - {slot.end}
                  </span>
                  {booked ? (
                    <span className="ml-2 text-sm text-red-600">Booked</span>
                  ) : (
                    // allow removal only for weekday or date-specific slots here
                    editingDay === daySchedule.day && !isPast && (
                      (source === 'day' && <button onClick={() => removeSlot(daySchedule.day, slotIndex)} className="ml-2 text-sm text-red-600">Remove</button>) ||
                      (source === 'date' && <button onClick={() => removeDateSlot(dayDateStr, slotIndex)} className="ml-2 text-sm text-red-600">Remove</button>)
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}

        {editingDay === daySchedule.day && (
          <div className="pl-16 mt-4 flex items-center gap-2">
            <input
              value={newSlotStart}
              onChange={(e) => setNewSlotStart(e.target.value)}
              placeholder="Start (e.g., 9:00 AM)"
              className="px-3 py-2 border rounded-lg"
            />
            <input
              value={newSlotEnd}
              onChange={(e) => setNewSlotEnd(e.target.value)}
              placeholder="End (e.g., 12:00 PM)"
              className="px-3 py-2 border rounded-lg"
            />
            <button onClick={() => addSlot(daySchedule.day)} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              Add Slot
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
          <p className="text-sm text-gray-500 mt-1">Click on days to edit your availability</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">View date:</label>
          <input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="px-3 py-2 border rounded" />
        </div>
      </div>

      {/* Default daily slots */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Default Daily Slots</h3>
        <p className="text-sm text-gray-500">Slots added here apply to all dates unless a specific date overrides them.</p>
        <div className="mt-3 flex items-center gap-2">
          <input value={newDefaultStart} onChange={(e) => setNewDefaultStart(e.target.value)} placeholder="Start (e.g. 09:00)" className="px-3 py-2 border rounded" />
          <input value={newDefaultEnd} onChange={(e) => setNewDefaultEnd(e.target.value)} placeholder="End (e.g. 17:00)" className="px-3 py-2 border rounded" />
          <button onClick={addDefaultSlot} className="px-4 py-2 bg-purple-600 text-white rounded">Add Default Slot</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {defaultSlots.map((s, i) => (
            <div key={i} className="px-3 py-2 bg-white border rounded flex items-center gap-3">
              <span className="text-sm">{s.start} - {s.end}</span>
              <button onClick={() => removeDefaultSlot(i)} className="text-sm text-red-600">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Date-specific slots */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Date-specific Slots</h3>
        <p className="text-sm text-gray-500">Add slots for a specific calendar date (overrides defaults).</p>
        <div className="mt-3 flex items-center gap-2">
          <input type="date" value={dateForSlot} onChange={(e) => setDateForSlot(e.target.value)} className="px-3 py-2 border rounded" />
          <input value={newDateStart} onChange={(e) => setNewDateStart(e.target.value)} placeholder="Start (e.g. 09:00)" className="px-3 py-2 border rounded" />
          <input value={newDateEnd} onChange={(e) => setNewDateEnd(e.target.value)} placeholder="End (e.g. 17:00)" className="px-3 py-2 border rounded" />
          <button onClick={addDateSlot} className="px-4 py-2 bg-purple-600 text-white rounded">Add Date Slot</button>
        </div>

        <div className="mt-3 space-y-3">
          {dateSlots.map((d, idx) => (
            <div key={idx} className="bg-white border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{d.date}</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {d.slots.map((s, i) => (
                  <div key={i} className="px-3 py-2 bg-gray-50 border rounded flex items-center gap-3">
                    <span className="text-sm">{s.start} - {s.end}</span>
                    <button onClick={() => removeDateSlot(d.date, i)} className="text-sm text-red-600">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View specific date details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Details for {viewDate}</h3>
        <p className="text-sm text-gray-500">Shows slots (date-specific, weekday template, or defaults) and booked status.</p>
        <div className="mt-3">
          {(() => {
            // resolve slots for viewDate: dateSlots -> weekday -> defaults
            const ds = dateSlots.find((d) => d.date === viewDate);
            if (ds && ds.slots && ds.slots.length > 0) {
              return (
                <div className="flex flex-wrap gap-2">
                  {ds.slots.map((s, i) => {
                    const booked = bookings.some((b) => b.date === viewDate && b.start === s.start);
                    return (
                      <div key={i} className="px-3 py-2 bg-white border rounded flex items-center gap-3">
                        <span className="text-sm">{s.start} - {s.end}</span>
                        {booked ? <span className="text-sm text-red-600">Booked</span> : <span className="text-sm text-green-600">Available</span>}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // weekday
            const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayName = weekdayNames[new Date(viewDate).getDay()];
            const weekDayEntry = schedule.find((d) => d.day === dayName);
            if (weekDayEntry && weekDayEntry.slots && weekDayEntry.slots.length > 0) {
              return (
                <div className="flex flex-wrap gap-2">
                  {weekDayEntry.slots.map((s, i) => {
                    const booked = bookings.some((b) => b.date === viewDate && b.start === s.start);
                    return (
                      <div key={i} className="px-3 py-2 bg-white border rounded flex items-center gap-3">
                        <span className="text-sm">{s.start} - {s.end}</span>
                        {booked ? <span className="text-sm text-red-600">Booked</span> : <span className="text-sm text-green-600">Available</span>}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // defaults
            if (defaultSlots && defaultSlots.length > 0) {
              return (
                <div className="flex flex-wrap gap-2">
                  {defaultSlots.map((s, i) => {
                    const booked = bookings.some((b) => b.date === viewDate && b.start === s.start);
                    return (
                      <div key={i} className="px-3 py-2 bg-white border rounded flex items-center gap-3">
                        <span className="text-sm">{s.start} - {s.end}</span>
                        {booked ? <span className="text-sm text-red-600">Booked</span> : <span className="text-sm text-green-600">Available</span>}
                      </div>
                    );
                  })}
                </div>
              );
            }

            return <div className="text-sm text-gray-500">No slots available for this date.</div>;
          })()}
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {schedule.map((d, i) => renderDay(d, i))}
      </div>
    </div>
  );
}
