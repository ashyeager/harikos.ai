import { NextResponse } from "next/server";

import { applicationOrigin } from "../../../../../lib/config";
import { readSupabasePublicConfig } from "../../../../../lib/supabase/config";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!readSupabasePublicConfig()) {
    return NextResponse.json({ error: "Supabase Auth is not configured." }, { status: 503 });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${applicationOrigin(request.url)}/auth/callback?next=/app/projects` },
  });
  if (error || !data.url) {
    return NextResponse.json({ error: "Supabase could not start Google sign-in." }, { status: 502 });
  }
  return NextResponse.redirect(data.url);
}