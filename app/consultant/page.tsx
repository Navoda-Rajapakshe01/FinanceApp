"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Toast from "@/components/Toast";
import {
  Users,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Mail,
  MessageSquare,
  Camera,
} from "lucide-react";
import ClientsView from "@/components/consultants/ClientsView";
import ProfileView from "@/components/consultants/ProfileView";
import UpcomingConsultations from "@/components/consultants/UpcomingConsultations";
import ScheduleManager from "@/components/consultants/ScheduleManager";

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

export default function ConsultantDashboard() {
  const [consultantName, setConsultantName] = useState("Consultant");
  const [consultantEmail, setConsultantEmail] = useState("");
  const [consultantId, setConsultantId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("clients");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser) as { fullName?: string; email?: string };
      if (parsedUser.fullName) {
        setConsultantName(parsedUser.fullName);
      }
      if (parsedUser.email) {
        setConsultantEmail(parsedUser.email);
      }
      // try to read an id from stored user object
      const maybeId = (parsedUser as any).id || (parsedUser as any)._id || (parsedUser as any).consultantId || (parsedUser as any).userId;
      if (maybeId) setConsultantId(String(maybeId));
    } catch (error) {
      console.error("Failed to parse stored user:", error);
    }
  }, []);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [clients, setClients] = useState<Client[]>([]);

  // load real bookings for consultant if token is available
  const [upcomingConsultations, setUpcomingConsultations] = useState<{ clientName: string; date: string; focus: string }[]>([]);

  React.useEffect(() => {
    // fetch bookings for next 30 days using an auth token; if token isn't available yet,
    // listen for it being set in localStorage and retry.
    const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const fetchBookingsForToken = (token: string | null) => {
      if (!token) return;
      const today = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 30);
      const q = new URLSearchParams({ start: toISO(today), end: toISO(end) });

      fetch(`/api/consultants/bookings?${q.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          const bookings = data?.bookings || [];
          const upcoming = bookings.map((b: any) => ({ clientName: b.clientName || "Client", date: `${b.date} ${b.start}`, focus: "Consultation" }));
          setUpcomingConsultations(upcoming);

          // produce a simple clients list grouped by email
          const clientsMap: Record<string, Client> = {};
          bookings.forEach((b: any) => {
            const key = b.clientEmail || b.clientName || Math.random().toString();
            if (!clientsMap[key]) {
              clientsMap[key] = {
                id: key,
                name: b.clientName || "Client",
                email: b.clientEmail || "",
                focus: "Consultation",
                service: "Consultation",
                sessionsLeft: 0,
                lastSession: b.date,
                nextSession: b.date,
                status: "Active",
              };
            }
          });
          const clientsArr = Object.values(clientsMap);
          if (clientsArr.length) setClients(clientsArr);
        })
        .catch((e) => console.error("Failed to load bookings", e));
    };

    const currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetchBookingsForToken(currentToken);

    const onTokenStorage = (e: StorageEvent) => {
      if (e.key === "token" && e.newValue) {
        fetchBookingsForToken(e.newValue);
      }
    };

    window.addEventListener("storage", onTokenStorage);
    return () => window.removeEventListener("storage", onTokenStorage);
  }, []);

  // SSE: listen for consultant notifications
  React.useEffect(() => {
    if (!consultantId) return;
    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/consultants/${consultantId}/notifications`);
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data || "{}");
          if (payload?.type === "booking.created") {
            const b = payload.booking || {};
            const name = b.clientName || b.clientEmail || "Client";
            const date = b.date ? `${b.date} ${b.start || ""}` : "";
            setToastMessage(`New booking from ${name}${date ? ` — ${date}` : ""}`);
            setToastOpen(true);
            try { localStorage.setItem("bookingsCount", String(Number(localStorage.getItem("bookingsCount")||"0") + 1)); } catch {}
            try { localStorage.setItem("bookingsUpdated", String(Date.now())); } catch {}
          }
        } catch (e) {
          console.error("Failed to handle SSE message", e);
        }
      };
      es.onerror = (e) => {
        console.warn("SSE error", e);
        // auto-reconnect is handled by EventSource in browsers
      };
    } catch (e) {
      console.error("Failed to open SSE connection", e);
    }

    return () => {
      try { es?.close(); } catch {}
      es = null;
    };
  }, [consultantId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Consultant Profile Card */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">{consultantName}</h2>
              <p className="text-purple-100 mb-1">Financial Consultant</p>
              <div className="flex items-center gap-2 text-purple-100">
                <Mail size={16} />
                <span className="text-sm">{consultantEmail}</span>
              </div>
            </div>
            <div className="relative group">
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="profile-upload"
                className="cursor-pointer block relative"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-purple-700 font-bold text-3xl overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={consultantName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{consultantName.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:bg-purple-600 transition">
                  <Camera size={14} className="text-white" />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Clients */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Clients</p>
            <h3 className="text-3xl font-bold text-gray-900">{clients.length}</h3>
          </div>

          {/* Total Consultations */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Consultations</p>
            <h3 className="text-3xl font-bold text-gray-900">0</h3>
          </div>

          {/* Upcoming */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Upcoming</p>
            <h3 className="text-3xl font-bold text-gray-900">{upcomingConsultations.length}</h3>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-teal-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <h3 className="text-3xl font-bold text-gray-900">0</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition ${activeTab === "clients"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <Users size={18} />
            My Clients
          </button>
          
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition ${activeTab === "schedule"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <Calendar size={18} />
            Schedule
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition ${activeTab === "profile"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <User size={18} />
            Profile
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={activeTab === "schedule" ? "lg:col-span-3" : "lg:col-span-2"}>
            {activeTab === "clients" && <ClientsView clients={clients} />}
            {activeTab === "schedule" && <ScheduleManager consultantId={consultantId} />}
            {activeTab === "profile" && <ProfileView consultantName={consultantName} consultantEmail={consultantEmail} />}
          </div>

          {/* Sidebar - Upcoming Consultations (hidden on Schedule tab) */}
          {activeTab !== "schedule" && (
            <div className="lg:col-span-1">
              <UpcomingConsultations consultations={upcomingConsultations} />
            </div>
          )}
        </div>
      </main>
      <Toast isOpen={toastOpen} message={toastMessage} onClose={() => setToastOpen(false)} />
    </div>
  );
}
