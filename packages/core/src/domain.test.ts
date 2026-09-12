import { describe, expect, it } from "vitest";

import { createFlagshipDemoSnapshot } from "./demo.js";
import { projectSnapshotSchema } from "./domain.js";

describe("project snapshot refresh state", () => {
  it("exposes a persisted refresh-required timestamp without changing Truth data", () => {
    const snapshot = projectSnapshotSchema.parse({
      ...createFlagshipDemoSnapshot(),
      refreshRequiredAt: "2026-09-11T12:00:00.000Z",
    });

    expect(snapshot.refreshRequiredAt).toBe("2026-09-11T12:00:00.000Z");
    expect(snapshot.truths).toHaveLength(createFlagshipDemoSnapshot().truths.length);
  });
});
