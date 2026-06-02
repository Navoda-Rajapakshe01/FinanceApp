"use client";

import React, { useMemo } from "react";
import { Calendar } from "lucide-react";

interface Consultation {
  clientName: string;
  date: string; // expects "YYYY-MM-DD HH:MM" or similar
  focus: string;
}

interface UpcomingConsultationsProps {
  consultations: Consultation[];
}

function parseLocalDateTime(dateTimeStr: string): Date | null {
  if (!dateTimeStr) return null;
  // try formats like "YYYY-MM-DD HH:MM" or "YYYY-MM-DDTHH:MM" or "YYYY-MM-DD"
  const parts = dateTimeStr.trim().split(" ");
  const datePart = parts[0];
  const timePart = parts[1] || "00:00";
  const dParts = datePart.split("-").map((p) => Number(p));
  const tParts = timePart.split(":").map((p) => Number(p));
  if (dParts.length < 3 || dParts.some((n) => Number.isNaN(n))) return null;
  const year = dParts[0];
  const month = (dParts[1] || 1) - 1;
  const day = dParts[2] || 1;
  const hour = tParts[0] || 0;
  const minute = tParts[1] || 0;
  return new Date(year, month, day, hour, minute, 0, 0);
}

export default function UpcomingConsultations({ consultations }: UpcomingConsultationsProps) {
  const { upcoming, completed } = useMemo(() => {
    const now = new Date();
    const up: Consultation[] = [];
    const done: Consultation[] = [];

    (consultations || []).forEach((c) => {
      const dt = parseLocalDateTime(c.date);
      if (dt && dt < now) {
        done.push(c);
      } else {
        up.push(c);
      }
    });

    // sort upcoming ascending, completed descending
    up.sort((a, b) => {
      const da = parseLocalDateTime(a.date)?.getTime() || Infinity;
      const db = parseLocalDateTime(b.date)?.getTime() || Infinity;
      return da - db;
    });

    done.sort((a, b) => {
      const da = parseLocalDateTime(a.date)?.getTime() || 0;
      const db = parseLocalDateTime(b.date)?.getTime() || 0;
      return db - da;
    });

    return { upcoming: up, completed: done };
  }, [consultations]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Consultations</h3>
        {upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.map((consultation, index) => (
              <div
                key={`up-${index}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition"
              >
                <p className="font-semibold text-gray-900 mb-1">{consultation.clientName}</p>
                <p className="text-sm text-gray-600 mb-2">{consultation.focus}</p>
                <div className="flex items-center gap-2 text-orange-600">
                  <Calendar size={14} />
                  <span className="text-xs font-semibold">{consultation.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No upcoming consultations</p>
            <p className="text-sm text-gray-400 mt-2">Your scheduled appointments will appear here</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Consultations</h3>
        {completed.length > 0 ? (
          <div className="space-y-3">
            {completed.map((c, i) => (
              <div key={`done-${i}`} className="flex items-start justify-between border border-gray-100 rounded p-3 bg-gray-50">
                <div>
                  <div className="font-medium text-gray-800">{c.clientName}</div>
                  <div className="text-xs text-gray-600">{c.focus} • {c.date}</div>
                </div>
                <div className="text-xs text-green-700 font-semibold">Completed</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No completed consultations yet</div>
        )}
      </div>
    </div>
  );
}
