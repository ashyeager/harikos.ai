import { describe, expect, it } from "vitest";

import {
  createInstallationState,
  verifyInstallationState,
} from "./github-installation";

const environment = {
  HARIKOS_SESSION_SECRET: "a-secure-test-secret-with-more-than-thirty-two-characters",
  NODE_ENV: "test",
} as NodeJS.ProcessEnv;

describe("GitHub installation state", () => {
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
});
