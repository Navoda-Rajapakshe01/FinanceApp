import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Month } from "@/models";

const MONTHS_DATA = [
  { value: "01", label: "Jan", fullName: "January" },
  { value: "02", label: "Feb", fullName: "February" },
  { value: "03", label: "Mar", fullName: "March" },
  { value: "04", label: "Apr", fullName: "April" },
  { value: "05", label: "May", fullName: "May" },
  { value: "06", label: "Jun", fullName: "June" },
  { value: "07", label: "Jul", fullName: "July" },
  { value: "08", label: "Aug", fullName: "August" },
  { value: "09", label: "Sep", fullName: "September" },
  { value: "10", label: "Oct", fullName: "October" },
  { value: "11", label: "Nov", fullName: "November" },
  { value: "12", label: "Dec", fullName: "December" },
];

async function seedMonths() {
  try {
    const count = await Month.countDocuments();
    if (count === 0) {
      await Month.insertMany(MONTHS_DATA);
      console.log("Months seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding months:", error);
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Seed months if collection is empty
    await seedMonths();

    const months = await Month.find().sort({ value: 1 });

    return NextResponse.json(
      {
        months,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching months:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch months",
      },
      { status: 500 }
    );
  }
}
