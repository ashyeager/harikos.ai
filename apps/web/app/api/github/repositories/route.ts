import { NextResponse } from "next/server";
import { z } from "zod";

import { getWebSession } from "../../../../lib/session";

export const runtime = "nodejs";

const installationsSchema = z.object({
  installations: z.array(z.object({ id: z.number().int().positive() })),
});

const repositoriesSchema = z.object({
  repositories: z.array(
    z.object({
      id: z.number().int().positive(),
      name: z.string(),
      private: z.boolean(),
      default_branch: z.string(),
      owner: z.object({ login: z.string() }),
    }),
  ),
});

async function githubRequest(token: string, path: string): Promise<unknown> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`GitHub request failed with status ${response.status}.`);
  }
  return response.json() as Promise<unknown>;
}

export async function GET() {
  const session = await getWebSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const installations = installationsSchema.parse(
      await githubRequest(session.accessToken, "/user/installations?per_page=100"),
    );
    const repositories: Array<{
      installationId: string;
      githubRepositoryId: string;
      owner: string;
      name: string;
      defaultBranch: string;
      private: boolean;
    }> = [];
    for (const installation of installations.installations) {
      const page = repositoriesSchema.parse(
        await githubRequest(
          session.accessToken,
          `/user/installations/${installation.id}/repositories?per_page=100`,
        ),
      );
      repositories.push(
        ...page.repositories.map((repository) => ({
          installationId: String(installation.id),
          githubRepositoryId: String(repository.id),
          owner: repository.owner.login,
          name: repository.name,
          defaultBranch: repository.default_branch,
          private: repository.private,
        })),
      );
    }
    return NextResponse.json(
      { repositories },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GitHub repository lookup failed." },
      { status: 502 },
    );
  }
}
