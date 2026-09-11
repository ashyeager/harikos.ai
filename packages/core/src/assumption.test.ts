import { describe, expect, it } from "vitest";

import type { ProjectTruthClaim } from "./domain.js";
import { checkProjectAssumption } from "./assumption.js";

function claim(value: string, status: ProjectTruthClaim["status"], id: string): ProjectTruthClaim {
  return {
    id,
    category: "Authentication",
    subject: "authentication",
    predicate: "provider",
    value,
    scope: "application",
    epistemicType: "derived",
    claimKind: "implementation",
    confidence: 0.95,
    status,
    validFrom: "2026-09-11T00:00:00.000Z",
    validTo: status === "superseded" ? "2026-09-11T01:00:00.000Z" : null,
    firstSeenAt: "2026-09-11T00:00:00.000Z",
    lastVerifiedAt: "2026-09-11T00:00:00.000Z",
    supersedesClaimId: null,
    evidence: [],
  };
}

describe("project assumption checks", () => {
  const claims = [claim("Clerk", "superseded", "old"), claim("Supabase Auth", "verified", "current")];

  it("supports only current evidence", () => {
    expect(checkProjectAssumption(claims, "Authentication uses Supabase")).toMatchObject({
      status: "SUPPORTED",
      matches: [{ id: "current" }],
    });
  });

  it("contradicts a historical value with the current claim", () => {
    expect(checkProjectAssumption(claims, "Authentication uses Clerk")).toMatchObject({
      status: "CONTRADICTED",
      matches: [{ id: "current" }],
    });
  });

  it("does not guess from a subject without a known value", () => {
    expect(checkProjectAssumption(claims, "Authentication is secure")).toEqual({ status: "UNVERIFIED", matches: [] });
  });
});
