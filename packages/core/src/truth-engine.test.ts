import { createRequire } from "node:module";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const requireFromRoot = createRequire(join(process.cwd(), "package.json"));

describe("flagship Project Truth transition", () => {
  it("keeps competing evidence visible when the current value remains the leader", () => {
    const { resolveTruth } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const at = "2026-09-11T00:00:00.000Z";
    const evidence = (path: string, authority: number) => ({
      sourceType: "file", path, contentHash: `sha256:${path}`, commitSha: "abc", lineStart: 1,
      lineEnd: 1, excerpt: null, authority, observedAt: at,
    });
    const candidate = (value: string, confidence: number, path: string, authority: number) => ({
      category: "Authentication", subject: "authentication", predicate: "provider", value,
      scope: "application", epistemicType: "derived", claimKind: "implementation", confidence,
      evidence: [evidence(path, authority)],
    });
    const initial = resolveTruth([], [candidate("Supabase Auth", 0.95, "auth.ts", 0.95)], at, "abc");
    const next = resolveTruth(initial.truths, [
      candidate("Supabase Auth", 0.8, "auth.ts", 0.9),
      candidate("Clerk", 0.6, "legacy.ts", 0.6),
    ], "2026-09-11T01:00:00.000Z", "def");
    expect(next.truths.find((claim: { value: string }) => claim.value === "Supabase Auth")?.confidence).toBe(0.8);
    expect(next.truths.find((claim: { value: string }) => claim.value === "Clerk")?.status).toBe("contradicted");
    expect(next.contradictions).toHaveLength(1);
  });

  it("preserves history when a previously superseded value becomes current again", () => {
    const { resolveTruth } = requireFromRoot(join(process.cwd(), "packages", "core", "dist", "index.js"));
    const candidate = (value: string, at: string) => ({
      category: "Authentication", subject: "authentication", predicate: "provider", value,
      scope: "application", epistemicType: "derived", claimKind: "implementation", confidence: 0.95,
      evidence: [{ sourceType: "file", path: "auth.ts", contentHash: `sha256:${value}-${at}`,
        commitSha: at, lineStart: 1, lineEnd: 1, excerpt: null, authority: 0.95, observedAt: at }],
    });
    const firstAt = "2026-09-11T01:00:00.000Z";
    const secondAt = "2026-09-11T02:00:00.000Z";
    const thirdAt = "2026-09-11T03:00:00.000Z";
    const first = resolveTruth([], [candidate("A", firstAt)], firstAt, "a");
    const second = resolveTruth(first.truths, [candidate("B", secondAt)], secondAt, "b");
    const third = resolveTruth(second.truths, [candidate("A", thirdAt)], thirdAt, "c");
    expect(third.truths.filter((claim: { value: string }) => claim.value === "A")).toHaveLength(2);
    expect(third.truths.filter((claim: { status: string }) => claim.status === "verified")).toHaveLength(1);
  });
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
