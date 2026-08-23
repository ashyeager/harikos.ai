import { createRequire } from "node:module";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const requireFromRoot = createRequire(join(process.cwd(), "package.json"));

describe("flagship Project Truth transition", () => {
  it("supersedes Clerk, verifies Supabase, surfaces stale docs, and uses current context", () => {
    const { composeContextPack, createFlagshipDemoSnapshot } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const snapshot = createFlagshipDemoSnapshot();
    const supabase = snapshot.truths.find(
      (claim: { value: string }) => claim.value === "Supabase Auth",
    );
    const clerk = snapshot.truths.find(
      (claim: { value: string }) => claim.value === "Clerk",
    );

    expect(supabase?.status).toBe("verified");
    expect(clerk?.status).toBe("superseded");
    expect(snapshot.contradictions).toHaveLength(1);
    expect(snapshot.contradictions[0]?.reason).toContain("README.md");

    const context = composeContextPack(
      snapshot,
      "Modify authentication middleware",
      () => new Date("2026-08-23T10:00:00.000Z"),
    );
    expect(context.text).toContain("Supabase Auth");
    expect(context.text).not.toContain("Clerk (SUPERSEDED");
    expect(context.constraints).toContain(
      "Keep service-role credentials on the server.",
    );
  });

  it("marks previously active truth stale when a full scan no longer observes it", () => {
    const { createFlagshipDemoSnapshot, resolveTruth } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const snapshot = createFlagshipDemoSnapshot();
    const next = resolveTruth(
      snapshot.truths,
      [],
      "2026-08-24T09:00:00.000Z",
      "removed-auth",
    );
    expect(
      next.truths.filter((claim: { status: string }) => claim.status === "verified"),
    ).toHaveLength(0);
    expect(next.truths.every((claim: { status: string }) => ["stale", "superseded"].includes(claim.status))).toBe(true);
  });
});
