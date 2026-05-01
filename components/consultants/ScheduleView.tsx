"use client";

import React, { useState } from "react";
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

export default function ScheduleView() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    {
      day: "Monday",
      dayShort: "M",
      slots: [
        { start: "9:00 AM", end: "12:00 PM" },
        { start: "2:00 PM", end: "5:00 PM" },
      ],
      available: true,
    },
    {
      day: "Tuesday",
      dayShort: "T",
      slots: [
        { start: "9:00 AM", end: "12:00 PM" },
        { start: "2:00 PM", end: "5:00 PM" },
      ],
      available: true,
    },
    {
      day: "Wednesday",
      dayShort: "W",
      slots: [
        { start: "10:00 AM", end: "1:00 PM" },
        { start: "3:00 PM", end: "6:00 PM" },
      ],
      available: true,
    },
    {
      day: "Thursday",
      dayShort: "T",
      slots: [
        { start: "9:00 AM", end: "12:00 PM" },
        { start: "2:00 PM", end: "5:00 PM" },
      ],
      available: true,
    },
    {
      day: "Friday",
      dayShort: "F",
      slots: [
        { start: "9:00 AM", end: "12:00 PM" },
        { start: "2:00 PM", end: "5:00 PM" },
      ],
      available: true,
    },
    {
      day: "Saturday",
      dayShort: "S",
      slots: [
        { start: "10:00 AM", end: "1:00 PM" },
      ],
      available: false,
    },
    {
      day: "Sunday",
      dayShort: "S",
      slots: [],
      available: false,
    },
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
          <p className="text-sm text-gray-500 mt-1">Click on days to edit your availability</p>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {schedule.map((daySchedule, index) => (
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
                  <h3 className="font-bold text-gray-900 text-lg">{daySchedule.day}</h3>
                  <p className="text-sm text-gray-600">
                    {daySchedule.slots.length} time slot{daySchedule.slots.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {daySchedule.available && (
                  <span className="px-4 py-1.5 bg-teal-500 text-white text-sm font-semibold rounded-full">
                    Available
                  </span>
                )}
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2">
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
            </div>

            {/* Time Slots */}
            {daySchedule.slots.length > 0 && (
              <div className="flex items-center gap-4 pl-16">
                {daySchedule.slots.map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200"
                  >
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {slot.start} - {slot.end}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
