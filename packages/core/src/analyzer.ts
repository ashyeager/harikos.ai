import {
  candidateClaimSchema,
  type CandidateClaim,
  type CandidateEvidence,
  type ScannedSource,
} from "./domain.js";

interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function manifestDependencies(sources: ScannedSource[]): Record<string, string> {
  const manifests = sources.filter((source) => /(?:^|\/)package\.json$/u.test(source.path));
  const dependencies: Record<string, string> = {};
  for (const source of manifests) {
    try {
      const value = JSON.parse(source.content) as PackageManifest;
      Object.assign(dependencies, value.dependencies ?? {}, value.devDependencies ?? {});
    } catch {
      continue;
    }
  }
  return dependencies;
}

function findLine(source: ScannedSource, pattern: RegExp): { line: number; excerpt: string } | undefined {
  const lines = source.content.split(/\r?\n/u);
  const index = lines.findIndex((line) => pattern.test(line));
  if (index < 0) {
    return undefined;
  }
  return { line: index + 1, excerpt: lines[index]?.trim().slice(0, 580) ?? "" };
}

function evidenceFor(
  source: ScannedSource,
  pattern: RegExp,
  authority: number,
): CandidateEvidence | undefined {
  const match = findLine(source, pattern);
  if (!match) {
    return undefined;
  }
  return {
    sourceType: source.kind,
    path: source.path,
    contentHash: source.contentHash,
    commitSha: source.commitSha,
    lineStart: match.line,
    lineEnd: match.line,
    excerpt: match.excerpt,
    authority,
    observedAt: source.observedAt,
  };
}

function collectEvidence(
  sources: ScannedSource[],
  pattern: RegExp,
  authority: (source: ScannedSource) => number,
  filter: (source: ScannedSource) => boolean = () => true,
): CandidateEvidence[] {
  return sources.flatMap((source) => {
    if (!filter(source)) {
      return [];
    }
    const evidence = evidenceFor(source, pattern, authority(source));
    return evidence ? [evidence] : [];
  });
}

function packageEvidence(
  sources: ScannedSource[],
  dependencyPattern: RegExp,
): CandidateEvidence[] {
  return collectEvidence(
    sources,
    dependencyPattern,
    () => 0.64,
    (source) => /(?:^|\/)package\.json$/u.test(source.path),
  );
}

