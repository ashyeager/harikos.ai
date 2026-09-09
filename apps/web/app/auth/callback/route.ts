import { NextResponse } from "next/server";

import { applicationOrigin } from "../../../lib/config";
import { safeAuthNext } from "../../../lib/auth-redirect";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth", applicationOrigin(request.url)));
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", applicationOrigin(request.url)));
  }
  const response = NextResponse.redirect(
    new URL(safeAuthNext(url.searchParams.get("next")), applicationOrigin(request.url)),
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
