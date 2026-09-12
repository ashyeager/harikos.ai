import { describe, expect, it } from "vitest";
import { safeAuthNext } from "./auth-redirect";

describe("authentication redirect destination", () => {
  it("preserves internal paths and query parameters", () => {
    expect(safeAuthNext("/app/projects?view=recent")).toBe("/app/projects?view=recent");
    expect(safeAuthNext("/pricing?plan=pro")).toBe("/pricing?plan=pro");
  });

  it.each([null, "https://evil.example", "//evil.example", "/\\evil.example", "/\t/evil.example"])(
    "rejects external or browser-normalized destinations: %s", (value) => {
      const path = safeAuthNext(value);
      expect(path).toBe("/app/projects");
      expect(new URL(path, "https://harikos-ai.vercel.app").origin).toBe("https://harikos-ai.vercel.app");
    },
  );
});
