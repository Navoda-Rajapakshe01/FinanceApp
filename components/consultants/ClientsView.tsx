"use client";

import React from "react";
import { Users, Mail, Calendar } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  focus: string;
  service: string;
  sessionsLeft: number;
  lastSession: string;
  nextSession?: string;
  status: "Active" | "Inactive";
}

interface ClientsViewProps {
  clients: Client[];
}

export default function ClientsView({ clients }: ClientsViewProps) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Client Management</h3>
      <div className="space-y-4">
        {clients.length > 0 ? (
          clients.map((client) => (
            <div
              key={client.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{client.name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-600">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {client.service}
                      </span>
                      <span className="text-sm text-gray-600">{client.focus}</span>
                    </div>
                    <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
                      <span>Sessions: {client.sessionsLeft}</span>
                      <span>Last: {client.lastSession}</span>
                      {client.nextSession && (
                        <span className="text-orange-600 font-semibold">Next: {client.nextSession}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {client.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No clients yet</p>
            <p className="text-sm text-gray-400 mt-2">Your clients will appear here when they book consultations</p>
          </div>
        )}
      </div>
    </div>
  );
}
