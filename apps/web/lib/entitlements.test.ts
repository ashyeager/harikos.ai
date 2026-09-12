import { describe, expect, it } from "vitest";

import { PLAN_CONFIG, ProductQuotaError, assertQuotaLimit, assertScanQuota, calendarMonthStart, entitlementFromSubscription, freeEntitlement, isDeveloperUser, normalizeSubscriptionStatus, pushHandlingFor } from "./entitlements";

describe("HARIKOS entitlement policy", () => {
  it("keeps plan limits centralized", () => {
    expect(PLAN_CONFIG.free).toMatchObject({ monthlyUsd: 0, projectLimit: 1, agentLimit: 1, scanLimit: 1, contextPackLimit: 3, memoryWriteLimit: 10, continuousReverification: false });
    expect(PLAN_CONFIG.core).toMatchObject({ monthlyUsd: 9, projectLimit: 1, agentLimit: 1, scanLimit: 100, contextPackLimit: 250, memoryWriteLimit: 1_000, continuousReverification: true });
    expect(PLAN_CONFIG.pro).toMatchObject({ monthlyUsd: 29, projectLimit: 5, agentLimit: 5, scanLimit: 500, contextPackLimit: 1_000, memoryWriteLimit: 5_000, continuousReverification: true });
    expect(PLAN_CONFIG.scale).toMatchObject({ monthlyUsd: 79, projectLimit: 20, agentLimit: 20, scanLimit: 2_500, contextPackLimit: 5_000, memoryWriteLimit: 25_000, continuousReverification: true });
    expect(PLAN_CONFIG.enterprise).toMatchObject({ projectLimit: 1000, agentLimit: 1000, scanLimit: 10_000, contextPackLimit: 20_000, memoryWriteLimit: 100_000, continuousReverification: true });
  });

  it("resolves accounts without a current paid subscription to Free while retaining paid and developer access", () => {
    expect(entitlementFromSubscription(undefined)).toMatchObject({ plan: "free", status: "free", hasAccess: true });
    expect(entitlementFromSubscription({ plan: "pro", status: "canceled" })).toMatchObject({ plan: "free", status: "free" });
    expect(entitlementFromSubscription({ plan: "pro", status: "active", currentPeriodEnd: new Date("2026-10-01T00:00:00.000Z") }, new Date("2026-09-11T00:00:00.000Z"))).toMatchObject({ plan: "pro", status: "active", hasAccess: true });
    expect(entitlementFromSubscription({ role: "developer" })).toMatchObject({ role: "developer", plan: "enterprise", continuousReverification: true });
  });

  it("allows the initial Free scan and one completed manual rescan each calendar month", () => {
    const free = freeEntitlement();
    expect(() => assertScanQuota(free, 0, 0)).not.toThrow();
    expect(() => assertScanQuota(free, 1, 0)).not.toThrow();
    expect(() => assertScanQuota(free, 2, 1)).toThrow(ProductQuotaError);
    expect(() => assertScanQuota(free, 2, 0)).not.toThrow();
  });

  it("enforces Free monthly context and memory write limits", () => {
    const free = freeEntitlement();
    expect(() => assertQuotaLimit(2, free.contextPackLimit, "context")).not.toThrow();
    expect(() => assertQuotaLimit(3, free.contextPackLimit, "context")).toThrow(ProductQuotaError);
    expect(() => assertQuotaLimit(9, free.memoryWriteLimit, "memory")).not.toThrow();
    expect(() => assertQuotaLimit(10, free.memoryWriteLimit, "memory")).toThrow(ProductQuotaError);
  });

  it("keeps Free project and agent creation at one each", () => {
    const free = freeEntitlement();
    expect(() => assertQuotaLimit(0, free.projectLimit, "project")).not.toThrow();
    expect(() => assertQuotaLimit(1, free.projectLimit, "project")).toThrow(ProductQuotaError);
    expect(() => assertQuotaLimit(0, free.agentLimit, "agent")).not.toThrow();
    expect(() => assertQuotaLimit(1, free.agentLimit, "agent")).toThrow(ProductQuotaError);
  });

  it("marks Free push events for refresh instead of continuously rescanning", () => {
    expect(pushHandlingFor(freeEntitlement())).toBe("mark_refresh_required");
    expect(pushHandlingFor(entitlementFromSubscription({ plan: "pro", status: "active", currentPeriodEnd: new Date("2026-10-01T00:00:00.000Z") }, new Date("2026-09-11T00:00:00.000Z")))).toBe("scan");
    expect(pushHandlingFor(entitlementFromSubscription({ role: "developer" }))).toBe("scan");
  });

  it("uses a UTC calendar-month window for reusable plan usage counts", () => {
    expect(calendarMonthStart(new Date("2026-09-30T23:59:59.000Z")).toISOString()).toBe("2026-09-01T00:00:00.000Z");
    expect(calendarMonthStart(new Date("2026-10-01T00:00:00.000Z")).toISOString()).toBe("2026-10-01T00:00:00.000Z");
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
