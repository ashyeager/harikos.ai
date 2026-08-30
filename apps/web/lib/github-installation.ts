import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import {
  getGitHubInstallation,
  readGitHubAppConfig,
  type GitHubInstallation,
} from "@harikos/core";
import { z } from "zod";

import type { AuthIdentity } from "./auth";
import { readGitHubAppOAuthConfig } from "./config";

const installationStateSchema = z.object({
  userId: z.string().min(1),
  nonce: z.string().min(16),
  expiresAt: z.number().int().positive(),
});

const userTokenSchema = z.object({ access_token: z.string().min(1) });
const githubUserSchema = z.object({
  id: z.number().int().positive(),
  login: z.string().min(1),
});
const userInstallationsSchema = z.object({
  installations: z.array(z.object({ id: z.number().int().positive() })),
});

export class GitHubInstallationRequiredError extends Error {
  constructor() {
    super("Install the HARIKOS GitHub App before connecting repositories.");
    this.name = "GitHubInstallationRequiredError";
  }
}

function stateSecret(environment: NodeJS.ProcessEnv = process.env): string {
  const value = environment.HARIKOS_SESSION_SECRET?.trim();
  if (!value || value.length < 32) {
    throw new Error("HARIKOS_SESSION_SECRET must contain at least 32 characters.");
  }
  return value;
}

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createInstallationState(
  userId: string,
  environment: NodeJS.ProcessEnv = process.env,
  now = Date.now(),
): string {
  const payload = Buffer.from(
    JSON.stringify(
      installationStateSchema.parse({
        userId,
        nonce: randomBytes(18).toString("base64url"),
        expiresAt: now + 10 * 60 * 1000,
      }),
    ),
  ).toString("base64url");
  return `${payload}.${signature(payload, stateSecret(environment))}`;
}

export function verifyInstallationState(
  state: string,
  expectedUserId: string,
  environment: NodeJS.ProcessEnv = process.env,
  now = Date.now(),
): void {
  const [payload, receivedSignature, extra] = state.split(".");
  if (!payload || !receivedSignature || extra) {
    throw new Error("GitHub installation state is invalid.");
  }
  const expectedSignature = signature(payload, stateSecret(environment));
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    throw new Error("GitHub installation state is invalid.");
  }
  const parsed = installationStateSchema.parse(
    JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as unknown,
  );
  if (parsed.userId !== expectedUserId || parsed.expiresAt <= now) {
    throw new Error("GitHub installation state is invalid or expired.");
  }
}

async function githubUserRequest(
  accessToken: string,
  path: string,
  fetcher: typeof fetch,
): Promise<unknown> {
  const response = await fetcher(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`GitHub user verification failed with status ${response.status}.`);
  }
  return response.json() as Promise<unknown>;
}

export async function completeGitHubInstallation(
  identity: AuthIdentity,
  input: { code: string; installationId?: string; state: string },
  fetcher: typeof fetch = fetch,
  installationLookup: typeof getGitHubInstallation = getGitHubInstallation,
  environment: NodeJS.ProcessEnv = process.env,
): Promise<GitHubInstallation> {
  verifyInstallationState(input.state, identity.id, environment);
  if (input.installationId && !/^\d+$/u.test(input.installationId)) {
    throw new Error("GitHub returned an invalid installation ID.");
  }
  const oauth = readGitHubAppOAuthConfig(environment);
  const app = readGitHubAppConfig(environment);
  if (!oauth || !app) throw new Error("GitHub App credentials are not configured.");

  const tokenResponse = await fetcher("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: oauth.clientId,
      client_secret: oauth.clientSecret,
      code: input.code,
    }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) {
    throw new Error("GitHub rejected the installation verification exchange.");
  }
  const token = userTokenSchema.parse(await tokenResponse.json());
  const [githubUser, installations] = await Promise.all([
    githubUserRequest(token.access_token, "/user", fetcher).then((value) =>
      githubUserSchema.parse(value),
    ),
    githubUserRequest(
      token.access_token,
      "/user/installations?per_page=100",
      fetcher,
    ).then((value) => userInstallationsSchema.parse(value)),
  ]);
  if (identity.provider === "github" && String(githubUser.id) !== identity.githubUserId) {
    throw new Error("The GitHub installation does not belong to this signed-in user.");
  }
  const installationId = input.installationId ??
    installations.installations[0]?.id.toString();
  if (!installationId) throw new GitHubInstallationRequiredError();
  if (!installations.installations.some(
    (installation) => String(installation.id) === installationId,
  )) {
    throw new Error("The GitHub installation does not belong to this signed-in user.");
  }
  const installation = await installationLookup(app, installationId, fetcher);
  if (installation.suspended_at) {
    throw new Error("The GitHub App installation is suspended.");
  }
  return installation;
}
