import { createSign } from "node:crypto";

import { z } from "zod";

export const githubAppConfigSchema = z.object({
  appId: z.string().trim().min(1),
  privateKey: z.string().trim().min(1),
  slug: z.string().trim().min(1),
});

export type GitHubAppConfig = z.infer<typeof githubAppConfigSchema>;

const installationTokenSchema = z.object({
  token: z.string().min(1),
  expires_at: z.string().datetime({ offset: true }),
  permissions: z.record(z.string(), z.string()).optional(),
});

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
  return githubAppConfigSchema.parse({ appId, privateKey, slug });
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
