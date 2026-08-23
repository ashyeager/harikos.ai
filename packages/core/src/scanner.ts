import {
  scannedSourceSchema,
  type RepositoryEntry,
  type ScannedSource,
} from "./domain.js";
import type { RepositorySource } from "./repository-source.js";

const preferredExactPaths = new Set([
  "package.json",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  "tsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "vite.config.js",
  "vite.config.ts",
  "drizzle.config.ts",
  "drizzle.config.js",
  "prisma/schema.prisma",
  "vercel.json",
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "middleware.ts",
  "middleware.js",
  "proxy.ts",
  "proxy.js",
]);

const highSignalPattern = /(?:^|\/)(?:app|src|lib|server|api|db|database|auth|authentication|supabase|clerk|firebase|stripe|tests?|\.github)(?:\/|$)|(?:schema|config|middleware|proxy|route|auth|supabase|clerk|firebase|stripe|vitest|playwright|drizzle|prisma|vercel)/iu;

const nonProductionPattern =
  /(?:^|\/)(?:__tests__|__mocks__|tests?|fixtures?|mocks?|snapshots?)(?:\/|$)|\.(?:test|spec|stories)\.[cm]?[jt]sx?$/iu;

function isProductionEvidence(entry: RepositoryEntry): boolean {
  return entry.type === "file" && !nonProductionPattern.test(entry.path);
}

function priority(entry: RepositoryEntry): number {
  if (preferredExactPaths.has(entry.path)) {
    return 100;
  }
  if (/package\.json$/u.test(entry.path)) {
    return 95;
  }
  if (/^(?:docs\/)?(?:architecture|mvp|readme|agents|claude)/iu.test(entry.path)) {
    return 80;
  }
  if (highSignalPattern.test(entry.path)) {
    return 70;
  }
  if (/\.(?:ts|tsx|js|jsx|json|md|yml|yaml|toml)$/iu.test(entry.path)) {
    return 20;
  }
  return 0;
}

function sourceKind(path: string): ScannedSource["kind"] {
  if (/package\.json$|lock\.yaml$|package-lock\.json$|yarn\.lock$|bun\.lock/iu.test(path)) {
    return "manifest";
  }
  if (/\.(?:md|mdx)$/iu.test(path)) {
    return "documentation";
  }
  if (/(?:config|tsconfig|vercel\.json|schema\.prisma|middleware|proxy)/iu.test(path)) {
    return "config";
  }
  return "file";
}

export interface ScanRepositoryOptions {
  maxFiles?: number;
  clock?: () => Date;
}

export async function scanRepository(
  source: RepositorySource,
  options: ScanRepositoryOptions = {},
): Promise<ScannedSource[]> {
  const metadata = await source.getMetadata();
  const observedAt = (options.clock ?? (() => new Date()))().toISOString();
  const tree = await source.getTree(metadata.headSha);
  const selectedPaths = tree
    .map((entry) => ({ entry, score: priority(entry) }))
    .filter((item) => item.score > 0 && isProductionEvidence(item.entry))
    .sort((left, right) => right.score - left.score || left.entry.path.localeCompare(right.entry.path))
    .slice(0, options.maxFiles ?? 80)
    .map((item) => item.entry.path);
  const files = await source.getFiles(selectedPaths, metadata.headSha);

  return files.map((file) =>
    scannedSourceSchema.parse({
      path: file.path,
      kind: sourceKind(file.path),
      content: file.content,
      contentHash: file.contentHash,
      observedAt,
      commitSha: metadata.headSha,
    }),
  );
}
