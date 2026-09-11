import { NextResponse } from "next/server";
import { createPortalSession, requireBillingIdentity } from "../../../../lib/billing";

export const runtime = "nodejs";

export async function POST() {
  const identity = await requireBillingIdentity().catch(() => undefined);
  if (!identity) return NextResponse.json({ error: "Authentication required.", code: "AUTHENTICATION_REQUIRED" }, { status: 401 });
  try { return NextResponse.json({ url: await createPortalSession(identity) }); }
  catch { return NextResponse.json({ error: "Billing portal is not available.", code: "BILLING_UNAVAILABLE" }, { status: 503 }); }
}
