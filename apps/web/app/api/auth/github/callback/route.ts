import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { applicationOrigin, readGitHubOAuthConfig } from "../../../../../lib/config";
import { sealSession, SESSION_COOKIE } from "../../../../../lib/session";

export const runtime = "nodejs";

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive().optional(),
});

const userSchema = z.object({
  id: z.number().int().positive(),
  login: z.string().min(1),
  name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
});

function statesMatch(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function GET(request: Request) {
  const config = readGitHubOAuthConfig();
  if (!config) {
    return NextResponse.json({ error: "GitHub OAuth is not configured." }, { status: 503 });
  }
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("harikos_oauth_state")?.value;
  cookieStore.delete("harikos_oauth_state");
  if (!code || !state || !expectedState || !statesMatch(state, expectedState)) {
    return NextResponse.json({ error: "GitHub OAuth state validation failed." }, { status: 400 });
  }
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: `${applicationOrigin(request.url)}/api/auth/github/callback`,
    }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) {
    return NextResponse.json({ error: "GitHub rejected the OAuth exchange." }, { status: 502 });
  }
  const token = tokenSchema.parse(await tokenResponse.json());
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token.access_token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!userResponse.ok) {
    return NextResponse.json({ error: "GitHub user lookup failed." }, { status: 502 });
  }
  const user = userSchema.parse(await userResponse.json());
  const expiresAt = new Date(
    Date.now() + (token.expires_in ?? 28_800) * 1000,
  ).toISOString();
  const sealed = sealSession({
    user: {
      githubUserId: String(user.id),
      login: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
    },
    accessToken: token.access_token,
    expiresAt,
  });
  const response = NextResponse.redirect(new URL("/app/projects", applicationOrigin(request.url)));
  response.cookies.set(SESSION_COOKIE, sealed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    path: "/",
  });
  return response;
}
