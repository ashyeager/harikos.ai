import { createRequire } from "node:module";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const requireFromRoot = createRequire(join(process.cwd(), "package.json"));
const observedAt = "2026-08-23T10:00:00.000Z";

function source(path: string, content: string, kind = "file") {
  return {
    path,
    kind,
    content,
    contentHash: `sha256:${path}`,
    observedAt,
    commitSha: "abc123",
  };
}

describe("deterministic claim extraction", () => {
  it("does not promote an installed but unused ORM to active truth", () => {
    const { extractDeterministicClaims } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const claims = extractDeterministicClaims([
      source(
        "package.json",
        JSON.stringify({ dependencies: { "@prisma/client": "latest", "drizzle-orm": "latest" } }),
        "manifest",
      ),
      source("src/db.ts", 'import { drizzle } from "drizzle-orm";\nexport const db = drizzle(client);'),
    ]);

    expect(claims.some((claim: { value: string }) => claim.value === "Drizzle")).toBe(true);
    expect(claims.some((claim: { value: string }) => claim.value === "Prisma")).toBe(false);
  });

  it("identifies an implemented GitHub OAuth exchange from executable routes", () => {
    const { extractDeterministicClaims } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const claims = extractDeterministicClaims([
      source(
        "app/api/auth/github/start/route.ts",
        'const authorize = new URL("https://github.com/login/oauth/authorize");',
      ),
      source(
        "app/api/auth/github/callback/route.ts",
        'const response = await fetch("https://github.com/login/oauth/access_token");',
      ),
    ]);

    expect(
      claims.find((claim: { subject: string }) => claim.subject === "authentication"),
    ).toMatchObject({ value: "GitHub OAuth", confidence: 0.99 });
  });
});
