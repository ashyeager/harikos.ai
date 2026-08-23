import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];
const fixedTime = "2026-08-22T13:00:00.000Z";
const requireFromRoot = createRequire(join(process.cwd(), "package.json"));

function createTemporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "harikos-init-"));
  temporaryDirectories.push(directory);
  return directory;
}

function createGitRepository(): string {
  const repository = join(createTemporaryDirectory(), "example-project");
  mkdirSync(repository, { recursive: true });
  const result = spawnSync("git", ["init", "--quiet", repository], {
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error(`Could not create fixture Git repository: ${result.stderr}`);
  }

  return realpathSync.native(repository);
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("project initialization", () => {
  it("detects the Git root from a nested path", async () => {
    const { findProjectRoot } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const repository = createGitRepository();
    const nestedPath = join(repository, "src", "nested");
    mkdirSync(nestedPath, { recursive: true });

    expect(findProjectRoot(nestedPath)).toBe(repository);
  });

  it("creates local state and remains idempotent", async () => {
    const {
      HARIKOS_GITIGNORE_ENTRY,
      harikosConfigSchema,
      initializeProject,
    } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const { openHarikosDatabase } = requireFromRoot(
      join(process.cwd(), "packages", "db", "dist", "index.js"),
    );
    const repository = createGitRepository();
    const nestedPath = join(repository, "packages", "feature");
    mkdirSync(nestedPath, { recursive: true });

    const first = initializeProject({
      cwd: nestedPath,
      clock: () => new Date(fixedTime),
    });
    const firstConfigContents = readFileSync(first.configPath, "utf8");
    const second = initializeProject({
      cwd: repository,
      clock: () => new Date("2026-08-22T14:00:00.000Z"),
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(first.projectRoot).toBe(repository);
    expect(second.project.id).toBe(first.project.id);
    expect(existsSync(first.databasePath)).toBe(true);
    expect(readFileSync(second.configPath, "utf8")).toBe(firstConfigContents);

    const configValue: unknown = JSON.parse(firstConfigContents);
    const config = harikosConfigSchema.parse(configValue);
    expect(config).toMatchObject({
      version: 1,
      projectId: first.project.id,
      projectRoot: repository,
      databasePath: ".harikos/project.db",
      createdAt: fixedTime,
    });

    const gitIgnoreEntries = readFileSync(
      join(repository, ".gitignore"),
      "utf8",
    )
      .split(/\r?\n/u)
      .filter((entry) => entry === HARIKOS_GITIGNORE_ENTRY);
    expect(gitIgnoreEntries).toHaveLength(1);

    const store = openHarikosDatabase({ databasePath: first.databasePath });
    try {
      expect(store.projects.list()).toHaveLength(1);
      expect(store.projects.findByPath(repository)).toEqual(first.project);
    } finally {
      store.close();
    }
  });

  it("rejects initialization outside a Git repository", async () => {
    const { initializeProject, ProjectRootError } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const directory = createTemporaryDirectory();

    expect(() => initializeProject({ cwd: directory })).toThrowError(
      ProjectRootError,
    );
    expect(existsSync(join(directory, ".harikos"))).toBe(false);
  });
});
