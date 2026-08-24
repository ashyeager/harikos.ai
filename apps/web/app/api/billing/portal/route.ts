import { NextResponse } from "next/server";
import { createPortalSession, requireBillingIdentity } from "../../../../lib/billing";

export const runtime = "nodejs";

export async function POST() {
  try { return NextResponse.json({ url: await createPortalSession(await requireBillingIdentity()) }); }
  catch { return NextResponse.json({ error: "Billing portal is not available." }, { status: 503 }); }
}