import { connectDB } from "@/lib/db";
import { Schedule, Booking } from "@/models";
import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const defaultWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((d) => ({ day: d, available: false, slots: [] }));

// GET
export async function GET(request: NextRequest) {
  try {
    // allow public read when consultantId query param is provided (booking view)
    const url = new URL(request.url);
    const publicConsultantId = url.searchParams.get("consultantId");

    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    const payload = verifyToken(token);

    await connectDB();

    let sched: any = null;

    if (publicConsultantId) {
      // public read-only schedule for the given consultant
      sched = await Schedule.findOne({ consultant: publicConsultantId }).lean();
    } else {
      // private consultant view requires auth
      if (!payload || payload.accountType !== "consultant") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      sched = await Schedule.findOne({ consultant: payload._id }).lean();
    }
    const month = url.searchParams.get("month");

    // MONTH VIEW
    if (month) {
      const dates = Array.isArray(sched?.dates)
        ? sched.dates.filter((d: any) => d.date?.startsWith(month))
        : [];

      // exclude slots that already have bookings
      try {
        await connectDB();
        const start = `${month}-01`;
        const [y, m] = month.split("-");
        const lastDay = new Date(Number(y), Number(m), 0).getDate();
        const end = `${month}-${String(lastDay).padStart(2, "0")}`;

        const bookings = await Booking.find({ consultant: sched?.consultant || null, date: { $gte: start, $lte: end } }).lean();

        // annotate slots with `booked` flag instead of removing them
        const datesOut = dates.map((d: any) => {
          const booked = bookings.filter((b: any) => b.date === d.date);
          const slots = (d.slots || []).map((s: any) => ({
            start: s.start,
            end: s.end,
            booked: booked.some((b: any) => b.start === s.start && b.end === s.end),
          }));
          return { date: d.date, slots };
        });

        // Also include any booked-only dates that aren't present in the schedule
        const scheduleDates = new Set(dates.map((d: any) => d.date));
        const extraDatesMap: Record<string, any[]> = {};
        bookings.forEach((b: any) => {
          if (!scheduleDates.has(b.date)) {
            extraDatesMap[b.date] = extraDatesMap[b.date] || [];
            // avoid duplicates
            if (!extraDatesMap[b.date].some((s: any) => s.start === b.start && s.end === b.end)) {
              extraDatesMap[b.date].push({ start: b.start, end: b.end, booked: true });
            }
          }
        });

        const extras = Object.entries(extraDatesMap).map(([date, slots]) => ({ date, slots }));

        const combined = [...datesOut, ...extras].sort((a: any, b: any) => a.date.localeCompare(b.date));

        return NextResponse.json({ dates: combined });
      } catch (e) {
        console.warn("Failed to filter booked slots", e);
        return NextResponse.json({
          dates: dates.map((d: any) => ({ date: d.date, slots: d.slots || [] })),
        });
      }
    }

    // FULL VIEW
    return NextResponse.json({
      schedule: sched
        ? { days: sched.days || [], dates: sched.dates || [] }
        : { days: defaultWeek, dates: [] },
    });
  } catch (err) {
    console.error("Schedule GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST (date slot add)
export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    const payload = verifyToken(token);

    if (!payload || payload.accountType !== "consultant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    if (body?.date && body?.slot) {
      const date = String(body.date);
      const slot = {
        start: String(body.slot.start),
        end: String(body.slot.end),
      };

      const doc = await Schedule.findOne({ consultant: payload._id });

      if (!doc) {
        const created = await Schedule.create({
          consultant: payload._id,
          dates: [{ date, slots: [slot] }],
        });

        return NextResponse.json({ dates: created.dates });
      }

      const dates = Array.isArray(doc.dates) ? doc.dates : [];
      const idx = dates.findIndex((d: any) => d.date === date);

      if (idx >= 0) {
        const existing = dates[idx].slots || [];
        if (!existing.some((s: any) => s.start === slot.start && s.end === slot.end)) {
          existing.push(slot);
        }
        dates[idx].slots = existing;
      } else {
        dates.push({ date, slots: [slot] });
      }

      await Schedule.updateOne(
        { consultant: payload._id },
        { $set: { dates } },
        { upsert: true }
      );

      return NextResponse.json({
        dates: dates.map((d: any) => ({
          date: d.date,
          slots: d.slots || [],
        })),
      });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err) {
    console.error("Schedule POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH
export async function PATCH(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    const payload = verifyToken(token);

    if (!payload || payload.accountType !== "consultant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { op } = body || {};

    if (!op) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();
    const doc = await Schedule.findOne({ consultant: payload._id });

    const days = doc?.days || [];
    const dates = doc?.dates || [];

     // APPLY COMMON (FIXED)
    if (op === "applyCommon") {
      const slots = Array.isArray(body.slots) ? body.slots : [];
      const month = body.month;

      if (!month || !slots.length) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      const startDate = new Date(month + "-01");
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      );

      const weekdayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const newMap: Record<string, any[]> = {};

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const iso = d.toISOString().slice(0, 10);
        const dayIndex = d.getDay();

        const matched = slots.filter((s: any) =>
          Array.isArray(s.days) ? s.days.includes(dayIndex) : false
        );

        if (!matched.length) continue;

        newMap[iso] = newMap[iso] || [];

        matched.forEach((m: any) => {
          const slot = { start: m.start, end: m.end };

          if (!newMap[iso].some((x) => x.start === slot.start && x.end === slot.end)) {
            newMap[iso].push(slot);
          }
        });
      }

      // merge
      const merged = [...dates];

      Object.entries(newMap).forEach(([date, slotsArr]) => {
        const idx = merged.findIndex((d: any) => d.date === date);

        if (idx >= 0) {
          const existing = merged[idx].slots || [];

          slotsArr.forEach((s: any) => {
            if (!existing.some((e: any) => e.start === s.start && e.end === s.end)) {
              existing.push(s);
            }
          });

          merged[idx].slots = existing;
        } else {
          merged.push({ date, slots: slotsArr });
        }
      });

      await Schedule.updateOne(
        { consultant: payload._id },
        { $set: { dates: merged } },
        { upsert: true }
      );

      return NextResponse.json({
        dates: merged.map((d: any) => ({
          date: d.date,
          slots: d.slots || [],
        })),
      });
    }

     // DATE OPERATIONS
    if (body?.date) {
      const date = String(body.date);
      const slot = body.slot;

      const idx = dates.findIndex((d: any) => d.date === date);

      if (op === "add") {
        const newSlot = { start: slot.start, end: slot.end };

        if (idx >= 0) {
          const arr = dates[idx].slots || [];
          if (!arr.some((s: any) => s.start === newSlot.start && s.end === newSlot.end)) {
            arr.push(newSlot);
          }
          dates[idx].slots = arr;
        } else {
          dates.push({ date, slots: [newSlot] });
        }
      }

      if (op === "edit") {
        const slotIndex = body.slotIndex;
        if (idx < 0) {
          return NextResponse.json({ error: "Date not found" }, { status: 400 });
        }

        dates[idx].slots[slotIndex] = slot;
      }

      await Schedule.updateOne(
        { consultant: payload._id },
        { $set: { dates } },
        { upsert: true }
      );

      return NextResponse.json({
        dates: dates.map((d: any) => ({
          date: d.date,
          slots: d.slots || [],
        })),
      });
    }

    return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
  } catch (err) {
    console.error("Schedule PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

//DELETE
export async function DELETE(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    const payload = verifyToken(token);

    if (!payload || payload.accountType !== "consultant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, slotIndex } = body;

    await connectDB();

    const doc = await Schedule.findOne({ consultant: payload._id });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const dates = doc.dates || [];
    const idx = dates.findIndex((d: any) => d.date === date);

    if (idx >= 0) {
      dates[idx].slots.splice(slotIndex, 1);

      await Schedule.updateOne(
        { consultant: payload._id },
        { $set: { dates } }
      );
    }

    return NextResponse.json({
      dates: dates.map((d: any) => ({
        date: d.date,
        slots: d.slots || [],
      })),
    });
  } catch (err) {
    console.error("Schedule DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}