import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

interface CliOutput {
  writeOut(message: string): void;
  writeErr(message: string): void;
}

const temporaryDirectories: string[] = [];
const requireFromRoot = createRequire(join(process.cwd(), "package.json"));

function createGitRepository(): string {
  const parent = mkdtempSync(join(tmpdir(), "harikos-cli-"));
  temporaryDirectories.push(parent);
  const repository = join(parent, "cli-project");
  mkdirSync(repository, { recursive: true });
  const result = spawnSync("git", ["init", "--quiet", repository], {
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error(`Could not create fixture Git repository: ${result.stderr}`);
  }

  return repository;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("harikos init CLI", () => {
  it("initializes a repository and prints honest MCP guidance", async () => {
    const { runCli } = requireFromRoot(
      join(process.cwd(), "packages", "cli", "dist", "index.js"),
    );
    const repository = createGitRepository();
    let stdout = "";
    let stderr = "";
    const output: CliOutput = {
      writeOut: (message) => {
        stdout += message;
      },
      writeErr: (message) => {
        stderr += message;
      },
    };

    await runCli(["init", "--cwd", repository], output);
    await runCli(["init", "--cwd", repository], output);

    expect(stderr).toBe("");
    expect(stdout).toContain("HARIKOS initialized.");
    expect(stdout).toContain("HARIKOS already initialized.");
    expect(stdout).toContain("MCP setup guidance:");
    expect(stdout).toContain(
      "The MCP server is intentionally deferred until its MVP phase.",
    );
    expect(existsSync(join(repository, ".harikos", "config.json"))).toBe(
      true,
    );
    expect(existsSync(join(repository, ".harikos", "project.db"))).toBe(
      true,
    );
  });
});
