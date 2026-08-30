import { NextResponse } from "next/server";

import { getAuthIdentity } from "../../../lib/auth";
import { listAuthorizedRepositories } from "../../../lib/cloud-projects";

export const runtime = "nodejs";

/**
 * Backward-compatible repository endpoint for early dashboard clients.
 * Repository access remains restricted to the authenticated user's GitHub App
 * installations; no GitHub access token is exposed to the browser.
 */
export async function GET() {
  const identity = await getAuthIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const repositories = await listAuthorizedRepositories(identity);
    return NextResponse.json(
      repositories.map((repository) => ({
        id: repository.githubRepositoryId,
        name: repository.name,
        fullName: `${repository.owner}/${repository.name}`,
        owner: repository.owner,
        url: `https://github.com/${repository.owner}/${repository.name}`,
        description: "",
        language: "Unknown",
        stars: 0,
        private: repository.private,
        defaultBranch: repository.defaultBranch,
        updatedAt: null,
        installationId: repository.installationId,
      })),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "GitHub repository lookup failed.",
      },
      { status: 502 },
    );
  }
}
