import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import {
  cloudClaims,
  cloudContradictions,
  cloudEvidence,
  cloudProjectChanges,
  cloudProjects,
  cloudRepositories,
  cloudRepositoryInstallations,
  cloudScans,
  cloudUsers,
  eq,
  openCloudDatabase,
  readCloudDatabaseConfig,
} from "@harikos/db";
import {
  analyzeRepository,
  composeContextPack,
  GitHubRepositorySource,
  type ProjectSnapshot,
} from "@harikos/core";

import {
  authenticateAgentToken,
  beginAgentSession,
  createAgentConnection,
  createCloudMemory,
  finishAgentSession,
  listAgentMemories,
  listCloudMemories,
  listCloudProjects,
  loadCloudSnapshot,
  revokeAgentConnection,
  saveCloudContextPack,
  type AgentConnection,
} from "../apps/web/lib/cloud-projects";
import type { AuthIdentity } from "../apps/web/lib/auth";

const config = readCloudDatabaseConfig();
const githubToken = process.env.HARIKOS_ACCEPTANCE_GITHUB_TOKEN?.trim();
const acceptanceBaseUrl =
  process.env.HARIKOS_ACCEPTANCE_BASE_URL?.trim() ?? "http://127.0.0.1:3000";
if (!config) throw new Error("Cloud database configuration is missing.");
if (!githubToken) throw new Error("HARIKOS_ACCEPTANCE_GITHUB_TOKEN is missing.");

