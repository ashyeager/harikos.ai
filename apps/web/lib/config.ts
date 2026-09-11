import { readCloudDatabaseConfig } from "@harikos/db";
import { readGitHubAppConfig } from "@harikos/core";
import { z } from "zod";

import { readSupabasePublicConfig } from "./supabase/config";

export const githubAppOAuthConfigSchema = z.object({
  clientId: z.string().trim().min(1),
  clientSecret: z.string().trim().min(1),
});

export type GitHubAppOAuthConfig = z.infer<typeof githubAppOAuthConfigSchema>;

function isUsableSecret(value: string | undefined): value is string {
  const normalized = value?.trim();
  return Boolean(
    normalized &&
    normalized !== "[Sensitive]" &&
    !/^<[^>]+>$/u.test(normalized),
  );
}

export function applicationOrigin(
  requestUrl: string,
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const configured = environment.NEXT_PUBLIC_APP_URL?.trim();
  const url = new URL(configured || requestUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_APP_URL must use http or https.");
  }
  return url.origin;
}

export function readGitHubAppOAuthConfig(
  environment: NodeJS.ProcessEnv = process.env,
): GitHubAppOAuthConfig | undefined {
  const clientId = environment.GITHUB_CLIENT_ID?.trim();
  const clientSecret = environment.GITHUB_CLIENT_SECRET?.trim();
  if (!isUsableSecret(clientId) || !isUsableSecret(clientSecret)) {
    return undefined;
  }
  return githubAppOAuthConfigSchema.parse({ clientId, clientSecret });
}

export function integrationStatus(environment: NodeJS.ProcessEnv = process.env) {
  return {
    supabaseAuth: readSupabasePublicConfig(environment) !== undefined,
    githubApp:
      readGitHubAppConfig(environment) !== undefined &&
      readGitHubAppOAuthConfig(environment) !== undefined &&
      isUsableSecret(environment.HARIKOS_SESSION_SECRET) &&
      environment.HARIKOS_SESSION_SECRET.trim().length >= 32,
    postgres: readCloudDatabaseConfig(environment) !== undefined,
    paddle: Boolean(
      isUsableSecret(environment.PADDLE_API_KEY) &&
      isUsableSecret(environment.PADDLE_WEBHOOK_SECRET) &&
      environment.PADDLE_CORE_PRICE_ID?.trim() &&
      environment.PADDLE_PRO_PRICE_ID?.trim() &&
      environment.PADDLE_SCALE_PRICE_ID?.trim(),
    ),
  };
}
