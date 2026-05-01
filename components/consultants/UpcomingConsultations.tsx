"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface Consultation {
  clientName: string;
  date: string;
  focus: string;
}

interface UpcomingConsultationsProps {
  consultations: Consultation[];
}

export default function UpcomingConsultations({ consultations }: UpcomingConsultationsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Consultations</h3>
      {consultations.length > 0 ? (
        <div className="space-y-4">
          {consultations.map((consultation, index) => (
            <div
              key={index}
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
  );
}
