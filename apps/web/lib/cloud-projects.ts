import { createHash, randomBytes, randomUUID } from "node:crypto";

import {
  cloudClaims,
  cloudContextPacks,
  cloudContradictions,
  cloudEvidence,
  cloudProjectChanges,
  cloudMemories,
  cloudAgentConnections,
  cloudAgentSessions,
  cloudOutcomes,
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
  isNull,
} from "@harikos/db";
import {
  analyzeRepository,
  createGitHubInstallationToken,
  GitHubRepositorySource,
  listGitHubInstallationRepositories,
  projectSnapshotSchema,
  projectTruthClaimSchema,
  readGitHubAppConfig,
  type CandidateEvidence,
  type ContextPack,
  type GitHubInstallation,
  type ProjectSnapshot,
  type ProjectTruthClaim,
} from "@harikos/core";
import { z } from "zod";

import type { AuthIdentity } from "./auth";

export const createCloudProjectSchema = z.object({
  installationId: z.string().regex(/^\d+$/u),
  githubRepositoryId: z.string().regex(/^\d+$/u),
  owner: z.string().min(1),
  name: z.string().min(1),
  defaultBranch: z.string().min(1),
  private: z.boolean(),
});

export type CreateCloudProjectInput = z.infer<typeof createCloudProjectSchema>;

export const createCloudMemorySchema = z.object({
  type: z.enum(["decision", "attempt", "failed_attempt", "fix", "bug", "root_cause", "constraint", "discovery", "outcome", "incident", "note"]),
  content: z.string().trim().min(1).max(10_000),
  importance: z.number().min(0).max(1).default(0.5),
  agent: z.string().trim().min(1).max(100).optional(),
  sessionId: z.string().uuid().optional(),
});

export type CloudMemory = {
  id: string;
  projectId: string;
  type: string;
  content: string;
  status: string;
  importance: number;
  agent: string | null;
  sessionId: string | null;
  createdAt: string;
};

export type AgentConnection = {
  id: string;
  projectId: string;
  name: string;
  tokenPrefix: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
};

export const createAgentConnectionSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const agentSessionSchema = z.object({
  task: z.string().trim().min(1).max(2_000).optional(),
});

