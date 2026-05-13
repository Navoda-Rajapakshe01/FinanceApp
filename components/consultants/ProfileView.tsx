"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Phone, Briefcase } from "lucide-react";
import Toast from "@/components/Toast";

interface ProfileViewProps {
  consultantName: string;
  consultantEmail: string;
}

export default function ProfileView({ consultantName, consultantEmail }: ProfileViewProps) {
  const [bio, setBio] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">("");
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [sessionDuration, setSessionDuration] = useState("60");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
 

  // Controls whether the public profile form is visible to edit / show
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const toggleFirstRun = useRef(true);
  const [savingToggle, setSavingToggle] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" as "success" | "error" });

  useEffect(() => {
    const loadProfile = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/consultants/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          setShowProfile((prev) => !prev);
          setToast({ isOpen: true, message: "Session expired — please log in", type: "error" });
          setSavingToggle(false);
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");

        const c = data.consultant;
        if (c) {
          setBio(c.bio || "");
          setSpecializations(Array.isArray(c.specializations) ? (c.specializations || []).join(", ") : (c.specializations || ""));
          setYearsOfExperience(c.yearsOfExperience || "");
          setHourlyRate(c.hourlyRate ?? "");
          setSessionDuration(c.sessionDuration ? String(c.sessionDuration) : "60");
          setPhone(c.phone || "");
          setWebsite(c.website || "");
          setLinkedin(c.linkedin || "");
          setShowProfile(!!c.acceptBookings);
        }
        } catch (err) {
        console.error(err);
        setToast({ isOpen: true, message: (err as any)?.message || "Failed to load profile", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  // Auto-save acceptBookings when toggle changes
  useEffect(() => {
    if (toggleFirstRun.current) {
      toggleFirstRun.current = false;
      return;
    }

    const saveToggle = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setToast({ isOpen: true, message: "Please log in to change profile visibility", type: "error" });
        // revert the toggle since save won't persist
        setShowProfile((prev) => !prev);
        return;
      }
      setSavingToggle(true);
      try {
        const res = await fetch("/api/consultants/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ acceptBookings: showProfile }),
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          // Auto-logout on session expiry
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update visibility");
      } catch (err) {
        console.error(err);
        setToast({ isOpen: true, message: (err as any)?.message || "Failed to update profile visibility", type: "error" });
      } finally {
        setSavingToggle(false);
      }
    };

    void saveToggle();
  }, [showProfile]);

  function handleSave() {
    const payload = {
      bio,
      specializations,
      yearsOfExperience: yearsOfExperience === "" ? null : Number(yearsOfExperience),
      hourlyRate: hourlyRate === "" ? null : Number(hourlyRate),
      sessionDuration,
      phone,
      website,
      linkedin,
      acceptBookings: showProfile,
    };

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/consultants/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          // Auto-logout on session expiry
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to save profile");
        }
        setToast({ isOpen: true, message: "Profile updated successfully", type: "success" });
      })
      .catch((err) => {
        console.error(err);
        setToast({ isOpen: true, message: (err as any)?.message || "An error occurred while saving profile", type: "error" });
      });
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Consultant Profile</h3>
          <p className="text-sm text-gray-600 mt-1">Manage the information shown on your public consultant card.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-800">Show profile to users</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={showProfile} onChange={() => setShowProfile(!showProfile)} className="hidden" />
              <span className={`relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in ${showProfile ? "bg-purple-600" : "bg-gray-300"} rounded-full h-6`}>
                <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition ${showProfile ? "translate-x-6" : "translate-x-0"}`} />
              </span>
            </label>
          </div>

          {/* single toggle only - Accept bookings is tied to Show profile */}
        </div>
      </div>

      {loading ? (
        <div className="py-6">Loading profile…</div>
      ) : showProfile ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio Section (display-only fields for consultant cards) */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase size={18} className="text-purple-600" />
              Profile for Client Cards
            </h4>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
              rows={4}
              placeholder="Short bio that will appear on consultant cards (what you want clients to see)..."
            />
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                  <Phone size={16} className="text-gray-500" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 outline-none text-gray-900"
                  />
                </div>
              </div>
 

              <div>
                <label className="block text-sm text-gray-600 mb-1">Website</label>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                  <User size={16} className="text-gray-500" />
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="flex-1 outline-none text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">LinkedIn</label>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                  <User size={16} className="text-gray-500" />
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/in/yourname"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="flex-1 outline-none text-gray-900"
                  />
                </div>
              </div>

 
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Professional Details</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Specializations</label>
                <input
                  type="text"
                  placeholder="e.g., Retirement Planning, Investment"
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Years of Experience</label>
                <input
                  type="number"
                  placeholder="0"
                  value={yearsOfExperience as any}
                  onChange={(e) => setYearsOfExperience(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Consultation Rates */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 mb-3">Consultation Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Hourly Rate (LKR)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={hourlyRate as any}
                  onChange={(e) => setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Session Duration (minutes)</label>
                <select value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white">
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
            </div>
          </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button onClick={handleSave} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition">
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-600">Profile card is hidden. Enable <strong>Show profile to users</strong> to edit and show your public profile.</p>
        </div>
      )}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
}

