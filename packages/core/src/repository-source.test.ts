import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

const requireFromRoot = createRequire(join(process.cwd(), "package.json"));
const temporaryDirectories: string[] = [];

function git(root: string, args: string[]): void {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr);
  }
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("LocalRepositorySource", () => {
  it("keeps scans bounded and excludes secrets", async () => {
    const { LocalRepositorySource } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const root = mkdtempSync(join(tmpdir(), "harikos-source-"));
    temporaryDirectories.push(root);
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(join(root, "package.json"), '{"dependencies":{"next":"latest"}}');
    writeFileSync(join(root, "src", "app.ts"), 'import Link from "next/link";');
    writeFileSync(join(root, "src", "auth.test.ts"), 'import { clerkMiddleware } from "@clerk/nextjs/server";');
    mkdirSync(join(root, "fixtures"), { recursive: true });
    writeFileSync(join(root, "fixtures", "auth.ts"), 'import { clerkMiddleware } from "@clerk/nextjs/server";');
    writeFileSync(join(root, ".env"), "DATABASE_URL=do-not-read");
    git(root, ["init", "--quiet"]);
    git(root, ["config", "user.email", "fixture@example.com"]);
    git(root, ["config", "user.name", "Fixture"]);
    git(root, ["add", "package.json", "src/app.ts", "src/auth.test.ts", "fixtures/auth.ts"]);
    git(root, ["commit", "--quiet", "-m", "fixture"]);

    const source = new LocalRepositorySource(root);
    const tree = await source.getTree();
    expect(tree.map((entry: { path: string }) => entry.path)).toContain("package.json");
    expect(tree.map((entry: { path: string }) => entry.path)).not.toContain(".env");
    const scanned = await requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    ).scanRepository(source);
    expect(scanned.map((entry: { path: string }) => entry.path)).not.toContain("src/auth.test.ts");
    expect(scanned.map((entry: { path: string }) => entry.path)).not.toContain("fixtures/auth.ts");
    await expect(source.getFile("../outside.txt")).rejects.toThrow(/denied|escapes/u);
  });
});
