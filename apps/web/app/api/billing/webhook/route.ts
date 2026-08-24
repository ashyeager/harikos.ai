import { NextResponse } from "next/server";
import { handleStripeWebhook } from "../../../../lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  try { await handleStripeWebhook(await request.text(), signature); return NextResponse.json({ received: true }); }
  catch { return NextResponse.json({ error: "Invalid Stripe webhook." }, { status: 400 }); }
}