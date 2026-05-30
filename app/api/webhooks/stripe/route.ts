import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const stripe = new Stripe(stripeSecret, { apiVersion: "2022-11-15" });

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event | null = null;
  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET not set — attempting to parse raw payload (dev mode)");
    try {
      event = JSON.parse(payload) as Stripe.Event;
    } catch (err: any) {
      console.error("Failed to parse webhook payload as JSON", err?.message);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed.", err?.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  try {
    console.log("Stripe webhook received event:", event.type);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("checkout.session.completed for session", session.id, "metadata:", session.metadata);
      const metadata = session.metadata || {};

      const consultantId = metadata.consultantId as string | undefined;
      const date = metadata.date as string | undefined;
      const start = metadata.start as string | undefined;
      const end = metadata.end as string | undefined;
      const clientName = metadata.clientName as string | undefined;
      const clientEmail = metadata.clientEmail as string | undefined;

      if (!consultantId || !date || !start || !end) {
        console.warn("Missing metadata on checkout.session.completed", metadata);
      } else {
        try {
          await connectDB();
        } catch (dbErr: any) {
          console.error("connectDB failed:", dbErr?.message || dbErr);
          return NextResponse.json({ error: "DB connection failed" }, { status: 500 });
        }

        try {
          // idempotent: skip if booking with this stripeSessionId already exists
          const existing = await Booking.findOne({ stripeSessionId: session.id });
          if (!existing) {
            const booking = new Booking({
              consultant: consultantId,
              date,
              start,
              end,
              clientName: clientName || undefined,
              clientEmail: clientEmail || undefined,
              stripeSessionId: session.id,
              status: "confirmed",
            });
            const saved = await booking.save();
            console.log("Created booking from Stripe session", saved._id);
          } else {
            console.log("Booking already exists for session", session.id);
          }
        } catch (saveErr: any) {
          console.error("Failed to create booking:", saveErr?.message || saveErr);
          return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handling error:", err);
    return NextResponse.json({ error: err?.message || "unknown" }, { status: 500 });
  }
}
