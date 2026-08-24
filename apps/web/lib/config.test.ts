import { describe, expect, it } from "vitest";

import { applicationOrigin, integrationStatus } from "./config";

describe("web integration configuration", () => {
  it("pins OAuth redirects to the configured public origin", () => {
    expect(
      applicationOrigin("https://host-header.invalid/callback", {
        NEXT_PUBLIC_APP_URL: "https://harikos.example/path",
        NODE_ENV: "test",
      }),
    ).toBe("https://harikos.example");
    expect(() =>
      applicationOrigin("https://harikos.example", {
        NEXT_PUBLIC_APP_URL: "javascript:alert(1)",
        NODE_ENV: "test",
      }),
    ).toThrow("http or https");
  });

  it("does not report Supabase Auth ready without public project configuration", () => {
    expect(
      integrationStatus({
        NODE_ENV: "production",
      }),
    ).toMatchObject({ supabaseAuth: false, localDemo: false });
  });

  it("does not treat Vercel sensitive placeholders as configured secrets", () => {
    expect(
      integrationStatus({
        NODE_ENV: "production",
        GITHUB_APP_ID: "123",
        GITHUB_APP_SLUG: "harikos",
        GITHUB_APP_PRIVATE_KEY: "[Sensitive]",
        GITHUB_CLIENT_ID: "client",
        GITHUB_CLIENT_SECRET: "[Sensitive]",
        HARIKOS_SESSION_SECRET: "[Sensitive]",
      }),
    ).toMatchObject({ githubApp: false });
  });
});
