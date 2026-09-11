import { NextResponse } from "next/server";

import { ProductAccessError, ProductQuotaError } from "./entitlements";

export function productErrorResponse(error: unknown, fallback: string): NextResponse {
  if (error instanceof ProductAccessError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 402, headers: { "Cache-Control": "private, no-store" } });
  }
  if (error instanceof ProductQuotaError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 429, headers: { "Cache-Control": "private, no-store" } });
  }
  return NextResponse.json({ error: fallback, code: "REQUEST_FAILED" }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
}
