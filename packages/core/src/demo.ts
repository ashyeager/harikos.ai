import {
  candidateClaimSchema,
  projectSnapshotSchema,
  type CandidateClaim,
  type CandidateEvidence,
  type ProjectSnapshot,
} from "./domain.js";
import { resolveTruth } from "./truth-engine.js";

const firstScanAt = "2026-08-22T09:00:00.000Z";
const secondScanAt = "2026-08-23T09:24:00.000Z";
const firstCommit = "8f1b20aclerk";
const secondCommit = "c2137fbsupa";

function evidence(
  path: string,
  excerpt: string,
  authority: number,
  commitSha = secondCommit,
  sourceType: CandidateEvidence["sourceType"] = "file",
): CandidateEvidence {
  return {
    sourceType,
    path,
    contentHash: `sha256:${path.replace(/[^a-z0-9]/giu, "").padEnd(32, "0")}`,
    commitSha,
    lineStart: 1,
    lineEnd: 1,
    excerpt,
    authority,
    observedAt: commitSha === firstCommit ? firstScanAt : secondScanAt,
  };
}

function candidate(
  category: string,
  subject: string,
  value: string,
  claimEvidence: CandidateEvidence[],
  scope: string | null = null,
): CandidateClaim {
  return candidateClaimSchema.parse({
    category,
    subject,
    predicate: subject === "authentication" ? "provider" : "active",
    value,
    scope,
    epistemicType: "derived",
    claimKind: "implementation",
    confidence: Math.min(0.99, Math.max(...claimEvidence.map((item) => item.authority)) + 0.03),
    evidence: claimEvidence,
  });
}

export function createFlagshipDemoSnapshot(): ProjectSnapshot {
  const clerk = candidate(
    "Authentication",
    "authentication",
    "Clerk",
    [
      evidence("middleware.ts", "clerkMiddleware()", 0.98, firstCommit, "config"),
      evidence("package.json", '"@clerk/nextjs": "latest"', 0.64, firstCommit, "manifest"),
    ],
    "application",
  );
  const stateA = resolveTruth([], [clerk], firstScanAt, firstCommit);
  const stateB = resolveTruth(
    stateA.truths,
    [
      candidate(
        "Authentication",
        "authentication",
        "Supabase Auth",
        [
          evidence("middleware.ts", "createServerClient(...) // active auth", 0.98, secondCommit, "config"),
          evidence("lib/supabase/server.ts", "createServerClient(...) ", 0.97),
          evidence("package.json", '"@supabase/ssr": "latest"', 0.64, secondCommit, "manifest"),
        ],
        "application",
      ),
      candidate(
        "Authentication",
        "authentication",
        "Clerk",
        [evidence("README.md", "Authentication: Clerk", 0.34, secondCommit, "documentation")],
        "application",
      ),
      candidate("Stack", "framework", "Next.js", [evidence("next.config.ts", "const nextConfig", 0.97, secondCommit, "config")], "web"),
      candidate("Stack", "language", "TypeScript", [evidence("tsconfig.json", '"strict": true', 0.98, secondCommit, "config")]),
      candidate("Database", "database", "PostgreSQL", [evidence("lib/db.ts", "postgres(process.env.DATABASE_URL)", 0.94)], "saas"),
      candidate("Database", "orm", "Drizzle", [evidence("lib/schema.ts", "pgTable(\"users\")", 0.95)]),
      candidate("Deployment", "deployment", "Vercel", [evidence("vercel.json", '"framework": "nextjs"', 0.94, secondCommit, "config")], "web"),
      candidate("Testing", "testing", "Vitest", [evidence("vitest.config.ts", "defineConfig", 0.92, secondCommit, "config")]),
    ],
    secondScanAt,
    secondCommit,
  );

  return projectSnapshotSchema.parse({
    projectId: "demo-project-truth",
    repository: {
      id: "github:41820",
      name: "acme-platform",
      owner: "harikos-demo",
      defaultBranch: "main",
      headSha: secondCommit,
      visibility: "private",
      webUrl: null,
      sourceType: "github",
    },
    scannedAt: secondScanAt,
    sourceCount: 24,
    truths: stateB.truths,
    contradictions: stateB.contradictions,
    changes: stateB.changes,
    mode: "fixture",
  });
}
