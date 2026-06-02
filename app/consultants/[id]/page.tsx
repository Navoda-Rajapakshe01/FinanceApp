import React from "react";
import Header from "@/components/Header";
import { connectDB } from "@/lib/db";
import { Consultant, Schedule, Booking } from "@/models";
import Link from "next/link";
import BookingForm from "@/components/consultants/BookingForm";
import Reviews from "@/components/consultants/Reviews";
import { Phone, Globe, Tag } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function ConsultantPage({ params }: Props) {
  try {
    await connectDB();
    const { id } = await params;
    const consult = await Consultant.findById(id, { password: 0 }).lean();

    if (!consult) {
      return (
        <>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-4xl mx-auto p-8">
              <h2 className="text-2xl font-bold">Consultant not found</h2>
              <p className="text-gray-600 mt-2">The consultant you are looking for does not exist.</p>
              <Link href="/consultants" className="mt-4 inline-block text-purple-600 hover:underline">Back to consultants</Link>
            </main>
          </div>
        </>
      );
    }

    // load schedule for booking form
    const sched = await Schedule.findOne({ consultant: consult._id }).lean();

    // annotate date slots with `booked` flag by checking existing bookings
    let dateSlots: any[] = [];
    if (Array.isArray(sched?.dates) && sched.dates.length > 0) {
      const dateList = sched.dates.map((d: any) => d.date);
      const bookings = await Booking.find({ consultant: consult._id, date: { $in: dateList } }).lean();

      dateSlots = sched.dates.map((d: any) => ({
        date: d.date,
        slots: (d.slots || []).map((s: any) => ({
          start: s.start,
          end: s.end,
          booked: bookings.some((b: any) => b.date === d.date && b.start === s.start && b.end === s.end),
        })),
        available: true,
      }));

      // include any booked-only dates not present in schedule
      const scheduleDates = new Set(dateList);
      const extraBookings = await Booking.find({ consultant: consult._id, date: { $nin: dateList } }).lean();
      extraBookings.forEach((b: any) => {
        const idx = dateSlots.findIndex((ds) => ds.date === b.date);
        if (idx >= 0) return;
        dateSlots.push({ date: b.date, slots: [{ start: b.start, end: b.end, booked: true }], available: true });
      });
      dateSlots = dateSlots.sort((a: any, b: any) => a.date.localeCompare(b.date));
    }

    const scheduleProp = {
      days: Array.isArray(sched?.days)
        ? sched.days.map((d: any) => ({ day: d.day, dayShort: (d.day || "").slice(0, 3), slots: d.slots || [], available: !!d.available }))
        : [],
      defaultSlots: [],
      dateSlots,
    };

    const c: any = {
      id: consult._id.toString(),
      fullName: consult.fullName,
      bio: consult.bio || "",
      specializations: consult.specializations || [],
      yearsOfExperience: consult.yearsOfExperience || "",
      phone: consult.phone || "",
      website: consult.website || "",
      linkedin: consult.linkedin || "",
      hourlyRate: consult.hourlyRate ?? null,
      sessionDuration: consult.sessionDuration ?? null,
      location: consult.location || "",
    };

    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-5xl mx-auto p-8">
            <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {c.fullName?.charAt(0) || "C"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{c.fullName}</h1>
                <p className="text-sm text-gray-600 mt-1">{c.yearsOfExperience ? `${c.yearsOfExperience} experience` : "Financial consultant"}</p>

                <div className="flex items-center gap-3 mt-4 text-sm text-gray-600">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:text-gray-800">
                      <Phone size={14} /> <span>{c.phone}</span>
                    </a>
                  )}
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gray-800">
                      <Globe size={14} /> <span className="underline">Website</span>
                    </a>
                  )}
                  {c.linkedin && (
                    <a href={c.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gray-800">
                      <Tag size={14} /> <span className="underline">LinkedIn</span>
                    </a>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{c.bio || "No bio provided."}</p>
                </div>

                {c.specializations && c.specializations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {c.specializations.map((s: string, i: number) => (
                        <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                          <Tag size={12} /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-center gap-4">
                  <Link href="/consultants" className="text-sm text-gray-600 hover:underline">Back to list</Link>
                </div>
              </div>
            </div>
            </div>

            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
                <Reviews consultantId={c.id} />
              </div>
            </div>

            {/* Booking form after reviews */}
            <BookingForm consultant={c} schedule={scheduleProp} />
          </main>
        </div>
      </>
    );
    } catch (err) {
    console.error(err);
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-4xl mx-auto p-8">
            <h2 className="text-2xl font-bold">Error</h2>
            <p className="text-gray-600 mt-2">Unable to load consultant details.</p>
          </main>
        </div>
      </>
    );
  }
}
