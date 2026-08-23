import { NextResponse } from "next/server";

import { applicationOrigin } from "../../../lib/config";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

function safeNext(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/app/projects";
}

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
    new URL(safeNext(url.searchParams.get("next")), applicationOrigin(request.url)),
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
