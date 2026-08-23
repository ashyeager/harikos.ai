import { createHash } from "node:crypto";
import {
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

import { z } from "zod";

import {
  changedFileSchema,
  repositoryCommitSchema,
  repositoryEntrySchema,
  repositoryFileSchema,
  repositoryMetadataSchema,
  type ChangedFile,
  type RepositoryCommit,
  type RepositoryEntry,
  type RepositoryFile,
  type RepositoryMetadata,
} from "./domain.js";
import { findProjectRoot } from "./project-root.js";

const MAX_FILE_BYTES = 512_000;

const deniedSegments = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  ".harikos",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "vendor",
  "tmp",
  "temp",
]);

const deniedFilePatterns = [
  /^\.env(?:\..+)?$/iu,
  /(?:^|[-_.])(secret|secrets|credential|credentials|token|tokens)(?:[-_.]|$)/iu,
  /\.(?:pem|key|p12|pfx|jks|keystore)$/iu,
  /^id_(?:rsa|dsa|ecdsa|ed25519)$/iu,
];

export function normalizeRepositoryPath(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\.\//u, "");
}

export function isSafeRepositoryPath(path: string): boolean {
  const normalized = normalizeRepositoryPath(path);
  if (!normalized || normalized.startsWith("/") || normalized.includes("../")) {
    return false;
  }

  const segments = normalized.split("/");
  if (segments.some((segment) => deniedSegments.has(segment.toLowerCase()))) {
    return false;
  }

  const fileName = segments.at(-1) ?? "";
  return !deniedFilePatterns.some((pattern) => pattern.test(fileName));
}

export interface RepositorySource {
  getMetadata(): Promise<RepositoryMetadata>;
  getTree(ref?: string): Promise<RepositoryEntry[]>;
  getFile(path: string, ref?: string): Promise<RepositoryFile>;
  getFiles(paths: string[], ref?: string): Promise<RepositoryFile[]>;
  getChangedFiles(base: string, head: string): Promise<ChangedFile[]>;
  getCommit(ref?: string): Promise<RepositoryCommit>;
}

function hashContent(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function runGit(root: string, args: string[]): string {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.error || result.status !== 0) {
    const detail = result.stderr.trim() || result.error?.message || "unknown error";
    throw new Error(`Git command failed: ${detail}`);
  }

  return result.stdout.trim();
}

function toIsoTimestamp(value: string): string {
  return new Date(value).toISOString();
}

export class LocalRepositorySource implements RepositorySource {
  readonly root: string;

  constructor(startPath: string) {
    this.root = findProjectRoot(startPath);
  }

  async getMetadata(): Promise<RepositoryMetadata> {
    const headSha = runGit(this.root, ["rev-parse", "HEAD"]);
    const defaultBranch =
      runGit(this.root, ["branch", "--show-current"]) || "HEAD";
    const remote = spawnSync(
      "git",
      ["-C", this.root, "remote", "get-url", "origin"],
      { encoding: "utf8", windowsHide: true },
    );
    const remoteUrl = remote.status === 0 ? remote.stdout.trim() : "";
    const githubMatch = remoteUrl.match(
      /github\.com[/:](?<owner>[^/]+)\/(?<name>[^/]+?)(?:\.git)?$/iu,
    );
    const name = this.root.split(/[\\/]/u).at(-1) ?? "repository";

    return repositoryMetadataSchema.parse({
      id: `local:${hashContent(this.root).slice(7, 23)}`,
      name,
      owner: githubMatch?.groups?.owner ?? null,
      defaultBranch,
      headSha,
      visibility: "local",
      webUrl: githubMatch
        ? `https://github.com/${githubMatch.groups?.owner}/${githubMatch.groups?.name}`
        : null,
      sourceType: "local",
    });
  }

  async getTree(): Promise<RepositoryEntry[]> {
    const output = runGit(this.root, [
      "ls-files",
      "--cached",
      "--others",
      "--exclude-standard",
      "-z",
    ]);

    if (!output) {
      return [];
    }

    return output
      .split("\0")
      .map(normalizeRepositoryPath)
      .filter(isSafeRepositoryPath)
      .map((path) => {
        const absolutePath = this.resolveFile(path);
        const stats = statSync(absolutePath);
        return repositoryEntrySchema.parse({
          path,
          type: stats.isDirectory() ? "directory" : "file",
          size: stats.isFile() ? stats.size : null,
          sha: null,
        });
      })
      .filter((entry) => entry.type === "file" && (entry.size ?? 0) <= MAX_FILE_BYTES);
  }

