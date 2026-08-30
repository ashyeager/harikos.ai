import { openHarikosDatabase, type Claim, type HarikosStore } from "@harikos/db";

import {
  projectSnapshotSchema,
  projectTruthClaimSchema,
  type CandidateEvidence,
  type ProjectSnapshot,
  type ProjectTruthClaim,
  type ScannedSource,
} from "./domain.js";
import { extractDeterministicClaims } from "./analyzer.js";
import { initializeProject } from "./initialize.js";
import { LocalRepositorySource, type RepositorySource } from "./repository-source.js";
import { scanRepository } from "./scanner.js";
import { resolveTruth } from "./truth-engine.js";

function toCanonicalStatus(status: Claim["status"]): ProjectTruthClaim["status"] {
  switch (status) {
    case "current":
      return "verified";
    case "historical":
      return "stale";
    case "candidate":
      return "uncertain";
    default:
      return status;
  }
}

function toLegacyStatus(status: ProjectTruthClaim["status"]): Claim["status"] {
  switch (status) {
    case "verified":
    case "likely":
      return "current";
    case "stale":
      return "historical";
    default:
      return status;
  }
}

function previousTruths(store: HarikosStore, projectId: string): ProjectTruthClaim[] {
  return store.claims.listByProject(projectId).map((claim) => {
    const evidence: CandidateEvidence[] = store.evidence.listByClaim(claim.id).flatMap((item) => {
      const source = store.sources.findById(item.sourceId);
      if (!source?.path) {
        return [];
      }
      return [{
        sourceType: source.type === "manifest" || source.type === "config" || source.type === "documentation" || source.type === "git_commit" ? source.type : "file",
        path: item.path ?? source.path,
        contentHash: source.contentHash,
        commitSha: typeof source.metadata === "object" && source.metadata !== null && !Array.isArray(source.metadata) && typeof source.metadata.commitSha === "string" ? source.metadata.commitSha : "unknown",
        lineStart: item.lineStart,
        lineEnd: item.lineEnd,
        excerpt: item.excerpt,
        authority: item.strength,
        observedAt: source.observedAt,
      }];
    });
    return projectTruthClaimSchema.parse({
      id: claim.id,
      category: claim.subject === "authentication" ? "Authentication" : "Project",
      subject: claim.subject,
      predicate: claim.predicate,
      value: typeof claim.value === "string" ? claim.value : JSON.stringify(claim.value),
      scope: claim.scope,
      epistemicType: claim.epistemicType,
      claimKind: claim.claimKind,
      confidence: claim.confidence,
      status: toCanonicalStatus(claim.status),
      validFrom: claim.validFrom,
      validTo: claim.validTo,
      firstSeenAt: claim.createdAt,
      lastVerifiedAt: claim.updatedAt,
      supersedesClaimId: null,
      evidence,
    });
  });
}

function persistSources(
  store: HarikosStore,
  projectId: string,
  sources: ScannedSource[],
): Map<string, string> {
  const sourceIds = new Map<string, string>();
  for (const source of sources) {
    const existing = store.sources.findByIdentity(
      projectId,
      source.kind,
      source.path,
      source.contentHash,
    );
    const record =
      existing ??
      store.sources.create({
        projectId,
        type: source.kind,
        path: source.path,
        contentHash: source.contentHash,
        observedAt: source.observedAt,
        metadata: { commitSha: source.commitSha },
      });
    sourceIds.set(`${source.path}::${source.contentHash}`, record.id);
  }
  return sourceIds;
}