export const outcomeSchema = z.object({
  summary: z.string().trim().min(1).max(10_000),
  status: z.enum(["success", "failed", "partial"]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

function hashAgentToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class RepositoryAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryAuthorizationError";
  }
}

export function verifyRepositorySelection(
  repositories: Awaited<ReturnType<typeof listGitHubInstallationRepositories>>,
  selection: CreateCloudProjectInput,
): void {
  const match = repositories.find(
    (repository) => String(repository.id) === selection.githubRepositoryId,
  );
  if (match) {
    if (
      match.owner.login !== selection.owner ||
      match.name !== selection.name ||
      match.default_branch !== selection.defaultBranch ||
      match.private !== selection.private
    ) {
      throw new RepositoryAuthorizationError(
        "Repository metadata did not match GitHub's authorized record.",
      );
    }
    return;
  }
  throw new RepositoryAuthorizationError(
    "That repository is not authorized for this GitHub user and installation.",
  );
}

function databaseConfig() {
  const config = readCloudDatabaseConfig();
  if (!config) {
    throw new Error("PostgreSQL is not configured. Add DATABASE_URL or POSTGRES_URL.");
  }
  return config;
}

function openConfiguredCloudDatabase() {
  return openCloudDatabase(databaseConfig(), { migrate: false });
}

async function ensureCloudUser(
  connection: Awaited<ReturnType<typeof openCloudDatabase>>,
  identity: AuthIdentity,
) {
  const [user] = await connection.db
    .insert(cloudUsers)
    .values({
      supabaseUserId: identity.id,
      githubUserId: identity.githubUserId,
      login: identity.login,
      displayName: identity.displayName,
      avatarUrl: identity.avatarUrl,
    })
    .onConflictDoUpdate({
      target: cloudUsers.supabaseUserId,
      set: {
        supabaseUserId: identity.id,
        login: identity.login,
        displayName: identity.displayName,
        avatarUrl: identity.avatarUrl,
      },
    })
    .returning();
  if (!user) throw new Error("Could not persist the authenticated user.");
  return user;
}

export async function saveCloudInstallation(
  identity: AuthIdentity,
  installation: GitHubInstallation,
): Promise<void> {
  const connection = await openConfiguredCloudDatabase();
  try {
    const user = await ensureCloudUser(connection, identity);
    const installationId = String(installation.id);
    const [existing] = await connection.db
      .select()
      .from(cloudRepositoryInstallations)
      .where(eq(cloudRepositoryInstallations.installationId, installationId));
    if (existing && existing.ownerId !== user.id) {
      throw new RepositoryAuthorizationError(
        "That GitHub installation is already owned by another HARIKOS account.",
      );
    }
    if (existing) {
      await connection.db
        .update(cloudRepositoryInstallations)
        .set({
          accountId: String(installation.account.id),
          accountLogin: installation.account.login,
          accountType: installation.account.type,
          repositorySelection: installation.repository_selection,
          updatedAt: new Date(),
        })
        .where(eq(cloudRepositoryInstallations.id, existing.id));
      return;
    }
    await connection.db.insert(cloudRepositoryInstallations).values({
      ownerId: user.id,
      installationId,
      accountId: String(installation.account.id),
      accountLogin: installation.account.login,
      accountType: installation.account.type,
      repositorySelection: installation.repository_selection,
    });
  } finally {
    await connection.close();
  }
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
  identity: AuthIdentity,
  input: CreateCloudProjectInput,
): Promise<{ id: string; name: string }> {
  const parsed = createCloudProjectSchema.parse(input);
  const appConfig = readGitHubAppConfig();
  if (!appConfig) throw new Error("GitHub App credentials are not configured.");
  const connection = await openConfiguredCloudDatabase();
  try {
    const [installation] = await connection.db
      .select({
        id: cloudRepositoryInstallations.id,
        ownerId: cloudRepositoryInstallations.ownerId,
        installationId: cloudRepositoryInstallations.installationId,
      })
      .from(cloudRepositoryInstallations)
      .innerJoin(cloudUsers, eq(cloudRepositoryInstallations.ownerId, cloudUsers.id))
      .where(
        and(
          eq(cloudRepositoryInstallations.installationId, parsed.installationId),
          eq(cloudUsers.supabaseUserId, identity.id),
        ),
      );
    if (!installation) {
      throw new RepositoryAuthorizationError(
        "That GitHub installation is not authorized for this account.",
      );
    }
    const repositories = await listGitHubInstallationRepositories(
      appConfig,
      parsed.installationId,
    );
    verifyRepositorySelection(repositories, parsed);
    return await connection.db.transaction(async (tx) => {
      const [project] = await tx
        .insert(cloudProjects)
        .values({ ownerId: installation.ownerId, name: parsed.name })
        .returning();
      if (!project) {
        throw new Error("Could not create the HARIKOS project.");
      }
      await tx.insert(cloudRepositories).values({
        projectId: project.id,
        installationId: installation.id,
        githubRepositoryId: parsed.githubRepositoryId,
        owner: parsed.owner,
        name: parsed.name,
        defaultBranch: parsed.defaultBranch,
        private: parsed.private,
      });
      return { id: project.id, name: project.name };
    });
  } finally {
    await connection.close();
  }
}

export async function listCloudProjects(identity: AuthIdentity) {
  const config = readCloudDatabaseConfig();
  if (!config) {
    return [];
  }
  const connection = await openCloudDatabase(config, { migrate: false });
  try {
    return await connection.db
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
      .where(eq(cloudUsers.supabaseUserId, identity.id));
  } finally {
    await connection.close();
  }
}

export async function listAuthorizedRepositories(identity: AuthIdentity) {
  const config = readCloudDatabaseConfig();
  const appConfig = readGitHubAppConfig();
  if (!config || !appConfig) return [];
  const connection = await openCloudDatabase(config, { migrate: false });
  try {
    const installations = await connection.db
      .select({ installationId: cloudRepositoryInstallations.installationId })
      .from(cloudRepositoryInstallations)
      .innerJoin(cloudUsers, eq(cloudRepositoryInstallations.ownerId, cloudUsers.id))
      .where(eq(cloudUsers.supabaseUserId, identity.id));
    const repositories: Array<CreateCloudProjectInput> = [];
    for (const installation of installations) {
      const authorized = await listGitHubInstallationRepositories(
        appConfig,
        installation.installationId,
      );
      repositories.push(
        ...authorized.map((repository) => ({
          installationId: installation.installationId,
          githubRepositoryId: String(repository.id),
          owner: repository.owner.login,
          name: repository.name,
          defaultBranch: repository.default_branch,
          private: repository.private,
        })),
      );
    }
    return repositories;
  } finally {
    await connection.close();
  }
}

async function authorizedProject(connection: Awaited<ReturnType<typeof openCloudDatabase>>, identity: AuthIdentity | undefined, projectId: string) {
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
      eq(cloudRepositories.installationId, cloudRepositoryInstallations.id),
    )
    .where(
      and(
        eq(cloudProjects.id, projectId),
        identity ? eq(cloudUsers.supabaseUserId, identity.id) : undefined,
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
  identity: AuthIdentity | undefined,
  projectId: string,
): Promise<ProjectSnapshot> {
  const connection = await openConfiguredCloudDatabase();
  const appConfig = readGitHubAppConfig();
  if (!appConfig) {
    await connection.close();
    throw new Error("GitHub App credentials are not configured.");
  }
  let scanId: string | undefined;
  try {
    const project = await authorizedProject(connection, identity, projectId);
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

export async function findCloudProjectByRepositoryId(repositoryId: string): Promise<string | undefined> {
  const connection = await openConfiguredCloudDatabase();
  try {
    const [project] = await connection.db.select({ id: cloudProjects.id }).from(cloudProjects)
      .innerJoin(cloudRepositories, eq(cloudProjects.id, cloudRepositories.projectId))
      .where(eq(cloudRepositories.githubRepositoryId, repositoryId));
    return project?.id;
  } finally { await connection.close(); }
}

export async function scanCloudProjectFromWebhook(projectId: string): Promise<ProjectSnapshot> {
  return scanCloudProject(undefined, projectId);
}

export async function saveCloudContextPack(
  identity: AuthIdentity,
  projectId: string,
  pack: ContextPack,
): Promise<void> {
  const connection = await openConfiguredCloudDatabase();
  try {
    await authorizedProject(connection, identity, projectId);
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

export async function listCloudMemories(
  identity: AuthIdentity,
  projectId: string,
  type?: string,
): Promise<CloudMemory[]> {
  const connection = await openConfiguredCloudDatabase();
  try {
    await authorizedProject(connection, identity, projectId);
    const rows = await connection.db
      .select()
      .from(cloudMemories)
      .where(eq(cloudMemories.projectId, projectId))
      .orderBy(desc(cloudMemories.createdAt));
    return rows
      .filter((memory) => !type || memory.type === type)
      .map((memory) => ({
        id: memory.id,
        projectId: memory.projectId,
        type: memory.type,
        content: memory.content,
        status: memory.status,
        importance: memory.importance,
        agent: memory.agent,
        sessionId: memory.sessionId,
        createdAt: memory.createdAt.toISOString(),
      }));
  } finally {
    await connection.close();
  }
}

export async function listAgentMemories(projectId: string): Promise<CloudMemory[]> {
  const connection = await openConfiguredCloudDatabase();
  try {
    const rows = await connection.db.select().from(cloudMemories)
      .where(eq(cloudMemories.projectId, projectId)).orderBy(desc(cloudMemories.createdAt));
    return rows.map((memory) => ({
      id: memory.id,
      projectId: memory.projectId,
      type: memory.type,
      content: memory.content,
      status: memory.status,
      importance: memory.importance,
      agent: memory.agent,
      sessionId: memory.sessionId,
      createdAt: memory.createdAt.toISOString(),
    }));
  } finally {
    await connection.close();
  }
}

export async function createCloudMemory(
  identity: AuthIdentity,
  projectId: string,
  input: z.input<typeof createCloudMemorySchema>,
): Promise<CloudMemory> {
  const parsed = createCloudMemorySchema.parse(input);
  const connection = await openConfiguredCloudDatabase();
  try {
    await authorizedProject(connection, identity, projectId);
    const [memory] = await connection.db.insert(cloudMemories).values({
      projectId,
      type: parsed.type,
      content: parsed.content,
      status: "active",
      importance: parsed.importance,
      agent: parsed.agent ?? null,
      sessionId: parsed.sessionId ?? null,
    }).returning();
    if (!memory) throw new Error("Could not persist memory.");
    return {
      id: memory.id,
      projectId: memory.projectId,
      type: memory.type,
      content: memory.content,
      status: memory.status,
      importance: memory.importance,
      agent: memory.agent,
      sessionId: memory.sessionId,
      createdAt: memory.createdAt.toISOString(),
    };
  } finally {
    await connection.close();
  }
}

export async function createAgentMemory(
  projectId: string,
  input: z.input<typeof createCloudMemorySchema>,
): Promise<CloudMemory> {
  const parsed = createCloudMemorySchema.parse(input);
  const connection = await openConfiguredCloudDatabase();
  try {
    const [memory] = await connection.db.insert(cloudMemories).values({
      projectId,
      type: parsed.type,
      content: parsed.content,
      status: "active",
      importance: parsed.importance,
      agent: parsed.agent ?? "agent",
      sessionId: parsed.sessionId ?? null,
    }).returning();
    if (!memory) throw new Error("Could not persist memory.");
    return {
      id: memory.id,
      projectId: memory.projectId,
      type: memory.type,
      content: memory.content,
      status: memory.status,
      importance: memory.importance,
      agent: memory.agent,
      sessionId: memory.sessionId,
      createdAt: memory.createdAt.toISOString(),
    };
  } finally {
    await connection.close();
  }
}

export async function createAgentConnection(
  identity: AuthIdentity,
  projectId: string,
  name: string,
): Promise<{ connection: AgentConnection; token: string }> {
  const parsed = createAgentConnectionSchema.parse({ name });
  const connection = await openConfiguredCloudDatabase();
  try {
    await authorizedProject(connection, identity, projectId);
    const token = `harikos_${randomBytes(32).toString("base64url")}`;
    const [record] = await connection.db.insert(cloudAgentConnections).values({
      projectId,
      name: parsed.name,
      tokenHash: hashAgentToken(token),
      tokenPrefix: token.slice(0, 16),
    }).returning();
    if (!record) throw new Error("Could not create agent connection.");
    return {
      token,
      connection: {
        id: record.id,
        projectId: record.projectId,
        name: record.name,
        tokenPrefix: record.tokenPrefix,
        revokedAt: null,
        lastUsedAt: null,
        createdAt: record.createdAt.toISOString(),
      },
    };
  } finally {
    await connection.close();
  }
}

export async function listAgentConnections(
  identity: AuthIdentity,
  projectId: string,
): Promise<AgentConnection[]> {
  const connection = await openConfiguredCloudDatabase();
  try {
    await authorizedProject(connection, identity, projectId);
    const records = await connection.db.select().from(cloudAgentConnections)
      .where(eq(cloudAgentConnections.projectId, projectId));
    return records.map((record) => ({
      id: record.id,
      projectId: record.projectId,
      name: record.name,
      tokenPrefix: record.tokenPrefix,
      revokedAt: record.revokedAt?.toISOString() ?? null,
      lastUsedAt: record.lastUsedAt?.toISOString() ?? null,
      createdAt: record.createdAt.toISOString(),
    }));
  } finally {
    await connection.close();
  }
}

export async function revokeAgentConnection(identity: AuthIdentity, projectId: string, connectionId: string): Promise<void> {
  const connection = await openConfiguredCloudDatabase();
  try {
    await authorizedProject(connection, identity, projectId);
    await connection.db.update(cloudAgentConnections)
      .set({ revokedAt: new Date() })
      .where(and(eq(cloudAgentConnections.id, connectionId), eq(cloudAgentConnections.projectId, projectId)));
  } finally {
    await connection.close();
  }
}

export async function authenticateAgentToken(token: string): Promise<{ projectId: string; connectionId: string } | undefined> {
  const connection = await openConfiguredCloudDatabase();
  try {
    const [record] = await connection.db.select({
      id: cloudAgentConnections.id,
      projectId: cloudAgentConnections.projectId,
    }).from(cloudAgentConnections).where(and(eq(cloudAgentConnections.tokenHash, hashAgentToken(token)), isNull(cloudAgentConnections.revokedAt)));
    if (!record) return undefined;
    await connection.db.update(cloudAgentConnections).set({ lastUsedAt: new Date() }).where(eq(cloudAgentConnections.id, record.id));
    return { projectId: record.projectId, connectionId: record.id };
  } finally {
    await connection.close();
  }
}

export async function beginAgentSession(projectId: string, connectionId: string, task?: string) {
  const connection = await openConfiguredCloudDatabase();
  try {
    const [session] = await connection.db.insert(cloudAgentSessions).values({
      projectId,
      agentConnectionId: connectionId,
      task: task ?? null,
      status: "active",
      metadata: {},
    }).returning();
    if (!session) throw new Error("Could not start agent session.");
    return session;
  } finally { await connection.close(); }
}

export async function finishAgentSession(projectId: string, connectionId: string, sessionId: string, status: "completed" | "failed" | "abandoned") {
  const connection = await openConfiguredCloudDatabase();
  try {
    const [session] = await connection.db.update(cloudAgentSessions).set({ status, endedAt: new Date() }).where(and(eq(cloudAgentSessions.id, sessionId), eq(cloudAgentSessions.projectId, projectId), eq(cloudAgentSessions.agentConnectionId, connectionId))).returning();
    if (!session) throw new Error("Agent session not found.");
    return session;
  } finally { await connection.close(); }
}

export async function recordAgentOutcome(projectId: string, connectionId: string, sessionId: string, input: z.input<typeof outcomeSchema>) {
  const parsed = outcomeSchema.parse(input);
  const connection = await openConfiguredCloudDatabase();
  try {
    const [session] = await connection.db.select().from(cloudAgentSessions).where(and(eq(cloudAgentSessions.id, sessionId), eq(cloudAgentSessions.projectId, projectId), eq(cloudAgentSessions.agentConnectionId, connectionId)));
    if (!session) throw new Error("Agent session not found.");
    const [outcome] = await connection.db.insert(cloudOutcomes).values({ projectId, sessionId, summary: parsed.summary, status: parsed.status, metadata: parsed.metadata }).returning();
    if (!outcome) throw new Error("Could not persist outcome.");
    await connection.db.insert(cloudMemories).values({ projectId, type: "outcome", content: parsed.summary, status: "active", importance: parsed.status === "success" ? 0.7 : 0.8, agent: "remote-agent", sessionId });
    return outcome;
  } finally { await connection.close(); }
}

async function loadCloudSnapshotInternal(
  identity: AuthIdentity | undefined,
  projectId: string,
): Promise<ProjectSnapshot | undefined> {
  const config = readCloudDatabaseConfig();
  if (!config) {
    return undefined;
  }
  const connection = await openCloudDatabase(config, { migrate: false });
  try {
    const project = await authorizedProject(connection, identity, projectId);
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

export async function loadCloudSnapshot(
  identity: AuthIdentity,
  projectId: string,
): Promise<ProjectSnapshot | undefined> {
  return loadCloudSnapshotInternal(identity, projectId);
}

export async function loadCloudSnapshotForAgent(projectId: string): Promise<ProjectSnapshot | undefined> {
  return loadCloudSnapshotInternal(undefined, projectId);
}
