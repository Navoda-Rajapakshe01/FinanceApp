import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecret, { apiVersion: "2022-11-15" });

export async function POST(req: Request) {
  try {
    if (!stripeSecret) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const {
      amount = 0,
      consultantName = "Consultation",
      service = "Service",
      sessionMinutes = 60,
      date = "",
      time = "",
      consultantId = "",
      endTime = "",
      clientName = "",
      clientEmail = "",
    } = body || {};

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const currency = (process.env.STRIPE_CURRENCY || "lkr").toLowerCase();

    // If `amount` is an hourly rate, prorate for the session length (minutes).
    const minutes = Number(sessionMinutes) || 60;
    const amountPerHour = Number(amount) || 0;
    const chargeAmount = minutes > 0 ? amountPerHour * (minutes / 60) : amountPerHour;
    // Convert amount to smallest currency unit (assumes 2 decimals)
    const unitAmount = Math.round(chargeAmount * 100);


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: `${service} — ${consultantName}` },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        consultantId: String(consultantId),
        date: String(date),
        start: String(time),
        end: String(endTime),
        clientName: String(clientName),
        clientEmail: String(clientEmail),
      },
      success_url: `${origin}/personal/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/personal/checkout?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err?.message || "unknown" }, { status: 500 });
  }
}
