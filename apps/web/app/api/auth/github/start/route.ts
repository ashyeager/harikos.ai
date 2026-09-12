import { NextResponse } from "next/server";

import { safeAuthNext } from "../../../../../lib/auth-redirect";
import { applicationOrigin } from "../../../../../lib/config";
import { readSupabasePublicConfig } from "../../../../../lib/supabase/config";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!readSupabasePublicConfig()) {
    return NextResponse.json(
      { error: "Supabase Auth is not configured." },
      { status: 503 },
    );
  }
  const origin = applicationOrigin(request.url);
  const redirectBase =
    process.env.NODE_ENV === "production"
      ? `${origin}/auth/callback`
      : process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${origin}/auth/callback`;
  const next = safeAuthNext(new URL(request.url).searchParams.get("next"));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${redirectBase}?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) {
    return NextResponse.json(
      { error: "Supabase could not start GitHub sign-in." },
      { status: 502 },
    );
  }
  const response = NextResponse.redirect(data.url);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