  async getFile(path: string, ref = "HEAD"): Promise<RepositoryFile> {
    const normalized = normalizeRepositoryPath(path);
    if (!isSafeRepositoryPath(normalized)) {
      throw new Error(`Repository path '${path}' is denied by the scanner policy.`);
    }
    const absolutePath = this.resolveFile(normalized);
    const stats = statSync(absolutePath);
    if (!stats.isFile() || stats.size > MAX_FILE_BYTES) {
      throw new Error(`Repository file '${path}' is not a readable bounded text file.`);
    }
    const buffer = readFileSync(absolutePath);
    if (buffer.includes(0)) {
      throw new Error(`Repository file '${path}' appears to be binary.`);
    }
    const content = buffer.toString("utf8");
    return repositoryFileSchema.parse({
      path: normalized,
      content,
      contentHash: hashContent(content),
      size: buffer.byteLength,
      ref,
    });
  }

  async getFiles(paths: string[], ref?: string): Promise<RepositoryFile[]> {
    const results = await Promise.allSettled(
      paths.map((path) => this.getFile(path, ref)),
    );
    return results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
  }

  async getChangedFiles(base: string, head: string): Promise<ChangedFile[]> {
    const output = runGit(this.root, ["diff", "--name-status", base, head]);
    if (!output) {
      return [];
    }
    return output.split(/\r?\n/u).flatMap((line) => {
      const [rawStatus, firstPath, secondPath] = line.split("\t");
      const statusCode = rawStatus?.at(0);
      const path = normalizeRepositoryPath(secondPath ?? firstPath ?? "");
      if (!path || !isSafeRepositoryPath(path)) {
        return [];
      }
      const status =
        statusCode === "A"
          ? "added"
          : statusCode === "D"
            ? "deleted"
            : statusCode === "R"
              ? "renamed"
              : "modified";
      return [
        changedFileSchema.parse({
          path,
          status,
          previousPath:
            status === "renamed" && firstPath
              ? normalizeRepositoryPath(firstPath)
              : null,
        }),
      ];
    });
  }

  async getCommit(ref = "HEAD"): Promise<RepositoryCommit> {
    const output = runGit(this.root, [
      "show",
      "-s",
      "--format=%H%x00%s%x00%an%x00%aI",
      ref,
    ]);
    const [sha, message, author, committedAt] = output.split("\0");
    return repositoryCommitSchema.parse({
      sha,
      message: message ?? "",
      author: author ?? "unknown",
      committedAt: toIsoTimestamp(committedAt ?? new Date().toISOString()),
    });
  }

  private resolveFile(path: string): string {
    const absolutePath = resolve(this.root, path);
    const relativePath = relative(this.root, absolutePath);
    if (
      !relativePath ||
      relativePath.startsWith(`..${sep}`) ||
      relativePath === ".." ||
      isAbsolute(relativePath)
    ) {
      throw new Error(`Repository path '${path}' escapes the registered root.`);
    }
    const realPath = realpathSync.native(absolutePath);
    const realRelative = relative(this.root, realPath);
    if (realRelative.startsWith(`..${sep}`) || realRelative === "..") {
      throw new Error(`Repository path '${path}' resolves outside the registered root.`);
    }
    return realPath;
  }
}

const githubRepositorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  default_branch: z.string(),
  html_url: z.string().url(),
  owner: z.object({ login: z.string() }),
});

const githubTreeSchema = z.object({
  truncated: z.boolean().default(false),
  tree: z.array(
    z.object({
      path: z.string(),
      type: z.enum(["blob", "tree"]),
      size: z.number().int().nonnegative().optional(),
      sha: z.string(),
    }),
  ),
});

const githubContentSchema = z.object({
  path: z.string(),
  sha: z.string(),
  size: z.number().int().nonnegative(),
  encoding: z.literal("base64"),
  content: z.string(),
});

const githubCompareSchema = z.object({
  files: z
    .array(
      z.object({
        filename: z.string(),
        previous_filename: z.string().optional(),
        status: z.enum(["added", "modified", "removed", "renamed", "copied", "changed", "unchanged"]),
      }),
    )
    .default([]),
});

const githubCommitSchema = z.object({
  sha: z.string(),
  commit: z.object({
    message: z.string(),
    author: z.object({
      name: z.string(),
      date: z.string(),
    }),
  }),
});

export interface GitHubRepositorySourceOptions {
  owner: string;
  repository: string;
  tokenProvider: () => Promise<string>;
  fetcher?: typeof fetch;
  apiBaseUrl?: string;
}

export class GitHubRepositorySource implements RepositorySource {
  private readonly fetcher: typeof fetch;
  private readonly apiBaseUrl: string;

