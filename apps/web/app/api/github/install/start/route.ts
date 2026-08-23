import { readGitHubAppConfig } from "@harikos/core";
import { NextResponse } from "next/server";

import { getAuthIdentity } from "../../../../../lib/auth";
import { createInstallationState } from "../../../../../lib/github-installation";

export const runtime = "nodejs";

export async function GET() {
  const identity = await getAuthIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const config = readGitHubAppConfig();
  if (!config) {
    return NextResponse.json(
      { error: "GitHub App credentials are not configured." },
      { status: 503 },
    );
  }
  const installUrl = new URL(
    `https://github.com/apps/${encodeURIComponent(config.slug)}/installations/new`,
  );
  installUrl.searchParams.set("state", createInstallationState(identity.id));
  return NextResponse.redirect(installUrl);
}
