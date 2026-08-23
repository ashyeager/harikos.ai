import { resolve } from "node:path";

import { readCloudDatabaseConfig } from "@harikos/db";
import { readGitHubAppConfig } from "@harikos/core";
import { z } from "zod";

import { readSupabasePublicConfig } from "./supabase/config";

export const githubAppOAuthConfigSchema = z.object({
  clientId: z.string().trim().min(1),
  clientSecret: z.string().trim().min(1),
});

export type GitHubAppOAuthConfig = z.infer<typeof githubAppOAuthConfigSchema>;

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
  if (!clientId || !clientSecret) {
    return undefined;
  }
  return githubAppOAuthConfigSchema.parse({ clientId, clientSecret });
}

export function isLocalDemoEnabled(
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  if (environment.HARIKOS_ENABLE_LOCAL_DEMO === "true") {
    return true;
  }
  return environment.NODE_ENV !== "production";
}

export function localRepositoryPath(
  environment: NodeJS.ProcessEnv = process.env,
): string {
  return environment.HARIKOS_LOCAL_REPOSITORY?.trim() || resolve(process.cwd(), "../..");
}

export function integrationStatus(environment: NodeJS.ProcessEnv = process.env) {
  return {
    supabaseAuth: readSupabasePublicConfig(environment) !== undefined,
    githubApp:
      readGitHubAppConfig(environment) !== undefined &&
      readGitHubAppOAuthConfig(environment) !== undefined &&
      (environment.HARIKOS_SESSION_SECRET?.trim().length ?? 0) >= 32,
    postgres: readCloudDatabaseConfig(environment) !== undefined,
    localDemo: isLocalDemoEnabled(environment),
  };
}
