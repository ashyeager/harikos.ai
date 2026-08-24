import { createSign } from "node:crypto";

import { z } from "zod";

export const githubAppConfigSchema = z.object({
  appId: z.string().trim().regex(/^\d+$/u),
  privateKey: z.string().trim().refine(
    (value) => value.startsWith("-----BEGIN ") && value.includes(" PRIVATE KEY-----"),
    { message: "A PEM encoded GitHub App private key is required." },
  ),
  slug: z.string().trim().regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/u),
});

export type GitHubAppConfig = z.infer<typeof githubAppConfigSchema>;

const installationTokenSchema = z.object({
  token: z.string().min(1),
  expires_at: z.string().datetime({ offset: true }),
  permissions: z.record(z.string(), z.string()).optional(),
});

export const githubInstallationSchema = z.object({
  id: z.number().int().positive(),
  account: z.object({
    id: z.number().int().positive(),
    login: z.string().min(1),
    type: z.enum(["User", "Organization"]),
  }),
  repository_selection: z.enum(["all", "selected"]),
  suspended_at: z.string().datetime({ offset: true }).nullable().default(null),
});

export type GitHubInstallation = z.infer<typeof githubInstallationSchema>;

const installationRepositoriesSchema = z.object({
  repositories: z.array(
    z.object({
      id: z.number().int().positive(),
      name: z.string().min(1),
      private: z.boolean(),
      default_branch: z.string().min(1),
      owner: z.object({ login: z.string().min(1) }),
    }),
  ),
});

export type GitHubInstallationRepository = z.infer<
  typeof installationRepositoriesSchema
>["repositories"][number];

function base64Url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

export function readGitHubAppConfig(
  environment: NodeJS.ProcessEnv = process.env,
): GitHubAppConfig | undefined {
  const appId = environment.GITHUB_APP_ID?.trim();
  const privateKey = environment.GITHUB_APP_PRIVATE_KEY?.replaceAll("\\n", "\n").trim();
  const slug = environment.GITHUB_APP_SLUG?.trim();
  if (!appId || !privateKey || !slug) {
    return undefined;
  }
  const parsed = githubAppConfigSchema.safeParse({ appId, privateKey, slug });
  return parsed.success ? parsed.data : undefined;
}

export function createGitHubAppJwt(
  config: GitHubAppConfig,
  now = Math.floor(Date.now() / 1000),
): string {
  const parsed = githubAppConfigSchema.parse(config);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: parsed.appId,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${signer.sign(parsed.privateKey, "base64url")}`;
}

export async function createGitHubInstallationToken(
  config: GitHubAppConfig,
  installationId: string,
  options: { repositoryId?: string; fetcher?: typeof fetch } = {},
): Promise<{ token: string; expiresAt: string }> {
  if (!/^\d+$/u.test(installationId)) {
    throw new Error("A numeric GitHub installation ID is required.");
  }
  const repositoryId = options.repositoryId ? Number(options.repositoryId) : undefined;
  if (repositoryId !== undefined && !Number.isSafeInteger(repositoryId)) {
    throw new Error("A safe numeric GitHub repository ID is required.");
  }
  const response = await (options.fetcher ?? fetch)(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${createGitHubAppJwt(config)}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        ...(repositoryId === undefined ? {} : { repository_ids: [repositoryId] }),
        permissions: { contents: "read", metadata: "read" },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`GitHub App token request failed with status ${response.status}.`);
  }
  const token = installationTokenSchema.parse(await response.json());
  return { token: token.token, expiresAt: token.expires_at };
}

export async function getGitHubInstallation(
  config: GitHubAppConfig,
  installationId: string,
  fetcher: typeof fetch = fetch,
): Promise<GitHubInstallation> {
  if (!/^\d+$/u.test(installationId)) {
    throw new Error("A numeric GitHub installation ID is required.");
  }
  const response = await fetcher(
    `https://api.github.com/app/installations/${installationId}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${createGitHubAppJwt(config)}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(
      `GitHub App installation lookup failed with status ${response.status}.`,
    );
  }
  return githubInstallationSchema.parse(await response.json());
}

export async function listGitHubInstallationRepositories(
  config: GitHubAppConfig,
  installationId: string,
  fetcher: typeof fetch = fetch,
): Promise<GitHubInstallationRepository[]> {
  const { token } = await createGitHubInstallationToken(config, installationId, {
    fetcher,
  });
  const repositories: GitHubInstallationRepository[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const response = await fetcher(
      `https://api.github.com/installation/repositories?per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error(
        `GitHub installation repository lookup failed with status ${response.status}.`,
      );
    }
    const pageData = installationRepositoriesSchema.parse(await response.json());
    repositories.push(...pageData.repositories);
    if (pageData.repositories.length < 100) break;
  }
  return repositories;
}
