import { cache } from "react";

import { z } from "zod";

import { readSupabasePublicConfig } from "./supabase/config";
import { createSupabaseServerClient } from "./supabase/server";

const claimsSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email().optional(),
  user_metadata: z.record(z.string(), z.unknown()).default({}),
  app_metadata: z.record(z.string(), z.unknown()).default({}),
});

export const authIdentitySchema = z.object({
  id: z.string().min(1),
  githubUserId: z.string().min(1).nullable(),
  login: z.string().min(1),
  email: z.string().email().nullable(),
  displayName: z.string().min(1).nullable(),
  avatarUrl: z.string().url().nullable(),
  provider: z.enum(["github", "google", "other"]),
});

export type AuthIdentity = z.infer<typeof authIdentitySchema>;

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function identityFromClaims(value: unknown): AuthIdentity | undefined {
  const result = claimsSchema.safeParse(value);
  if (!result.success) return undefined;
  const metadata = result.data.user_metadata;
  const provider = optionalString(result.data.app_metadata.provider) ??
    (optionalString(metadata.provider_id) ? "github" : undefined);
  const githubUserId =
    optionalString(metadata.provider_id) ?? optionalString(metadata.sub);
  const login =
    optionalString(metadata.user_name) ??
    optionalString(metadata.preferred_username) ??
    optionalString(metadata.name) ??
    result.data.email?.split("@")[0];
  if (!login || (provider !== "github" && provider !== "google")) return undefined;
  return authIdentitySchema.parse({
    id: result.data.sub,
    githubUserId: githubUserId ?? null,
    login,
    email: result.data.email ?? optionalString(metadata.email) ?? null,
    displayName:
      optionalString(metadata.full_name) ?? optionalString(metadata.name) ?? null,
    avatarUrl:
      optionalString(metadata.avatar_url) ??
      optionalString(metadata.picture) ??
      null,
    provider: provider === "github" || provider === "google" ? provider : "other",
  });
}

export const getAuthIdentity = cache(
  async (): Promise<AuthIdentity | undefined> => {
    if (!readSupabasePublicConfig()) return undefined;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) return undefined;
    return identityFromClaims(data.claims);
  },
);