function moduleImportEvidence(
  sources: ScannedSource[],
  modulePattern: RegExp,
  authority = 0.96,
): CandidateEvidence[] {
  return sources.flatMap((source) => {
    if (!activeSource(source)) return [];
    const lines = source.content.split(/\r?\n/u);
    const index = lines.findIndex((line) => {
      const isModuleLoad = /(?:\bfrom\s+|\bimport\s*\(|\brequire\s*\(|^\s*import\s+)["']/u.test(line);
      return isModuleLoad && modulePattern.test(line);
    });
    if (index < 0) return [];
    return [{
      sourceType: source.kind,
      path: source.path,
      contentHash: source.contentHash,
      commitSha: source.commitSha,
      lineStart: index + 1,
      lineEnd: index + 1,
      excerpt: lines[index]?.trim().slice(0, 580) ?? "",
      authority,
      observedAt: source.observedAt,
    }];
  });
}

function buildCandidate(
  input: Omit<CandidateClaim, "confidence"> & { confidence?: number },
): CandidateClaim {
  const corroboration = Math.min(0.12, Math.max(0, input.evidence.length - 1) * 0.04);
  const strongest = Math.max(...input.evidence.map((item) => item.authority));
  return candidateClaimSchema.parse({
    ...input,
    confidence: input.confidence ?? Math.min(0.99, strongest + corroboration),
  });
}

function activeSource(source: ScannedSource): boolean {
  return source.kind === "file" || source.kind === "config";
}

export function extractDeterministicClaims(sources: ScannedSource[]): CandidateClaim[] {
  const dependencies = manifestDependencies(sources);
  const candidates: CandidateClaim[] = [];

  const add = (candidate: CandidateClaim | undefined): void => {
    if (candidate) {
      candidates.push(candidate);
    }
  };

  const tsEvidence = collectEvidence(
    sources,
    /"(?:typescript|jsx|moduleResolution|compilerOptions)"|typescript/iu,
    (source) => (/(?:^|\/)tsconfig(?:\..+)?\.json$/u.test(source.path) ? 0.98 : 0.7),
    (source) => /tsconfig|package\.json$/u.test(source.path),
  );
  if (tsEvidence.length > 0 || sources.some((source) => /\.tsx?$/u.test(source.path))) {
    const fallback = sources.find((source) => /\.tsx?$/u.test(source.path));
    const evidence = tsEvidence.length > 0 ? tsEvidence : fallback ? [evidenceFor(fallback, /./u, 0.9)!] : [];
    add(buildCandidate({
      category: "Stack",
      subject: "language",
      predicate: "primary",
      value: "TypeScript",
      scope: null,
      epistemicType: "derived",
      claimKind: "implementation",
      evidence,
    }));
  }

  const nextActive = [
    ...moduleImportEvidence(sources, /["']next(?:\/[^"']*)?["']/u, 0.94),
    ...collectEvidence(
      sources,
      /\bnextConfig\b/u,
      () => 0.94,
      (source) => activeSource(source) && /(?:^|\/)next\.config\./u.test(source.path),
    ),
  ];
  const nextPackage = packageEvidence(sources, /"next"\s*:/u);
  if (nextActive.length > 0 || (dependencies.next && sources.some((source) => /next\.config\./u.test(source.path)))) {
    add(buildCandidate({
      category: "Stack",
      subject: "framework",
      predicate: "primary",
      value: "Next.js",
      scope: "web",
      epistemicType: "derived",
      claimKind: "implementation",
      evidence: [...nextActive, ...nextPackage],
    }));
  }

  const reactEvidence = packageEvidence(sources, /"react"\s*:/u);
  if (dependencies.react && reactEvidence.length > 0) {
    add(buildCandidate({
      category: "Stack",
      subject: "ui-library",
      predicate: "active",
      value: "React",
      scope: "web",
      epistemicType: "derived",
      claimKind: "implementation",
      evidence: reactEvidence,
      confidence: nextActive.length > 0 ? 0.96 : 0.72,
    }));
  }

  const authProviders = [
    {
      value: "Clerk",
      dependency: /"@clerk\/nextjs"\s*:/u,
      module: /["']@clerk\/nextjs(?:\/[^"']*)?["']/u,
    },
    {
      value: "Supabase Auth",
      dependency: /"@supabase\/(?:supabase-js|ssr)"\s*:/u,
      module: /["']@supabase\/(?:supabase-js|ssr)(?:\/[^"']*)?["']/u,
    },
    {
      value: "Firebase",
      dependency: /"firebase"\s*:/u,
      module: /["']firebase(?:\/[^"']*)?["']/u,
    },
  ];

  for (const provider of authProviders) {
    const active = moduleImportEvidence(sources, provider.module);
    const installed = packageEvidence(sources, provider.dependency);
    if (active.length > 0) {
      add(buildCandidate({
        category: "Authentication",
        subject: "authentication",
        predicate: "provider",
        value: provider.value,
        scope: "application",
        epistemicType: "derived",
        claimKind: "implementation",
        evidence: [...active, ...installed],
      }));
    }
  }

  const githubOAuthEvidence = collectEvidence(
    sources,
    /(?:fetch|new URL)\(\s*["']https:\/\/github\.com\/login\/oauth\/(?:authorize|access_token)/u,
    () => 0.97,
    activeSource,
  );
  if (githubOAuthEvidence.length > 0) {
    add(buildCandidate({
      category: "Authentication",
      subject: "authentication",
      predicate: "provider",
      value: "GitHub OAuth",
      scope: "application",
      epistemicType: "derived",
      claimKind: "implementation",
      evidence: githubOAuthEvidence,
    }));
  }

  const docAuthPattern = /authentication\s*(?:provider\s*)?(?:=|:|uses|is)\s*(Clerk|Supabase(?: Auth)?|Firebase)/iu;
  for (const source of sources.filter(
    (item) => item.kind === "documentation" && /(?:^|\/)README\.md$/iu.test(item.path),
  )) {
    const match = source.content.match(docAuthPattern);
    if (!match?.[1]) {
      continue;
    }
    const normalizedValue = /^supabase/iu.test(match[1]) ? "Supabase Auth" : match[1];
    const evidence = evidenceFor(source, docAuthPattern, 0.34);
    if (evidence) {
      add(buildCandidate({
        category: "Authentication",
        subject: "authentication",
        predicate: "provider",
        value: normalizedValue,
        scope: "application",
        epistemicType: "observed",
        claimKind: "implementation",
        evidence: [evidence],
        confidence: 0.34,
      }));
    }
  }

  const drizzleActive = moduleImportEvidence(sources, /["']drizzle-orm(?:\/[^"']*)?["']/u, 0.94);
  if (drizzleActive.length > 0) {
    add(buildCandidate({
      category: "Database",
      subject: "orm",
      predicate: "active",
      value: "Drizzle",
      scope: null,
      epistemicType: "derived",
      claimKind: "implementation",
      evidence: [...drizzleActive, ...packageEvidence(sources, /"drizzle-orm"\s*:/u)],
    }));
  }

  const prismaActive = moduleImportEvidence(sources, /["']@prisma\/client(?:\/[^"']*)?["']/u, 0.94);
  if (prismaActive.length > 0) {
    add(buildCandidate({
      category: "Database",
      subject: "orm",
      predicate: "active",
      value: "Prisma",
      scope: null,
      epistemicType: "derived",
      claimKind: "implementation",
      evidence: [...prismaActive, ...packageEvidence(sources, /"@prisma\/client"\s*:/u)],
    }));
  }

  const postgresEvidence = [
    ...moduleImportEvidence(sources, /["'](?:postgres|pg|drizzle-orm\/pg-core)["']/u, 0.9),
    ...moduleImportEvidence(sources, /["']@supabase\/(?:supabase-js|ssr)["']/u, 0.86),
  ];
  if (postgresEvidence.length > 0) {
    add(buildCandidate({
      category: "Database",
      subject: "database",
      predicate: "engine",
      value: "PostgreSQL",
      scope: "saas",
      epistemicType: "derived",
      claimKind: "implementation",
      evidence: postgresEvidence,
    }));
  }

  const sqliteEvidence = moduleImportEvidence(
    sources,
    /["'](?:better-sqlite3|drizzle-orm\/sqlite-core)["']/u,
    0.92,
  );
  if (sqliteEvidence.length > 0) {
    add(buildCandidate({
      category: "Database",
      subject: "database",
      predicate: "engine",
      value: "SQLite",
      scope: "local-tools",
      epistemicType: "derived",
      claimKind: "implementation",
      evidence: sqliteEvidence,
    }));
  }

  const vercelEvidence = [
    ...sources
      .filter((source) => source.path === "vercel.json")
      .map((source) => ({
        sourceType: source.kind,
        path: source.path,
        contentHash: source.contentHash,
        commitSha: source.commitSha,
        lineStart: 1,
        lineEnd: 1,
        excerpt: source.content.split(/\r?\n/u)[0]?.slice(0, 580) ?? "",
        authority: 0.96,
        observedAt: source.observedAt,
      } satisfies CandidateEvidence)),
    ...moduleImportEvidence(sources, /["']@vercel\/[^"']+["']/u, 0.92),
  ];
  if (vercelEvidence.length > 0) {
    add(buildCandidate({
      category: "Deployment",
      subject: "deployment",
      predicate: "provider",
      value: "Vercel",
      scope: "web",
      epistemicType: "derived",
      claimKind: "implementation",
      evidence: vercelEvidence,
    }));
  }

  const vitestEvidence = collectEvidence(
    sources,
    /(?:vitest|defineConfig\()/u,
    (source) => (source.path.includes("vitest") ? 0.94 : 0.65),
    (source) => /vitest|package\.json$/u.test(source.path),
  );
  if (dependencies.vitest && vitestEvidence.length > 0) {
    add(buildCandidate({
      category: "Testing",
      subject: "testing",
      predicate: "runner",
      value: "Vitest",
      scope: null,
      epistemicType: "derived",
      claimKind: "implementation",
      evidence: vitestEvidence,
    }));
  }

  const pnpmSource = sources.find((source) => /(?:^|\/)pnpm-lock\.yaml$/u.test(source.path));
  if (pnpmSource) {
    const evidence = evidenceFor(pnpmSource, /lockfileVersion|settings:/u, 0.99);
    if (evidence) {
      add(buildCandidate({
        category: "Conventions",
        subject: "package-manager",
        predicate: "active",
        value: "pnpm",
        scope: null,
        epistemicType: "observed",
        claimKind: "implementation",
        evidence: [evidence],
      }));
    }
  }

  return candidates;
}
