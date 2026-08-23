import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
