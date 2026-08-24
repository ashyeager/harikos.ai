import { describe, expect, it } from "vitest";

import { createFlagshipDemoSnapshot } from "./demo.js";
import { composeContextPack } from "./context-pack.js";

describe("Context memory retrieval", () => {
  it("includes relevant active memory without treating it as Truth", () => {
    const snapshot = createFlagshipDemoSnapshot();
    const pack = composeContextPack(
      snapshot,
      "Modify subscription flow",
      () => new Date("2026-08-24T00:00:00.000Z"),
      [
        { type: "constraint", content: "Privileged billing logic stays server-side.", status: "active" },
        { type: "failed_attempt", content: "Browser-side subscription creation failed due to privileged credentials.", status: "active" },
        { type: "note", content: "This archived note should not be included.", status: "archived" },
      ],
    );

    expect(pack.text).toContain("MEMORY");
    expect(pack.text).toContain("Privileged billing logic stays server-side.");
    expect(pack.text).toContain("Browser-side subscription creation failed");
    expect(pack.text).not.toContain("This archived note should not be included.");
    expect(pack.truths.every((claim) => claim.status !== "superseded")).toBe(true);
  });
});
