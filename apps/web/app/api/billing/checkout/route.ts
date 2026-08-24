import { NextResponse } from "next/server";
import { createCheckoutSession, requireBillingIdentity } from "../../../../lib/billing";

export const runtime = "nodejs";

export async function POST() {
  try { return NextResponse.json({ url: await createCheckoutSession(await requireBillingIdentity()) }); }
  catch { return NextResponse.json({ error: "Checkout is not available." }, { status: 503 }); }
}