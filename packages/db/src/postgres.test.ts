import { createRequire } from "node:module";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const requireFromRoot = createRequire(join(process.cwd(), "package.json"));

describe("cloud database configuration", () => {
  it("requires a real PostgreSQL URL and stays optional without credentials", () => {
    const { readCloudDatabaseConfig } = requireFromRoot(
      join(process.cwd(), "packages", "db", "dist", "index.js"),
    );
    expect(readCloudDatabaseConfig({})).toBeUndefined();
    expect(
      readCloudDatabaseConfig({ DATABASE_URL: "postgresql://user:pass@localhost:5432/harikos" }),
    ).toMatchObject({ maxConnections: 5 });
    expect(() => readCloudDatabaseConfig({ DATABASE_URL: "sqlite://local" })).toThrow();
  });
});
