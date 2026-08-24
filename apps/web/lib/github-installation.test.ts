import { afterEach, describe, expect, it, vi } from "vitest";

import {
  completeGitHubInstallation,
  createInstallationState,
  verifyInstallationState,
} from "./github-installation";

const environment = {
  HARIKOS_SESSION_SECRET: "a-secure-test-secret-with-more-than-thirty-two-characters",
  NODE_ENV: "test",
} as NodeJS.ProcessEnv;

describe("GitHub installation state", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("binds installation callbacks to the authenticated Supabase user", () => {
    const state = createInstallationState("supabase-user-a", environment, 1_000);
    expect(() =>
      verifyInstallationState(state, "supabase-user-a", environment, 2_000),
    ).not.toThrow();
    expect(() =>
      verifyInstallationState(state, "supabase-user-b", environment, 2_000),
    ).toThrow("invalid or expired");
  });

  it("rejects tampered and expired callback state", () => {
    const state = createInstallationState("supabase-user-a", environment, 1_000);
    expect(() =>
      verifyInstallationState(`${state}x`, "supabase-user-a", environment, 2_000),
    ).toThrow("invalid");
    expect(() =>
      verifyInstallationState(state, "supabase-user-a", environment, 700_000),
    ).toThrow("invalid or expired");
  });

  it("connects an existing GitHub App installation for a Google user", async () => {
    Object.entries({
      HARIKOS_SESSION_SECRET: environment.HARIKOS_SESSION_SECRET,
      GITHUB_CLIENT_ID: "Iv1.github-app-client",
      GITHUB_CLIENT_SECRET: "github-app-secret",
      GITHUB_APP_ID: "4693646",
      GITHUB_APP_PRIVATE_KEY:
        "-----BEGIN PRIVATE KEY-----test-----END PRIVATE KEY-----",
      GITHUB_APP_SLUG: "harikos-ai-project-truth",
    }).forEach(([name, value]) => vi.stubEnv(name, value));
    const identity = {
      id: "google-user",
      githubUserId: null,
      login: "google-builder",
      email: "builder@example.com",
      displayName: "Google Builder",
      avatarUrl: null,
      provider: "google" as const,
    };
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = input.toString();
      if (url === "https://github.com/login/oauth/access_token") {
        return Response.json({ access_token: "user-token" });
      }
      if (url.endsWith("/user")) {
        return Response.json({ id: 42, login: "github-builder" });
      }
      if (url.includes("/user/installations")) {
        return Response.json({ installations: [{ id: 123 }] });
      }
      return new Response(null, { status: 404 });
    }) as typeof fetch;
    const installation = await completeGitHubInstallation(
      identity,
      {
        code: "oauth-code",
        state: createInstallationState(identity.id),
      },
      fetcher,
      async () => ({
        id: 123,
        account: { id: 42, login: "github-builder", type: "User" },
        repository_selection: "all",
        suspended_at: null,
      }),
    );
    expect(installation.id).toBe(123);
  });
});
