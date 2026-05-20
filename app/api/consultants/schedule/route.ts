import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Schedule } from "@/models";
import { verifyToken } from "@/lib/auth";

async function requireConsultant(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.split(" ")[1];
  if (!token) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const payload = verifyToken(token);
  if (!payload || payload.accountType !== "consultant") return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { payload };
}

export async function GET(request: NextRequest) {
  try {
    const req = await requireConsultant(request);
    if ((req as any).error) return (req as any).error;
    const { payload }: any = req;

    await connectDB();

    let doc = await Schedule.findOne({ consultant: payload._id }).lean();
    if (!doc) {
      // create a default empty week
      const days = [
        { day: "Monday", dayShort: "M", slots: [], available: false },
        { day: "Tuesday", dayShort: "T", slots: [], available: false },
        { day: "Wednesday", dayShort: "W", slots: [], available: false },
        { day: "Thursday", dayShort: "T", slots: [], available: false },
        { day: "Friday", dayShort: "F", slots: [], available: false },
        { day: "Saturday", dayShort: "S", slots: [], available: false },
        { day: "Sunday", dayShort: "S", slots: [], available: false },
      ];
      const created = await Schedule.create({ consultant: payload._id, days, defaultSlots: [], dateSlots: [] });
      doc = created.toObject();
    }

    return NextResponse.json({ schedule: doc });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const req = await requireConsultant(request);
    if ((req as any).error) return (req as any).error;
    const { payload }: any = req;

    const body = await request.json();
    const { days, defaultSlots, dateSlots } = body;
    if (!Array.isArray(days) && !Array.isArray(defaultSlots) && !Array.isArray(dateSlots)) {
      return NextResponse.json({ error: "payload must include days, defaultSlots or dateSlots arrays" }, { status: 400 });
    }

    await connectDB();

    const setObj: any = { updatedAt: new Date() };
    if (Array.isArray(days)) setObj.days = days;
    if (Array.isArray(defaultSlots)) setObj.defaultSlots = defaultSlots;
    if (Array.isArray(dateSlots)) setObj.dateSlots = dateSlots;

    const updated = await Schedule.findOneAndUpdate(
      { consultant: payload._id },
      { $set: setObj },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ schedule: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const req = await requireConsultant(request);
    if ((req as any).error) return (req as any).error;
    const { payload }: any = req;

    const body = await request.json();
    const { day, date, start, end, defaultSlot } = body;
    if (!start || !end) return NextResponse.json({ error: "start,end required" }, { status: 400 });

    await connectDB();

    const doc: any = await Schedule.findOne({ consultant: payload._id });
    if (!doc) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    if (defaultSlot) {
      // add to defaultSlots
      doc.defaultSlots = doc.defaultSlots || [];
      doc.defaultSlots.push({ start, end });
      doc.updatedAt = new Date();
      await doc.save();
      return NextResponse.json({ message: "Default slot added", schedule: doc });
    }

    if (date) {
      // add to dateSlots (by exact date string)
      doc.dateSlots = doc.dateSlots || [];
      let found = doc.dateSlots.find((d: any) => d.date === date);
      if (!found) {
        found = { date, slots: [], available: true };
        doc.dateSlots.push(found);
      }
      found.slots.push({ start, end });
      found.available = true;
      doc.updatedAt = new Date();
      await doc.save();
      return NextResponse.json({ message: "Date slot added", schedule: doc });
    }

    if (day) {
      const found = doc.days.find((d: any) => d.day === day);
      if (!found) return NextResponse.json({ error: "Day not found" }, { status: 404 });
      found.slots.push({ start, end });
      found.available = true;
      doc.updatedAt = new Date();
      await doc.save();
      return NextResponse.json({ message: "Slot added", schedule: doc });
    }

    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const req = await requireConsultant(request);
    if ((req as any).error) return (req as any).error;
    const { payload }: any = req;

    const body = await request.json();
    const { day, index, date, defaultIndex } = body;
    if (typeof index !== "number" && typeof defaultIndex !== "number" && !date) return NextResponse.json({ error: "invalid payload" }, { status: 400 });

    await connectDB();

    const doc: any = await Schedule.findOne({ consultant: payload._id });
    if (!doc) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    if (typeof defaultIndex === "number") {
      if (!doc.defaultSlots || defaultIndex < 0 || defaultIndex >= doc.defaultSlots.length) return NextResponse.json({ error: "Invalid default index" }, { status: 400 });
      doc.defaultSlots.splice(defaultIndex, 1);
      doc.updatedAt = new Date();
      await doc.save();
      return NextResponse.json({ message: "Default slot removed", schedule: doc });
    }

    if (date) {
      const found = doc.dateSlots.find((d: any) => d.date === date);
      if (!found) return NextResponse.json({ error: "Date not found" }, { status: 404 });
      if (index < 0 || index >= found.slots.length) return NextResponse.json({ error: "Invalid index" }, { status: 400 });
      found.slots.splice(index, 1);
      if (found.slots.length === 0) found.available = false;
      doc.updatedAt = new Date();
      await doc.save();
      return NextResponse.json({ message: "Date slot removed", schedule: doc });
    }

    if (day) {
      const found = doc.days.find((d: any) => d.day === day);
      if (!found) return NextResponse.json({ error: "Day not found" }, { status: 404 });
      if (index < 0 || index >= found.slots.length) return NextResponse.json({ error: "Invalid index" }, { status: 400 });
      found.slots.splice(index, 1);
      if (found.slots.length === 0) found.available = false;
      doc.updatedAt = new Date();
      await doc.save();
      return NextResponse.json({ message: "Slot removed", schedule: doc });
    }

    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
