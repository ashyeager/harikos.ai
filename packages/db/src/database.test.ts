import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];
const fixedTime = "2026-08-22T12:00:00.000Z";
const requireFromRoot = createRequire(join(process.cwd(), "package.json"));

function createTemporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "harikos-db-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("SQLite HARIKOS store", () => {
  it("applies migrations and persists every Phase 1 entity", async () => {
    const { openHarikosDatabase } = requireFromRoot(
      join(process.cwd(), "packages", "db", "dist", "index.js"),
    );
    const directory = createTemporaryDirectory();
    const databasePath = join(directory, "project.db");
    const store = openHarikosDatabase({
      databasePath,
      clock: () => new Date(fixedTime),
    });

    try {
      const project = store.projects.register({
        name: "fixture-project",
        path: join(directory, "fixture-project"),
      });
      const sameProject = store.projects.register({
        name: "fixture-project",
        path: join(directory, "fixture-project"),
      });

      expect(sameProject.id).toBe(project.id);
      expect(store.projects.list()).toHaveLength(1);

      const source = store.sources.create({
        projectId: project.id,
        type: "manifest",
        path: "package.json",
        contentHash: "sha256:fixture",
        metadata: { parser: "package-json" },
      });
      const event = store.events.create({
        projectId: project.id,
        type: "source_observed",
        sourceId: source.id,
        payload: { path: "package.json" },
      });
      const firebaseClaim = store.claims.create({
        projectId: project.id,
        subject: "authentication",
        predicate: "provider",
        value: "Firebase",
        scope: "app",
        status: "current",
        epistemicType: "derived",
        claimKind: "implementation",
        confidence: 0.92,
      });
      const clerkClaim = store.claims.create({
        projectId: project.id,
        subject: "authentication",
        predicate: "provider",
        value: "Clerk",
        scope: "app",
        status: "candidate",
        epistemicType: "observed",
        claimKind: "intent",
        confidence: 0.8,
      });
      const supportingEvidence = store.evidence.create({
        claimId: firebaseClaim.id,
        sourceId: source.id,
        path: "package.json",
        lineStart: 4,
        lineEnd: 6,
        excerpt: '"firebase": "..."',
        strength: 0.85,
      });
      const contradiction = store.contradictions.create({
        projectId: project.id,
        claimAId: firebaseClaim.id,
        claimBId: clerkClaim.id,
        reason: "The providers are incompatible in the same scope.",
      });
      const resolution = store.resolutions.create({
        contradictionId: contradiction.id,
        resolutionType: "coexist",
        chosenClaimId: firebaseClaim.id,
        reason: "Firebase is current while Clerk remains intended.",
        actor: "test",
      });
      const memory = store.memories.create({
        projectId: project.id,
        type: "decision",
        content: "Migrate authentication only after the current release.",
        importance: 0.9,
        sourceId: source.id,
      });
      const session = store.agentSessions.create({
        projectId: project.id,
        agent: "codex",
        task: "Inspect authentication",
      });
      const outcome = store.outcomes.create({
        sessionId: session.id,
        type: "inspection",
        result: { finding: "Firebase is active" },
        success: true,
        relatedClaimIds: [firebaseClaim.id],
      });
      const contextPack = store.contextPacks.create({
        projectId: project.id,
        task: "Update authentication",
        claims: [{ id: firebaseClaim.id, status: "current" }],
        memories: [{ id: memory.id, type: "decision" }],
        files: ["package.json"],
        decisions: [{ id: memory.id }],
        changes: [{ eventId: event.id }],
        tokenEstimate: 84,
      });

      expect(store.sources.listByProject(project.id)).toEqual([source]);
      expect(store.events.listByProject(project.id)).toEqual([event]);
      expect(store.claims.listByProject(project.id)).toEqual([
        firebaseClaim,
        clerkClaim,
      ]);
      expect(store.evidence.listByClaim(firebaseClaim.id)).toEqual([
        supportingEvidence,
      ]);
      expect(store.contradictions.listByProject(project.id)).toEqual([
        contradiction,
      ]);
      expect(
        store.resolutions.listByContradiction(contradiction.id),
      ).toEqual([resolution]);
      expect(store.memories.listByProject(project.id)).toEqual([memory]);
      expect(store.agentSessions.listByProject(project.id)).toEqual([session]);
      expect(store.outcomes.listBySession(session.id)).toEqual([outcome]);
      expect(store.contextPacks.listByProject(project.id)).toEqual([
        contextPack,
      ]);

      expect(firebaseClaim.validFrom).toBe(fixedTime);
      expect(firebaseClaim.validTo).toBeNull();
      expect(firebaseClaim.scope).toBe("app");
      expect(store.memories.listByProject(project.id)[0]?.id).not.toBe(
        firebaseClaim.id,
      );

      expect(() =>
        store.claims.create({
          projectId: project.id,
          subject: "framework",
          predicate: "name",
          value: "Next.js",
          status: "current",
          epistemicType: "derived",
          confidence: 1.1,
        }),
      ).toThrow();
    } finally {
      store.close();
    }

    const reopenedStore = openHarikosDatabase({ databasePath });
    try {
      expect(reopenedStore.projects.list()).toHaveLength(1);
    } finally {
      reopenedStore.close();
    }

    const sqlite = new Database(databasePath, { readonly: true });
    try {
      const tableNames = sqlite
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
        )
        .all()
        .map((row) => (row as { name: string }).name);

      expect(tableNames).toEqual(
        expect.arrayContaining([
          "__drizzle_migrations",
          "agent_sessions",
          "claims",
          "context_packs",
          "contradictions",
          "events",
          "evidence",
          "memories",
          "outcomes",
          "projects",
          "resolutions",
          "sources",
        ]),
      );
    } finally {
      sqlite.close();
    }
  });
});
