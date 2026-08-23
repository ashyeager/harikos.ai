import { randomUUID } from "node:crypto";

import {
  cloudClaims,
  cloudContextPacks,
  cloudContradictions,
  cloudEvidence,
  cloudProjectChanges,
  cloudProjects,
  cloudRepositories,
  cloudRepositoryInstallations,
  cloudScans,
  cloudUsers,
  and,
  desc,
  eq,
  openCloudDatabase,
  readCloudDatabaseConfig,
} from "@harikos/db";
import {
  analyzeRepository,
  createGitHubInstallationToken,
  GitHubRepositorySource,
  projectSnapshotSchema,
  projectTruthClaimSchema,
  readGitHubAppConfig,
  type CandidateEvidence,
  type ContextPack,
  type ProjectSnapshot,
  type ProjectTruthClaim,
} from "@harikos/core";
import { z } from "zod";

import type { WebSession } from "./session";

export const createCloudProjectSchema = z.object({
  installationId: z.string().regex(/^\d+$/u),
  githubRepositoryId: z.string().regex(/^\d+$/u),
  owner: z.string().min(1),
  name: z.string().min(1),
  defaultBranch: z.string().min(1),
  private: z.boolean(),
});

export type CreateCloudProjectInput = z.infer<typeof createCloudProjectSchema>;

export class RepositoryAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryAuthorizationError";
  }
}

const authorizedRepositoriesSchema = z.object({
  repositories: z.array(
    z.object({
      id: z.number().int().positive(),
      name: z.string(),
      private: z.boolean(),
      default_branch: z.string(),
      owner: z.object({ login: z.string() }),
    }),
  ),
});

