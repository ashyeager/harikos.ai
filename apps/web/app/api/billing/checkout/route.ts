import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession, requireBillingIdentity } from "../../../../lib/billing";
import { type Plan } from "../../../../lib/entitlements";

export const runtime = "nodejs";

const requestSchema = z.object({ plan: z.enum(["core", "pro", "scale"]).default("pro") });
export async function POST(request: Request) {
  const identity = await requireBillingIdentity().catch(() => undefined);
  if (!identity) return NextResponse.json({ error: "Authentication required.", code: "AUTHENTICATION_REQUIRED" }, { status: 401 });
  try { return NextResponse.json({ url: await createCheckoutSession(identity, requestSchema.parse(await request.json().catch(() => ({}))).plan as Plan) }); }
  catch (error) { const invalid = error instanceof z.ZodError; return NextResponse.json({ error: invalid ? "A valid paid plan is required." : "Checkout is not available.", code: invalid ? "INVALID_REQUEST" : "BILLING_UNAVAILABLE" }, { status: invalid ? 400 : 503 }); }
}
