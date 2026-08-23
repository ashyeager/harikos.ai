import { z } from "zod";

export const supabasePublicConfigSchema = z.object({
  url: z.string().url(),
  publishableKey: z.string().trim().min(1),
});

export type SupabasePublicConfig = z.infer<typeof supabasePublicConfigSchema>;

export function readSupabasePublicConfig(
  environment: NodeJS.ProcessEnv = process.env,
): SupabasePublicConfig | undefined {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) return undefined;
  return supabasePublicConfigSchema.parse({ url, publishableKey });
}
