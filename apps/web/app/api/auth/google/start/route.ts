import { NextResponse } from "next/server";

import { applicationOrigin } from "../../../../../lib/config";
import { readSupabasePublicConfig } from "../../../../../lib/supabase/config";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!readSupabasePublicConfig()) {
    return NextResponse.json({ error: "Supabase Auth is not configured." }, { status: 503 });
  }
  const origin = applicationOrigin(request.url);
  const redirectBase =
    process.env.NODE_ENV === "production"
      ? `${origin}/auth/callback`
      : process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${origin}/auth/callback`;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${redirectBase}?next=/app/projects` },
  });
  if (error || !data.url) {
    return NextResponse.json({ error: "Supabase could not start Google sign-in." }, { status: 502 });
  }
  return NextResponse.redirect(data.url);
}
