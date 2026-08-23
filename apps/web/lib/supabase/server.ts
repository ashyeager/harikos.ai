import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { readSupabasePublicConfig } from "./config";

export async function createSupabaseServerClient() {
  const config = readSupabasePublicConfig();
  if (!config) {
    throw new Error("Supabase authentication is not configured.");
  }
  const cookieStore = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      encode: "tokens-only",
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(
            ({ name, value, options }: {
              name: string;
              value: string;
              options: CookieOptions;
            }) => cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies. The root proxy refreshes them.
        }
      },
    },
  });
}
