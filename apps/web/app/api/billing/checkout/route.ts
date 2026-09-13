import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession, ManagedSubscriptionError, requireBillingIdentity } from "../../../../lib/billing";
import { type Plan } from "../../../../lib/entitlements";

export const runtime = "nodejs";

const requestSchema = z.object({ plan: z.enum(["core", "pro", "scale"]).default("pro") });
export async function POST(request: Request) {
  const identity = await requireBillingIdentity().catch(() => undefined);
  if (!identity) return NextResponse.json({ error: "Authentication required.", code: "AUTHENTICATION_REQUIRED" }, { status: 401 });
  try {
    const plan = requestSchema.parse(await request.json().catch(() => ({}))).plan as Plan;
    const countryCode = request.headers.get("x-vercel-ip-country")?.toUpperCase() ?? process.env.PADDLE_DEFAULT_COUNTRY_CODE?.trim().toUpperCase();
    return NextResponse.json({ url: await createCheckoutSession(identity, plan, countryCode && /^[A-Z]{2}$/u.test(countryCode) ? { countryCode } : undefined) });
  }
  catch (error) {
    const invalid = error instanceof z.ZodError;
    const managed = error instanceof ManagedSubscriptionError;
    return NextResponse.json(
      {
        error: invalid ? "A valid paid plan is required." : managed ? error.message : "Checkout is not available.",
        code: invalid ? "INVALID_REQUEST" : managed ? "ALREADY_SUBSCRIBED" : "BILLING_UNAVAILABLE",
      },
      { status: invalid ? 400 : managed ? 409 : 503 },
    );
  }
}