export async function verifyRepositorySelection(
  session: WebSession,
  selection: CreateCloudProjectInput,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  for (let page = 1; page <= 10; page += 1) {
    const response = await fetcher(
      `https://api.github.com/user/installations/${selection.installationId}/repositories?per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${session.accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new RepositoryAuthorizationError("GitHub could not verify access to that installation.");
    }
    const body = authorizedRepositoriesSchema.parse(await response.json());
    const match = body.repositories.find(
      (repository) => String(repository.id) === selection.githubRepositoryId,
    );
    if (match) {
      if (
        match.owner.login !== selection.owner ||
        match.name !== selection.name ||
        match.default_branch !== selection.defaultBranch ||
        match.private !== selection.private
      ) {
        throw new RepositoryAuthorizationError("Repository metadata did not match GitHub's authorized record.");
      }
      return;
    }
    if (body.repositories.length < 100) break;
  }
  throw new RepositoryAuthorizationError("That repository is not authorized for this GitHub user and installation.");
}

function databaseConfig() {
  const config = readCloudDatabaseConfig();
  if (!config) {
    throw new Error("PostgreSQL is not configured. Add DATABASE_URL to create cloud projects.");
  }
  return config;
}

function namespaceId(projectId: string, id: string): string {
  return id.startsWith(`${projectId}:`) ? id : `${projectId}:${id}`;
}

function namespaceSnapshot(snapshot: ProjectSnapshot, projectId: string): ProjectSnapshot {
  const idMap = new Map(snapshot.truths.map((truth) => [truth.id, namespaceId(projectId, truth.id)]));
  return projectSnapshotSchema.parse({
    ...snapshot,
    projectId,
    truths: snapshot.truths.map((truth) => ({
      ...truth,
      id: idMap.get(truth.id),
      supersedesClaimId: truth.supersedesClaimId
        ? (idMap.get(truth.supersedesClaimId) ?? namespaceId(projectId, truth.supersedesClaimId))
        : null,
    })),
    contradictions: snapshot.contradictions.map((item) => ({
      ...item,
      id: namespaceId(projectId, item.id),
      claimAId: idMap.get(item.claimAId) ?? namespaceId(projectId, item.claimAId),
      claimBId: idMap.get(item.claimBId) ?? namespaceId(projectId, item.claimBId),
    })),
    changes: snapshot.changes.map((item) => ({
      ...item,
      id: namespaceId(projectId, item.id),
    })),
  });
}

export async function createCloudProject(
  session: WebSession,
  input: CreateCloudProjectInput,
): Promise<{ id: string; name: string }> {
  const parsed = createCloudProjectSchema.parse(input);
  await verifyRepositorySelection(session, parsed);
  const connection = await openCloudDatabase(databaseConfig());
  try {
    return await connection.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(cloudUsers)
        .values({
          githubUserId: session.user.githubUserId,
          login: session.user.login,
          displayName: session.user.name,
          avatarUrl: session.user.avatarUrl,
        })
        .onConflictDoUpdate({
          target: cloudUsers.githubUserId,
          set: {
            login: session.user.login,
            displayName: session.user.name,
            avatarUrl: session.user.avatarUrl,
          },
        })
        .returning();
      if (!user) {
        throw new Error("Could not persist the GitHub user.");
      }
      const [project] = await tx
        .insert(cloudProjects)
        .values({ ownerId: user.id, name: parsed.name })
        .returning();
      if (!project) {
        throw new Error("Could not create the HARIKOS project.");
      }
      await tx.insert(cloudRepositories).values({
        projectId: project.id,
        githubRepositoryId: parsed.githubRepositoryId,
        owner: parsed.owner,
        name: parsed.name,
        defaultBranch: parsed.defaultBranch,
        private: parsed.private,
      });
      await tx.insert(cloudRepositoryInstallations).values({
        projectId: project.id,
        installationId: parsed.installationId,
        accountLogin: parsed.owner,
      });
      return { id: project.id, name: project.name };
    });
  } finally {
    await connection.close();
  }
}

export async function listCloudProjects(session: WebSession) {
  const config = readCloudDatabaseConfig();
  if (!config) {
    return [];
  }
  const connection = await openCloudDatabase(config);
  try {
    return connection.db
      .select({
        id: cloudProjects.id,
        name: cloudProjects.name,
        owner: cloudRepositories.owner,
        repository: cloudRepositories.name,
        private: cloudRepositories.private,
        lastCommitSha: cloudRepositories.lastCommitSha,
      })
      .from(cloudProjects)
      .innerJoin(cloudUsers, eq(cloudProjects.ownerId, cloudUsers.id))
      .innerJoin(cloudRepositories, eq(cloudProjects.id, cloudRepositories.projectId))
      .where(eq(cloudUsers.githubUserId, session.user.githubUserId));
  } finally {
    await connection.close();
  }
}

async function authorizedProject(connection: Awaited<ReturnType<typeof openCloudDatabase>>, session: WebSession, projectId: string) {
  const [record] = await connection.db
    .select({
      id: cloudProjects.id,
      name: cloudProjects.name,
      owner: cloudRepositories.owner,
      repository: cloudRepositories.name,
      defaultBranch: cloudRepositories.defaultBranch,
      private: cloudRepositories.private,
      githubRepositoryId: cloudRepositories.githubRepositoryId,
      lastCommitSha: cloudRepositories.lastCommitSha,
      installationId: cloudRepositoryInstallations.installationId,
    })
    .from(cloudProjects)
    .innerJoin(cloudUsers, eq(cloudProjects.ownerId, cloudUsers.id))
    .innerJoin(cloudRepositories, eq(cloudProjects.id, cloudRepositories.projectId))
    .innerJoin(
      cloudRepositoryInstallations,
      eq(cloudProjects.id, cloudRepositoryInstallations.projectId),
    )
    .where(
      and(
        eq(cloudProjects.id, projectId),
        eq(cloudUsers.githubUserId, session.user.githubUserId),
      ),
    );
  if (!record) {
    throw new Error("Project not found or not authorized.");
  }
  return record;
}

async function loadPreviousTruths(
  connection: Awaited<ReturnType<typeof openCloudDatabase>>,
  projectId: string,
): Promise<ProjectTruthClaim[]> {
  const [claims, evidence] = await Promise.all([
    connection.db.select().from(cloudClaims).where(eq(cloudClaims.projectId, projectId)),
    connection.db
      .select()
      .from(cloudEvidence)
      .where(and(eq(cloudEvidence.projectId, projectId), eq(cloudEvidence.active, true))),
  ]);
  return claims.map((claim) => {
    const claimEvidence: CandidateEvidence[] = evidence
      .filter((item) => item.claimId === claim.id && item.filePath)
      .map((item) => ({
        sourceType:
          item.sourceType === "manifest" ||
          item.sourceType === "config" ||
          item.sourceType === "documentation" ||
          item.sourceType === "git_commit"
            ? item.sourceType
            : "file",
        path: item.filePath!,
        contentHash: item.contentHash,
        commitSha: item.commitSha ?? "unknown",
        lineStart: item.lineStart,
        lineEnd: item.lineEnd,
        excerpt: null,
        authority: item.authority,
        observedAt: item.observedAt.toISOString(),
      }));
    return projectTruthClaimSchema.parse({
      id: claim.id,
      category: claim.category,
      subject: claim.subject,
      predicate: claim.predicate,
      value: typeof claim.value === "string" ? claim.value : JSON.stringify(claim.value),
      scope: claim.scope,
      status: claim.status,
      epistemicType: claim.epistemicType,
      claimKind: "implementation",
      confidence: claim.confidence,
      validFrom: claim.validFrom.toISOString(),
      validTo: claim.validTo?.toISOString() ?? null,
      firstSeenAt: claim.firstSeenAt.toISOString(),
      lastVerifiedAt: claim.lastVerifiedAt.toISOString(),
      supersedesClaimId: claim.supersedesClaimId,
      evidence: claimEvidence,
    });
  });
}

export async function scanCloudProject(
  session: WebSession,
  projectId: string,
): Promise<ProjectSnapshot> {
  const connection = await openCloudDatabase(databaseConfig());
  const appConfig = readGitHubAppConfig();
  if (!appConfig) {
    await connection.close();
    throw new Error("GitHub App credentials are not configured.");
  }
  let scanId: string | undefined;
  try {
    const project = await authorizedProject(connection, session, projectId);
    const previous = await loadPreviousTruths(connection, projectId);
    const [scan] = await connection.db
      .insert(cloudScans)
      .values({
        projectId,
        status: "running",
        commitSha: project.lastCommitSha ?? project.defaultBranch,
      })
      .returning();
    scanId = scan?.id;
    const source = new GitHubRepositorySource({
      owner: project.owner,
      repository: project.repository,
      tokenProvider: async () =>
        (
          await createGitHubInstallationToken(appConfig, project.installationId, {
            repositoryId: project.githubRepositoryId,
          })
        ).token,
    });
    const rawSnapshot = await analyzeRepository(source, previous, { mode: "github" });
    const snapshot = namespaceSnapshot(rawSnapshot, projectId);
    const existingEvidence = await connection.db
      .select()
      .from(cloudEvidence)
      .where(eq(cloudEvidence.projectId, projectId));

    await connection.db.transaction(async (tx) => {
      await tx
        .update(cloudEvidence)
        .set({ active: false })
        .where(eq(cloudEvidence.projectId, projectId));
      for (const truth of snapshot.truths) {
        await tx
          .insert(cloudClaims)
          .values({
            id: truth.id,
            projectId,
            category: truth.category,
            subject: truth.subject,
            predicate: truth.predicate,
            value: truth.value,
            scope: truth.scope,
            status: truth.status,
            epistemicType: truth.epistemicType,
            confidence: truth.confidence,
            validFrom: new Date(truth.validFrom),
            validTo: truth.validTo ? new Date(truth.validTo) : null,
            firstSeenAt: new Date(truth.firstSeenAt),
            lastVerifiedAt: new Date(truth.lastVerifiedAt),
            supersedesClaimId: truth.supersedesClaimId,
          })
          .onConflictDoUpdate({
            target: cloudClaims.id,
            set: {
              status: truth.status,
              confidence: truth.confidence,
              validTo: truth.validTo ? new Date(truth.validTo) : null,
              lastVerifiedAt: new Date(truth.lastVerifiedAt),
            },
          });
        for (const evidence of truth.evidence) {
          const existing = existingEvidence.find(
              (item) =>
                item.claimId === truth.id &&
                item.filePath === evidence.path &&
                item.contentHash === evidence.contentHash,
            );
          if (existing) {
            await tx
              .update(cloudEvidence)
              .set({
                active: true,
                commitSha: evidence.commitSha,
                lineStart: evidence.lineStart,
                lineEnd: evidence.lineEnd,
                authority: evidence.authority,
                observedAt: new Date(evidence.observedAt),
              })
              .where(eq(cloudEvidence.id, existing.id));
            continue;
          }
          await tx.insert(cloudEvidence).values({
            id: randomUUID(),
            claimId: truth.id,
            projectId,
            sourceType: evidence.sourceType,
            filePath: evidence.path,
            commitSha: evidence.commitSha,
            contentHash: evidence.contentHash,
            lineStart: evidence.lineStart,
            lineEnd: evidence.lineEnd,
            authority: evidence.authority,
            observedAt: new Date(evidence.observedAt),
            active: true,
            metadata: {},
          });
        }
      }
      for (const contradiction of snapshot.contradictions) {
        await tx
          .insert(cloudContradictions)
          .values({
            id: contradiction.id,
            projectId,
            claimAId: contradiction.claimAId,
            claimBId: contradiction.claimBId,
            status: contradiction.status,
            reason: contradiction.reason,
            resolution: contradiction.resolution,
            createdAt: new Date(contradiction.createdAt),
            resolvedAt: contradiction.status === "resolved" ? new Date(contradiction.createdAt) : null,
          })
          .onConflictDoNothing();
      }
      for (const change of snapshot.changes) {
        await tx
          .insert(cloudProjectChanges)
          .values({
            id: change.id,
            projectId,
            scanId: scanId ?? null,
            category: change.category,
            summary: change.summary,
            commitSha: change.commitSha,
            createdAt: new Date(change.createdAt),
          })
          .onConflictDoNothing();
      }
      if (scanId) {
        await tx
          .update(cloudScans)
          .set({
            status: "completed",
            commitSha: snapshot.repository.headSha,
            completedAt: new Date(snapshot.scannedAt),
          })
          .where(eq(cloudScans.id, scanId));
      }
      await tx
        .update(cloudRepositories)
        .set({ lastCommitSha: snapshot.repository.headSha })
        .where(eq(cloudRepositories.projectId, projectId));
    });
    return snapshot;
  } catch (error) {
    if (scanId) {
      await connection.db
        .update(cloudScans)
        .set({
          status: "failed",
          completedAt: new Date(),
          errorCode: error instanceof Error ? error.name : "SCAN_FAILED",
        })
        .where(eq(cloudScans.id, scanId));
    }
    throw error;
  } finally {
    await connection.close();
  }
}

export async function saveCloudContextPack(
  session: WebSession,
  projectId: string,
  pack: ContextPack,
): Promise<void> {
  const connection = await openCloudDatabase(databaseConfig());
  try {
    await authorizedProject(connection, session, projectId);
    await connection.db.insert(cloudContextPacks).values({
      projectId,
      task: pack.task,
      payload: pack,
      tokenEstimate: pack.tokenEstimate,
    });
  } finally {
    await connection.close();
  }
}

export async function loadCloudSnapshot(
  session: WebSession,
  projectId: string,
): Promise<ProjectSnapshot | undefined> {
  const config = readCloudDatabaseConfig();
  if (!config) {
    return undefined;
  }
  const connection = await openCloudDatabase(config);
  try {
    const project = await authorizedProject(connection, session, projectId);
    const [truths, contradictions, changes, scans] = await Promise.all([
      loadPreviousTruths(connection, projectId),
      connection.db.select().from(cloudContradictions).where(eq(cloudContradictions.projectId, projectId)),
      connection.db.select().from(cloudProjectChanges).where(eq(cloudProjectChanges.projectId, projectId)),
      connection.db.select().from(cloudScans).where(eq(cloudScans.projectId, projectId)).orderBy(desc(cloudScans.startedAt)).limit(1),
    ]);
    const latestScan = scans[0];
    if (!latestScan) {
      return undefined;
    }
    return projectSnapshotSchema.parse({
      projectId,
      repository: {
        id: `github:${project.owner}/${project.repository}`,
        name: project.repository,
        owner: project.owner,
        defaultBranch: project.defaultBranch,
        headSha: project.lastCommitSha ?? latestScan.commitSha,
        visibility: project.private ? "private" : "public",
        webUrl: `https://github.com/${project.owner}/${project.repository}`,
        sourceType: "github",
      },
      scannedAt: (latestScan.completedAt ?? latestScan.startedAt).toISOString(),
      sourceCount: new Set(truths.flatMap((truth) => truth.evidence.map((item) => item.path))).size,
      truths,
      contradictions: contradictions.map((item) => ({
        id: item.id,
        claimAId: item.claimAId,
        claimBId: item.claimBId,
        status: item.status === "resolved" ? "resolved" : "open",
        reason: item.reason,
        resolution: item.resolution,
        createdAt: item.createdAt.toISOString(),
      })),
      changes: changes.map((item) => ({
        id: item.id,
        category: item.category,
        summary: item.summary,
        previousValue: null,
        currentValue: item.summary.split(" to ").at(-1)?.replace(/\.$/u, "") ?? "Updated",
        commitSha: item.commitSha ?? "unknown",
        createdAt: item.createdAt.toISOString(),
      })),
      mode: "github",
    });
  } finally {
    await connection.close();
  }
}
