import { NextResponse } from "next/server";

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
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${origin}/auth/callback?next=/app/projects` },
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
