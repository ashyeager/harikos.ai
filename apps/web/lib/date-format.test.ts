import { describe, expect, it } from "vitest";

import { formatUtcDate, formatUtcDateTime } from "./date-format";

describe("deterministic date formatting", () => {
  it("renders server and browser dates in an explicit timezone", () => {
    const instant = "2026-09-10T20:43:00.000Z";

    expect(formatUtcDateTime(instant)).toBe("Sep 10, 8:43 PM UTC");
    expect(formatUtcDate(instant)).toBe("Sep 10, 2026");
  });
});
