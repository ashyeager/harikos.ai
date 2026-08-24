import { NextResponse } from "next/server";
import { readGitHubAppConfig } from "@harikos/core";

import { getAuthIdentity } from "../../../../../lib/auth";
import { saveCloudInstallation } from "../../../../../lib/cloud-projects";
import { applicationOrigin } from "../../../../../lib/config";
import {
  completeGitHubInstallation,
  createInstallationState,
  GitHubInstallationRequiredError,
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
  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/app/projects?install=invalid", applicationOrigin(request.url)),
    );
  }
  try {
    const installation = await completeGitHubInstallation(identity, {
      code,
      state,
      ...(installationId ? { installationId } : {}),
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