async function callMcp(
  projectId: string,
  token: string,
  body: Record<string, unknown>,
  expectedStatus = 200,
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `${acceptanceBaseUrl}/api/mcp/${encodeURIComponent(projectId)}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  assert.equal(response.status, expectedStatus);
  return (await response.json()) as Record<string, unknown>;
}

function mcpText(response: Record<string, unknown>): string {
  const result = response.result as
    | { content?: Array<{ type?: string; text?: string }> }
    | undefined;
  const text = result?.content?.find((item) => item.type === "text")?.text;
  assert.ok(text, "MCP response must contain text content.");
  return text;
}

const runId = randomUUID();
const identityA: AuthIdentity = {
  id: `acceptance-a-${runId}`,
  githubUserId: null,
  login: "acceptance-a",
  email: null,
  displayName: "Acceptance User A",
  avatarUrl: null,
  provider: "google",
};
const identityB: AuthIdentity = {
  id: `acceptance-b-${runId}`,
  githubUserId: null,
  login: "acceptance-b",
  email: null,
  displayName: "Acceptance User B",
  avatarUrl: null,
  provider: "google",
};

async function cleanupRun(): Promise<void> {
  const cleanup = await openCloudDatabase(config, { migrate: false });
  try {
    for (const identity of [identityA, identityB]) {
      const [user] = await cleanup.db
        .select({ id: cloudUsers.id })
        .from(cloudUsers)
        .where(eq(cloudUsers.supabaseUserId, identity.id))
        .limit(1);
      if (!user) continue;
      await cleanup.db
        .delete(cloudProjects)
        .where(eq(cloudProjects.ownerId, user.id));
      await cleanup.db
        .delete(cloudUsers)
        .where(eq(cloudUsers.id, user.id));
    }
  } finally {
    await cleanup.close();
  }
}

const source = new GitHubRepositorySource({
  owner: "ashyeager",
  repository: "HARIKOS-AI",
  tokenProvider: async () => githubToken,
});
const analyzed = await analyzeRepository(source, [], { mode: "github" });
assert.ok(analyzed.truths.length > 0, "The real repository must produce Truth.");
assert.ok(
  analyzed.truths.some((claim) => claim.evidence.length > 0),
  "The real repository must produce Evidence.",
);

const connection = await openCloudDatabase(config, { migrate: false });
let projectAId: string | undefined;
let projectBId: string | undefined;
try {
  const [userA, userB] = await connection.db
    .insert(cloudUsers)
    .values([
      { supabaseUserId: identityA.id, login: identityA.login },
      { supabaseUserId: identityB.id, login: identityB.login },
    ])
    .returning();
  assert.ok(userA && userB);

  const [installationA, installationB] = await connection.db
    .insert(cloudRepositoryInstallations)
    .values([
      {
        ownerId: userA.id,
        installationId: `91${runId.replaceAll("-", "").slice(0, 14)}`,
        accountId: "1",
        accountLogin: "ashyeager",
        accountType: "User",
        repositorySelection: "selected",
      },
      {
        ownerId: userB.id,
        installationId: `92${runId.replaceAll("-", "").slice(0, 14)}`,
        accountId: "2",
        accountLogin: "acceptance-b",
        accountType: "User",
        repositorySelection: "selected",
      },
    ])
    .returning();
  assert.ok(installationA && installationB);

  const [projectA, projectB] = await connection.db
    .insert(cloudProjects)
    .values([
      { ownerId: userA.id, name: analyzed.repository.name },
      { ownerId: userB.id, name: "private-user-b-project" },
    ])
    .returning();
  assert.ok(projectA && projectB);
  projectAId = projectA.id;
  projectBId = projectB.id;

  const acceptanceRepositoryId = `93${runId.replaceAll("-", "").slice(0, 14)}`;
  await connection.db.insert(cloudRepositories).values([
    {
      projectId: projectA.id,
      installationId: installationA.id,
      githubRepositoryId: acceptanceRepositoryId,
      owner: analyzed.repository.owner ?? "ashyeager",
      name: analyzed.repository.name,
      defaultBranch: analyzed.repository.defaultBranch,
      private: analyzed.repository.visibility === "private",
      lastCommitSha: analyzed.repository.headSha,
    },
    {
      projectId: projectB.id,
      installationId: installationB.id,
      githubRepositoryId: `99${runId.replaceAll("-", "").slice(0, 14)}`,
      owner: "acceptance-b",
      name: "private-user-b-project",
      defaultBranch: "main",
      private: true,
      lastCommitSha: "acceptance-b-sha",
    },
  ]);

  const [scan] = await connection.db
    .insert(cloudScans)
    .values({
      projectId: projectA.id,
      status: "completed",
      commitSha: analyzed.repository.headSha,
      completedAt: new Date(analyzed.scannedAt),
    })
    .returning();
  assert.ok(scan);

  const idMap = new Map(
    analyzed.truths.map((claim) => [claim.id, `${projectA.id}:${claim.id}`]),
  );
  for (const truth of analyzed.truths) {
    const claimId = idMap.get(truth.id)!;
    await connection.db.insert(cloudClaims).values({
      id: claimId,
      projectId: projectA.id,
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
      supersedesClaimId: truth.supersedesClaimId
        ? idMap.get(truth.supersedesClaimId) ?? null
        : null,
    });
    for (const evidence of truth.evidence) {
      await connection.db.insert(cloudEvidence).values({
        claimId,
        projectId: projectA.id,
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
  for (const contradiction of analyzed.contradictions) {
    await connection.db.insert(cloudContradictions).values({
      id: `${projectA.id}:${contradiction.id}`,
      projectId: projectA.id,
      claimAId: idMap.get(contradiction.claimAId) ?? `${projectA.id}:${contradiction.claimAId}`,
      claimBId: idMap.get(contradiction.claimBId) ?? `${projectA.id}:${contradiction.claimBId}`,
      status: contradiction.status,
      reason: contradiction.reason,
      resolution: contradiction.resolution,
      createdAt: new Date(contradiction.createdAt),
    });
  }
  for (const change of analyzed.changes) {
    await connection.db.insert(cloudProjectChanges).values({
      id: `${projectA.id}:${change.id}`,
      projectId: projectA.id,
      scanId: scan.id,
      category: change.category,
      summary: change.summary,
      commitSha: change.commitSha,
      createdAt: new Date(change.createdAt),
    });
  }
} catch (error) {
  await cleanupRun();
  throw error;
} finally {
  await connection.close();
}

assert.ok(projectAId && projectBId);
let agentA: { connection: AgentConnection; token: string } | undefined;
let agentB: { connection: AgentConnection; token: string } | undefined;
try {
  const projectsA = await listCloudProjects(identityA);
  assert.deepEqual(projectsA.map((project) => project.id), [projectAId]);

  const snapshot = await loadCloudSnapshot(identityA, projectAId);
  assert.ok(snapshot);
  assert.ok(snapshot.truths.length > 0);
  assert.ok(snapshot.truths.some((truth) => truth.evidence.length > 0));

  await assert.rejects(() => loadCloudSnapshot(identityA, projectBId));
  await assert.rejects(() => listCloudMemories(identityB, projectAId));

  agentA = await createAgentConnection(identityA, projectAId, "Acceptance Agent A");
  agentB = await createAgentConnection(identityA, projectAId, "Acceptance Agent B");
  const authenticatedA = await authenticateAgentToken(agentA.token);
  assert.deepEqual(authenticatedA, {
    projectId: projectAId,
    connectionId: agentA.connection.id,
  });
  assert.notEqual(authenticatedA.projectId, projectBId);

  const initialized = await callMcp(projectAId, agentA.token, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
  });
  assert.equal(
    (initialized.result as { protocolVersion?: string }).protocolVersion,
    "2025-06-18",
  );
  const listed = await callMcp(projectAId, agentA.token, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
  });
  assert.ok(
    (listed.result as { tools?: Array<{ name?: string }> }).tools?.some(
      (tool) => tool.name === "get_context_pack",
    ),
  );
  const truthResponse = await callMcp(projectAId, agentA.token, {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "get_project_truth", arguments: {} },
  });
  assert.ok(JSON.parse(mcpText(truthResponse)) as unknown[]);
  await callMcp(
    projectBId,
    agentA.token,
    { jsonrpc: "2.0", id: 4, method: "initialize" },
    401,
  );
  await callMcp(
    projectAId,
    `invalid-${randomUUID()}`,
    { jsonrpc: "2.0", id: 5, method: "initialize" },
    401,
  );

  const sessionAResponse = await callMcp(projectAId, agentA.token, {
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "begin_agent_session",
      arguments: { task: "Modify subscription flow" },
    },
  });
  const sessionA = JSON.parse(mcpText(sessionAResponse)) as { id: string };
  await callMcp(projectAId, agentA.token, {
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "record_memory",
      arguments: {
        type: "failed_attempt",
        content:
          "Browser-side subscription creation failed because privileged credentials were required.",
        sessionId: sessionA.id,
      },
    },
  });
  await callMcp(projectAId, agentA.token, {
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "record_memory",
      arguments: {
        type: "decision",
        content: "Subscription creation stays server-side.",
        sessionId: sessionA.id,
      },
    },
  });
  await callMcp(projectAId, agentA.token, {
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: {
      name: "record_outcome",
      arguments: {
        sessionId: sessionA.id,
        summary: "Server-side implementation succeeded.",
        status: "success",
        metadata: { acceptance: true },
      },
    },
  });
  await callMcp(projectAId, agentA.token, {
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: {
      name: "end_agent_session",
      arguments: { sessionId: sessionA.id, status: "completed" },
    },
  });

  const authenticatedB = await authenticateAgentToken(agentB.token);
  assert.equal(authenticatedB?.projectId, projectAId);
  const sessionB = await beginAgentSession(
    projectAId,
    agentB.connection.id,
    "Modify subscription flow",
  );
  const memories = await listAgentMemories(projectAId);
  const context = composeContextPack(
    snapshot as ProjectSnapshot,
    "Modify subscription flow",
    () => new Date(),
    memories,
  );
  assert.match(context.text, /CURRENT TRUTH/u);
  assert.match(context.text, /Browser-side subscription creation failed/u);
  assert.match(context.text, /Subscription creation stays server-side/u);
  assert.match(context.text, /Server-side implementation succeeded/u);
  assert.ok(context.relevantFiles.length > 0);
  const remoteContext = await callMcp(projectAId, agentB.token, {
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: {
      name: "get_context_pack",
      arguments: { task: "Modify subscription flow" },
    },
  });
  assert.match(mcpText(remoteContext), /Subscription creation stays server-side/u);
  await saveCloudContextPack(identityA, projectAId, context);
  await finishAgentSession(
    projectAId,
    agentB.connection.id,
    sessionB.id,
    "completed",
  );

  const manualMemory = await createCloudMemory(identityA, projectAId, {
    type: "note",
    content: "Fresh-request persistence acceptance note.",
  });
  const freshRead = await listCloudMemories(identityA, projectAId);
  assert.ok(freshRead.some((memory) => memory.id === manualMemory.id));

  await assert.rejects(() =>
    revokeAgentConnection(identityB, projectAId, agentA!.connection.id),
  );
  await revokeAgentConnection(identityA, projectAId, agentA.connection.id);
  assert.equal(await authenticateAgentToken(agentA.token), undefined);
  await callMcp(
    projectAId,
    agentA.token,
    { jsonrpc: "2.0", id: 12, method: "initialize" },
    401,
  );

  process.stdout.write(
    `${JSON.stringify(
      {
        realRepository: `${analyzed.repository.owner}/${analyzed.repository.name}`,
        realCommit: analyzed.repository.headSha.slice(0, 12),
        analyzedSources: analyzed.sourceCount,
        persistedTruth: snapshot.truths.length,
        persistedEvidence: snapshot.truths.reduce(
          (total, truth) => total + truth.evidence.length,
          0,
        ),
        ownershipNegativeTest: "passed",
        memoryFreshRead: "passed",
        mcpStreamableHttp: "passed",
        validToken: "passed",
        revokedToken: "passed",
        wrongProjectBoundary: "passed",
        agentSessions: "passed",
        outcomeWriteBack: "passed",
        crossAgentHandoff: "passed",
        currentTruthPrecedesMemory: context.truths.every(
          (truth) => truth.status === "verified" || truth.status === "likely",
        ),
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await cleanupRun();
}
