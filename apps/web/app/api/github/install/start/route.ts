import { NextResponse } from "next/server";

import { getAuthIdentity } from "../../../../../lib/auth";
import { applicationOrigin, readGitHubAppOAuthConfig } from "../../../../../lib/config";
import { createInstallationState } from "../../../../../lib/github-installation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const identity = await getAuthIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const oauth = readGitHubAppOAuthConfig();
  if (!oauth) {
    return NextResponse.json(
      { error: "GitHub App credentials are not configured." },
      { status: 503 },
    );
  }
  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", oauth.clientId);
  authorizationUrl.searchParams.set(
    "redirect_uri",
    `${applicationOrigin(request.url)}/api/github/install/callback`,
  );
  authorizationUrl.searchParams.set("state", createInstallationState(identity.id));
  return NextResponse.redirect(authorizationUrl);
}
