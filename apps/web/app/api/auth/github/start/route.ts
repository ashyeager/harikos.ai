import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { applicationOrigin, readGitHubOAuthConfig } from "../../../../../lib/config";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const config = readGitHubOAuthConfig();
  const sessionSecret = process.env.HARIKOS_SESSION_SECRET?.trim();
  if (!config || !sessionSecret || sessionSecret.length < 32) {
    return NextResponse.json(
      { error: "GitHub OAuth and a 32+ character HARIKOS_SESSION_SECRET are required." },
      { status: 503 },
    );
  }
  const state = randomBytes(24).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set("harikos_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  const origin = applicationOrigin(request.url);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", config.clientId);
  authorize.searchParams.set("redirect_uri", `${origin}/api/auth/github/callback`);
  authorize.searchParams.set("scope", "read:user");
  authorize.searchParams.set("state", state);
  return NextResponse.redirect(authorize);
}
