import { describe, expect, it } from "vitest";

import { readSupabaseProviderStatus, readSupabasePublicConfig } from "./config";

const environment: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key",
};

describe("Supabase provider availability", () => {
  it("accepts the Vercel publishable-key alias", () => {
    expect(
      readSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "public-key",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "public-key",
    });
  });
  it("returns only providers enabled by the live Auth settings", async () => {
    const request = async () =>
      new Response(
        JSON.stringify({ external: { github: true, google: false } }),
        { status: 200 },
      );

    await expect(
      readSupabaseProviderStatus(environment, request as typeof fetch),
    ).resolves.toEqual({ github: true, google: false });
  });

  it("fails closed when Auth settings cannot be read", async () => {
    const request = async () => new Response(null, { status: 503 });

    await expect(
      readSupabaseProviderStatus(environment, request as typeof fetch),
    ).resolves.toEqual({ github: false, google: false });
  });
});