  constructor(private readonly options: GitHubRepositorySourceOptions) {
    this.fetcher = options.fetcher ?? fetch;
    this.apiBaseUrl = options.apiBaseUrl ?? "https://api.github.com";
  }

  async getMetadata(): Promise<RepositoryMetadata> {
    const repository = githubRepositorySchema.parse(
      await this.request(`/repos/${this.slug}`),
    );
    const commit = await this.getCommit(repository.default_branch);
    return repositoryMetadataSchema.parse({
      id: `github:${repository.id}`,
      name: repository.name,
      owner: repository.owner.login,
      defaultBranch: repository.default_branch,
      headSha: commit.sha,
      visibility: repository.private ? "private" : "public",
      webUrl: repository.html_url,
      sourceType: "github",
    });
  }

  async getTree(ref = "HEAD"): Promise<RepositoryEntry[]> {
    const response = githubTreeSchema.parse(
      await this.request(`/repos/${this.slug}/git/trees/${encodeURIComponent(ref)}?recursive=1`),
    );
    if (response.truncated) {
      throw new Error("GitHub returned a truncated repository tree; HARIKOS will not treat it as complete evidence.");
    }
    return response.tree
      .map((entry) =>
        repositoryEntrySchema.parse({
          path: normalizeRepositoryPath(entry.path),
          type: entry.type === "blob" ? "file" : "directory",
          size: entry.size ?? null,
          sha: entry.sha,
        }),
      )
      .filter(
        (entry) =>
          entry.type === "file" &&
          isSafeRepositoryPath(entry.path) &&
          (entry.size ?? 0) <= MAX_FILE_BYTES,
      );
  }

  async getFile(path: string, ref = "HEAD"): Promise<RepositoryFile> {
    const normalized = normalizeRepositoryPath(path);
    if (!isSafeRepositoryPath(normalized)) {
      throw new Error(`Repository path '${path}' is denied by the scanner policy.`);
    }
    const response = githubContentSchema.parse(
      await this.request(
        `/repos/${this.slug}/contents/${normalized.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref)}`,
      ),
    );
    if (response.size > MAX_FILE_BYTES) {
      throw new Error(`Repository file '${path}' exceeds the scan limit.`);
    }
    const buffer = Buffer.from(response.content.replace(/\s/gu, ""), "base64");
    if (buffer.includes(0)) {
      throw new Error(`Repository file '${path}' appears to be binary.`);
    }
    const content = buffer.toString("utf8");
    return repositoryFileSchema.parse({
      path: normalized,
      content,
      contentHash: `sha256:${createHash("sha256").update(content).digest("hex")}`,
      size: buffer.byteLength,
      ref,
    });
  }

  async getFiles(paths: string[], ref?: string): Promise<RepositoryFile[]> {
    const files: RepositoryFile[] = [];
    for (let index = 0; index < paths.length; index += 8) {
      const results = await Promise.allSettled(
        paths.slice(index, index + 8).map((path) => this.getFile(path, ref)),
      );
      files.push(
        ...results.flatMap((result) =>
          result.status === "fulfilled" ? [result.value] : [],
        ),
      );
    }
    return files;
  }

  async getChangedFiles(base: string, head: string): Promise<ChangedFile[]> {
    const response = githubCompareSchema.parse(
      await this.request(`/repos/${this.slug}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`),
    );
    return response.files.flatMap((file) => {
      if (!isSafeRepositoryPath(file.filename)) {
        return [];
      }
      const status =
        file.status === "removed"
          ? "deleted"
          : file.status === "renamed"
            ? "renamed"
            : file.status === "added"
              ? "added"
              : "modified";
      return [
        changedFileSchema.parse({
          path: file.filename,
          status,
          previousPath: file.previous_filename ?? null,
        }),
      ];
    });
  }

  async getCommit(ref = "HEAD"): Promise<RepositoryCommit> {
    const response = githubCommitSchema.parse(
      await this.request(`/repos/${this.slug}/commits/${encodeURIComponent(ref)}`),
    );
    return repositoryCommitSchema.parse({
      sha: response.sha,
      message: response.commit.message.split("\n")[0] ?? "",
      author: response.commit.author.name,
      committedAt: new Date(response.commit.author.date).toISOString(),
    });
  }

  private get slug(): string {
    return `${encodeURIComponent(this.options.owner)}/${encodeURIComponent(this.options.repository)}`;
  }

  private async request(path: string): Promise<unknown> {
    const token = await this.options.tokenProvider();
    const response = await this.fetcher(`${this.apiBaseUrl}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!response.ok) {
      throw new Error(`GitHub repository request failed with status ${response.status}.`);
    }
    return response.json() as Promise<unknown>;
  }
}
