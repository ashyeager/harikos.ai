import { describe, expect, it } from "vitest";

import { identityFromClaims } from "./auth";

describe("Supabase identity boundary", () => {
  it("derives a stable GitHub identity from verified Supabase claims", () => {
    expect(
      identityFromClaims({
        sub: "8a8af071-f31f-4f44-89fd-a5db523925b7",
        email: "builder@example.com",
        user_metadata: {
          provider_id: "42",
          user_name: "builder",
          full_name: "Project Builder",
          avatar_url: "https://avatars.example.com/builder.png",
        },
      }),
    ).toEqual({
      id: "8a8af071-f31f-4f44-89fd-a5db523925b7",
      githubUserId: "42",
      login: "builder",
      email: "builder@example.com",
      displayName: "Project Builder",
      avatarUrl: "https://avatars.example.com/builder.png",
    });
  });

  it("rejects claims without GitHub provider identity", () => {
    expect(identityFromClaims({ sub: "user", user_metadata: {} })).toBeUndefined();
  });
});
