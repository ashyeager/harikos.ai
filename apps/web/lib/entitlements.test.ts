import { describe, expect, it } from "vitest";

import { PLAN_CONFIG, isDeveloperUser, normalizeSubscriptionStatus } from "./entitlements";

describe("HARIKOS entitlement policy", () => {
  it("keeps plan limits centralized", () => {
    expect(PLAN_CONFIG.core).toMatchObject({ monthlyUsd: 9, projectLimit: 1, agentLimit: 1 });
    expect(PLAN_CONFIG.pro).toMatchObject({ monthlyUsd: 29, projectLimit: 5, agentLimit: 5 });
    expect(PLAN_CONFIG.scale).toMatchObject({ monthlyUsd: 79, projectLimit: 20, agentLimit: 20 });
  });

  it("only honors immutable UUIDs in the server developer allowlist", () => {
    const id = "8a8af071-f31f-4f44-89fd-a5db523925b7";
    expect(isDeveloperUser(id, { HARIKOS_DEVELOPER_USER_IDS: id })).toBe(true);
    expect(isDeveloperUser(id, { HARIKOS_DEVELOPER_USER_IDS: "ash@example.com,ashyeager" })).toBe(false);
  });

  it("maps provider lifecycle states conservatively", () => {
    expect(normalizeSubscriptionStatus("trialing")).toBe("trialing");
    expect(normalizeSubscriptionStatus("active")).toBe("active");
    expect(normalizeSubscriptionStatus("past_due")).toBe("past_due");
    expect(normalizeSubscriptionStatus("canceled")).toBe("canceled");
    expect(normalizeSubscriptionStatus("unknown")).toBe("inactive");
  });
});
