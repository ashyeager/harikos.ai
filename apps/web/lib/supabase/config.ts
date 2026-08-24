import { z } from "zod";

export const supabasePublicConfigSchema = z.object({
  url: z.string().url(),
  publishableKey: z.string().trim().min(1),
});

export type SupabasePublicConfig = z.infer<typeof supabasePublicConfigSchema>;

export type SupabaseProviderStatus = {
  github: boolean;
  google: boolean;
};

export function readSupabasePublicConfig(
  environment: NodeJS.ProcessEnv = process.env,
): SupabasePublicConfig | undefined {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) return undefined;
  return supabasePublicConfigSchema.parse({ url, publishableKey });
}

export async function readSupabaseProviderStatus(
  environment: NodeJS.ProcessEnv = process.env,
  request: typeof fetch = fetch,
): Promise<SupabaseProviderStatus> {
  const config = readSupabasePublicConfig(environment);
  if (!config) return { github: false, google: false };
  try {
    const response = await request(`${config.url}/auth/v1/settings`, {
      headers: { apikey: config.publishableKey },
      cache: "no-store",
    });
    if (!response.ok) return { github: false, google: false };
    const settings = (await response.json()) as {
      external?: { github?: boolean; google?: boolean };
    };
    return {
      github: settings.external?.github === true,
      google: settings.external?.google === true,
    };
  } catch {
    return { github: false, google: false };
  }
}
