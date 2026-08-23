import { NextResponse } from "next/server";

import { integrationStatus } from "../../../lib/config";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(integrationStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}
