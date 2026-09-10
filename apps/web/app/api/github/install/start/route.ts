import { NextResponse } from "next/server";
import { readGitHubAppConfig } from "@harikos/core";

import { getAuthIdentity } from "../../../../../lib/auth";
import { createInstallationState } from "../../../../../lib/github-installation";

export const runtime = "nodejs";

export async function GET() {
  const identity = await getAuthIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const app = readGitHubAppConfig();
  if (!app) {
    return NextResponse.json(
      { error: "GitHub App credentials are not configured." },
      { status: 503 },
    );
  }
  const installationUrl = new URL(
    `https://github.com/apps/${encodeURIComponent(app.slug)}/installations/new`,
  );
  installationUrl.searchParams.set("state", createInstallationState(identity.id));
  return NextResponse.redirect(installationUrl);
}