function persistResolution(
  store: HarikosStore,
  projectId: string,
  resolution: ReturnType<typeof resolveTruth>,
  sourceIds: Map<string, string>,
): void {
  const existingClaims = new Map(
    store.claims.listByProject(projectId).map((claim) => [claim.id, claim]),
  );
  for (const truth of resolution.truths) {
    const existing = existingClaims.get(truth.id);
    if (existing) {
      store.claims.update(existing.id, {
        status: toLegacyStatus(truth.status),
        confidence: truth.confidence,
        validTo: truth.validTo,
        updatedAt: truth.lastVerifiedAt,
      });
    } else {
      store.claims.create({
        id: truth.id,
        projectId,
        subject: truth.subject,
        predicate: truth.predicate,
        value: truth.value,
        scope: truth.scope,
        status: toLegacyStatus(truth.status),
        epistemicType: truth.epistemicType,
        claimKind: truth.claimKind,
        confidence: truth.confidence,
        validFrom: truth.validFrom,
        validTo: truth.validTo,
        createdAt: truth.firstSeenAt,
        updatedAt: truth.lastVerifiedAt,
      });
    }
    const existingEvidence = store.evidence.listByClaim(truth.id);
    for (const evidence of truth.evidence) {
      const sourceId = sourceIds.get(`${evidence.path}::${evidence.contentHash}`);
      if (!sourceId || existingEvidence.some((item) => item.sourceId === sourceId && item.lineStart === evidence.lineStart)) {
        continue;
      }
      store.evidence.create({
        claimId: truth.id,
        sourceId,
        path: evidence.path,
        lineStart: evidence.lineStart,
        lineEnd: evidence.lineEnd,
        excerpt: evidence.excerpt,
        strength: evidence.authority,
        createdAt: evidence.observedAt,
      });
    }
  }

  const existingContradictions = store.contradictions.listByProject(projectId);
  for (const contradiction of resolution.contradictions) {
    if (
      existingContradictions.some(
        (item) =>
          item.claimAId === contradiction.claimAId &&
          item.claimBId === contradiction.claimBId,
      )
    ) {
      continue;
    }
    const record = store.contradictions.create({
      id: contradiction.id,
      projectId,
      claimAId: contradiction.claimAId,
      claimBId: contradiction.claimBId,
      status: contradiction.status,
      reason: contradiction.reason,
      resolution: contradiction.resolution,
      createdAt: contradiction.createdAt,
      resolvedAt: contradiction.status === "resolved" ? contradiction.createdAt : null,
    });
    if (contradiction.status === "resolved" && contradiction.resolution) {
      store.resolutions.create({
        contradictionId: record.id,
        resolutionType: "human_override",
        chosenClaimId: contradiction.claimAId,
        reason: contradiction.resolution,
        actor: "harikos:truth-engine",
        createdAt: contradiction.createdAt,
      });
    }
  }

  const existingEvents = store.events.listByProject(projectId);
  for (const change of resolution.changes) {
    if (
      existingEvents.some(
        (event) =>
          event.type === "truth_changed" &&
          typeof event.payload === "object" &&
          event.payload !== null &&
          !Array.isArray(event.payload) &&
          event.payload.changeId === change.id,
      )
    ) {
      continue;
    }
    store.events.create({
      projectId,
      type: "truth_changed",
      timestamp: change.createdAt,
      payload: {
        changeId: change.id,
        category: change.category,
        summary: change.summary,
        previousValue: change.previousValue,
        currentValue: change.currentValue,
        commitSha: change.commitSha,
      },
    });
  }
}

export async function analyzeRepository(
  source: RepositorySource,
  previous: ProjectTruthClaim[] = [],
  options: { clock?: () => Date; mode?: ProjectSnapshot["mode"] } = {},
): Promise<ProjectSnapshot> {
  const clock = options.clock ?? (() => new Date());
  const [metadata, sources] = await Promise.all([
    source.getMetadata(),
    scanRepository(source, { clock }),
  ]);
  const scannedAt = clock().toISOString();
  const candidates = extractDeterministicClaims(sources);
  const resolution = resolveTruth(previous, candidates, scannedAt, metadata.headSha);
  return projectSnapshotSchema.parse({
    projectId: metadata.id,
    repository: metadata,
    scannedAt,
    sourceCount: sources.length,
    truths: resolution.truths,
    contradictions: resolution.contradictions,
    changes: resolution.changes,
    mode: options.mode ?? metadata.sourceType,
  });
}

export async function scanAndPersistLocalProject(
  projectRoot: string,
  options: { clock?: () => Date } = {},
): Promise<ProjectSnapshot> {
  const initialized = initializeProject({ cwd: projectRoot, ...(options.clock ? { clock: options.clock } : {}) });
  const store = openHarikosDatabase({
    databasePath: initialized.databasePath,
    ...(options.clock ? { clock: options.clock } : {}),
  });
  try {
    const source = new LocalRepositorySource(projectRoot);
    const metadata = await source.getMetadata();
    const scannedSources = await scanRepository(source, {
      ...(options.clock ? { clock: options.clock } : {}),
    });
    const scannedAt = (options.clock ?? (() => new Date()))().toISOString();
    const candidates = extractDeterministicClaims(scannedSources);
    const resolution = resolveTruth(
      previousTruths(store, initialized.project.id),
      candidates,
      scannedAt,
      metadata.headSha,
    );
    const sourceIds = persistSources(store, initialized.project.id, scannedSources);
    persistResolution(store, initialized.project.id, resolution, sourceIds);
    store.projects.setLastScannedAt(initialized.project.id, scannedAt);
    return projectSnapshotSchema.parse({
      projectId: initialized.project.id,
      repository: metadata,
      scannedAt,
      sourceCount: scannedSources.length,
      truths: resolution.truths,
      contradictions: resolution.contradictions,
      changes: resolution.changes,
      mode: "local",
    });
  } finally {
    store.close();
  }
}
