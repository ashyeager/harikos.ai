import { createServerClient } from "@supabase/ssr";

export function getAuthenticationClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    { cookies: { getAll: () => [], setAll: () => undefined } },
  );
}
