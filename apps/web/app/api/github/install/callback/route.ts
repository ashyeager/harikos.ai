import { NextResponse } from "next/server";
import { readGitHubAppConfig } from "@harikos/core";

import { getAuthIdentity } from "../../../../../lib/auth";
import { saveCloudInstallation } from "../../../../../lib/cloud-projects";
import {
  applicationOrigin,
  readGitHubAppOAuthConfig,
} from "../../../../../lib/config";
import {
  completeGitHubInstallation,
  createInstallationState,
  GitHubInstallationRequiredError,
  verifyInstallationState,
} from "../../../../../lib/github-installation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const identity = await getAuthIdentity();
  if (!identity) {
    return NextResponse.redirect(new URL("/login", applicationOrigin(request.url)));
  }
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const installationId = url.searchParams.get("installation_id");
  if (!state || (!code && !installationId)) {
    return NextResponse.redirect(
      new URL("/app/projects?install=invalid", applicationOrigin(request.url)),
    );
  }
  try {
    if (installationId && !code) {
      if (!/^\d+$/u.test(installationId)) {
        throw new Error("GitHub returned an invalid installation ID.");
      }
      verifyInstallationState(state, identity.id);
      const oauth = readGitHubAppOAuthConfig();
      if (!oauth) throw new Error("GitHub App OAuth credentials are not configured.");
      const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
      authorizationUrl.searchParams.set("client_id", oauth.clientId);
      authorizationUrl.searchParams.set(
        "redirect_uri",
        `${applicationOrigin(request.url)}/api/github/install/callback`,
      );
      authorizationUrl.searchParams.set(
        "state",
        createInstallationState(identity.id, process.env, Date.now(), installationId),
      );
      return NextResponse.redirect(authorizationUrl);
    }
    if (!code) throw new Error("GitHub authorization code is missing.");
    const installation = await completeGitHubInstallation(identity, {
      code,
      state,
    });
    await saveCloudInstallation(identity, installation);
    return NextResponse.redirect(
      new URL("/app/projects?install=ready", applicationOrigin(request.url)),
    );
  } catch (error) {
    if (error instanceof GitHubInstallationRequiredError) {
      const config = readGitHubAppConfig();
      if (config) {
        const installUrl = new URL(
          `https://github.com/apps/${encodeURIComponent(config.slug)}/installations/new`,
        );
        installUrl.searchParams.set("state", createInstallationState(identity.id));
        return NextResponse.redirect(installUrl);
      }
    }
    return NextResponse.redirect(
      new URL("/app/projects?install=failed", applicationOrigin(request.url)),
    );
  }
}
