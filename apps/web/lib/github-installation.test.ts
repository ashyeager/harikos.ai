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

const testPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD4knqdgC5hkwX+
oRebJh8OyxuVOGjAp49VeP9qm2VFqoMqIARWmPsxCfHmtP2Qt4bky2HZUmtSk7j3
elQjsX+/lDhq/P2nCsAfRk9OlsMNCAv/rK6P87C8tZdFmWgLatft1UBGK3r5b/Ut
nfejyC3bCeMUeuUadaDRktgzyWCMvI2wGC7EPE9ko+jves0A5n++LzLgU6Xi9gl9
bpsiBvrBpz1pxlqCgckrrs+tm9Ky9WWk+wiRu58tFq2+DAoPmLk8FNWQ5v7CeSnR
Ma/gpqX8qmiV9nSxoP65A10L1XRFSv7n65pRcEKadnCGjRTAT6XTKfgwF8iszzAz
TEJtPxetAgMBAAECggEALqsPnsDpVFPuYPE9NZmJZLVg2xnxXtRGrpkuOQVuVM9P
22mR7vE/XeRcWIB8B77RMmT13L+i2yjVZg8/O0lQrvcExZ90fvdffS+t5ZccDTcI
y6qPxoKN2MwuF7jWxif73ND4BYSVzL2GllctXoBPjat0SQzOtTJG7HnpogVpnVpN
c8JNXsZ0RtKZ7rng/Wh4DJoEKMZWETSaYi6s4to5Y7iiNbJ+yrs+jlZ3gIXKBP2n
FSDBBvW2mZnmlISqtzn4ip9hONQ5N7L00nUvbkDqTv+ZVutvngwc25nJ1skAn9aX
YHzGbfXD4BgWphGY4ecQmv5PxHkWgAb666LXg0/YiQKBgQD/lpXmerCh40l/VREc
JmQjZDVSrjGTAJiYgSpGegsbFAwD0f/2UJXq/cuAXqxXi+w/zqF2xoDla4s5/wVz
AG2cwb0kIxZsnHa/iPX/2PeB7A0QYE6eHrGYNs0eiTWUdj2DJoIx5kVMpCph6rek
ELd6DFjx3qQnsnAlaHjMOS7ZBQKBgQD4+P/uZOYFT3vyORT7C9yKDMunyQME6DU4
yxn+n6DH5J3PwIIsrixG11nRYEq4CkNNwgFULEiWE/I3/QWeJAG6ZGI2skBcDhGX
sqZJ3piKDTb9DxTC1bTm0aKTfXZ3pIASe0xVXwddjqSspX4xJnA37Q8v4dzYKxKo
7gDSDXtkiQKBgQD6EuGqN+M5EoToJFhwXZPfGP4fXra8qXmkxcSSXnkdTnkPB9rU
qzZ0TUxe1sLzicFnEQrkhwa48oewADjZs9KL7PfeMsKPFGwPrbdcVHKfWVHS8xgZ
F9kWIJCDzyZwk1xORVBf+HlXqsyZL6nsyjprHUetp/SfrrSRtW10DIMs7QKBgQDg
qcA4XK/75sePwdae2ws9P2KemxKwYOF1yEBCtcSd3DxTdgGBVAH8QuN3vg5umEQ3
bHNKg1NUqdcOkrF5DEDK8z504NCWwNM7Mig/zC+Vk2slW3B+h91f05eCw9odCEHR
a5VsC/5XfBo4+HUw4OCudqoXqRZhsix6Z5ox8ZyBEQKBgExURuLGon1pUH2w7qXz
QH9AnOYscWyLhruZTab/O3pwrFaVDINI9Yjaq5pH36GYnEOtgjEdXshwEmyCBq5X
4WCAdHvUdLUOhUUCPleYyxdm3vz9goZ6NnW+HqWx8gGsCwWn7kUhsQmnDOVcZY/A
VG1HtzEeRYJ7rEuSmjZdZTKX
-----END PRIVATE KEY-----`;

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
    const testEnvironment = {
      ...environment,
      GITHUB_CLIENT_ID: "Iv1.github-app-client",
      GITHUB_CLIENT_SECRET: "github-app-secret",
      GITHUB_APP_ID: "4693646",
      GITHUB_APP_PRIVATE_KEY: testPrivateKey,
      GITHUB_APP_SLUG: "harikos-ai-project-truth",
    };
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
        state: createInstallationState(identity.id, testEnvironment),
      },
      fetcher,
      async () => ({
        id: 123,
        account: { id: 42, login: "github-builder", type: "User" },
        repository_selection: "all",
        suspended_at: null,
      }),
      testEnvironment,
    );
    expect(installation.id).toBe(123);
  });
});
