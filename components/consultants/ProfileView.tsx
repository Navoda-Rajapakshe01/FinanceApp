"use client";

import React from "react";
import { User, Mail, Phone, MapPin, Briefcase, Calendar } from "lucide-react";

interface ProfileViewProps {
  consultantName: string;
  consultantEmail: string;
}

export default function ProfileView({ consultantName, consultantEmail }: ProfileViewProps) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Consultant Profile</h3>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">
            {consultantName.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{consultantName}</h2>
            <p className="text-purple-600 font-semibold mb-4">Financial Consultant</p>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Mail size={16} />
              <span>{consultantEmail}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio Section */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase size={18} className="text-purple-600" />
              Professional Bio
            </h4>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
              rows={4}
              placeholder="Tell clients about your expertise, experience, and approach to financial consulting..."
            ></textarea>
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
                    className="flex-1 outline-none text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Location</label>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                  <MapPin size={16} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="City, Country"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Years of Experience</label>
                <input
                  type="number"
                  placeholder="0"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Session Duration (minutes)</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white">
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
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
