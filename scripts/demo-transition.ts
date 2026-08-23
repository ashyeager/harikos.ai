import { strict as assert } from "node:assert";
import { cpSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  analyzeRepository,
  composeContextPack,
  LocalRepositorySource,
} from "@harikos/core";

function git(root: string, ...args: string[]): void {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${args.join(" ")} failed`);
  }
}

const temporaryRoot = mkdtempSync(join(tmpdir(), "harikos-transition-"));
const repositoryRoot = join(temporaryRoot, "fixture-app");
const fixtureRoot = join(process.cwd(), "fixtures", "auth-migration");

try {
  mkdirSync(repositoryRoot, { recursive: true });
  git(repositoryRoot, "init", "--quiet");
  git(repositoryRoot, "config", "user.name", "HARIKOS Fixture");
  git(repositoryRoot, "config", "user.email", "fixture@localhost");

  cpSync(join(fixtureRoot, "state-a"), repositoryRoot, { recursive: true });
  git(repositoryRoot, "add", ".");
  git(repositoryRoot, "commit", "--quiet", "-m", "Use Clerk authentication");
  const source = new LocalRepositorySource(repositoryRoot);
  const before = await analyzeRepository(source, [], {
    clock: () => new Date("2026-08-22T09:00:00.000Z"),
  });
  assert.equal(
    before.truths.find((claim) => claim.value === "Clerk")?.status,
    "verified",
  );

  cpSync(join(fixtureRoot, "state-b"), repositoryRoot, { recursive: true });
  git(repositoryRoot, "add", "-A");
  git(repositoryRoot, "commit", "--quiet", "-m", "Migrate auth to Supabase");
  const after = await analyzeRepository(source, before.truths, {
    clock: () => new Date("2026-08-23T09:24:00.000Z"),
  });
  const context = composeContextPack(
    after,
    "Modify authentication middleware",
    () => new Date("2026-08-23T10:00:00.000Z"),
  );

  assert.equal(
    after.truths.find((claim) => claim.value === "Supabase Auth")?.status,
    "verified",
  );
  assert.equal(
    after.truths.find((claim) => claim.value === "Clerk")?.status,
    "superseded",
  );
  assert.equal(after.contradictions.length, 1);
  assert.match(after.contradictions[0]?.reason ?? "", /README\.md/u);
  assert.match(context.text, /Supabase Auth/u);
  assert.doesNotMatch(context.text, /Clerk \(SUPERSEDED/u);

  process.stdout.write("HARIKOS flagship transition verified.\n");
  process.stdout.write("  Clerk: SUPERSEDED\n");
  process.stdout.write("  Supabase Auth: VERIFIED\n");
  process.stdout.write("  Stale README contradiction: OPEN\n");
  process.stdout.write("  Agent context: CURRENT / SUPABASE\n");
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
