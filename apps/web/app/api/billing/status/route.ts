import { NextResponse } from "next/server";

import { getAuthIdentity } from "../../../../lib/auth";
import { resolveEntitlement } from "../../../../lib/entitlements";

export const runtime = "nodejs";
export async function GET() {
  const identity = await getAuthIdentity();
  if (!identity) return NextResponse.json({ error: "Authentication required.", code: "AUTHENTICATION_REQUIRED" }, { status: 401 });
  return NextResponse.json(await resolveEntitlement(identity), { headers: { "Cache-Control": "private, no-store" } });
}
