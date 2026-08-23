import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";
import { and, asc, eq, isNull } from "drizzle-orm";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { z } from "zod";

import {
  createAgentSessionSchema,
  createClaimSchema,
  createContextPackSchema,
  createContradictionSchema,
  createEventSchema,
  createEvidenceSchema,
  createMemorySchema,
  createOutcomeSchema,
  createProjectSchema,
  createResolutionSchema,
  createSourceSchema,
  updateClaimSchema,
  type AgentSessionRepository,
  type ClaimRepository,
  type ContextPackRepository,
  type ContradictionRepository,
  type EventRepository,
  type EvidenceRepository,
  type HarikosStore,
  type MemoryRepository,
  type OutcomeRepository,
  type ProjectRepository,
  type ResolutionRepository,
  type SourceRepository,
} from "./contracts.js";
import * as schema from "./schema.js";

const timestampSchema = z.string().datetime({ offset: true });
function defaultMigrationsFolder(): string {
  const moduleDirectory = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(moduleDirectory, "../drizzle"),
    resolve(process.cwd(), "packages/db/drizzle"),
    resolve(process.cwd(), "../../packages/db/drizzle"),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]!;
}

export interface OpenHarikosDatabaseOptions {
  databasePath: string;
  migrationsFolder?: string;
  clock?: () => Date;
  idFactory?: () => string;
}

export class PersistenceNotFoundError extends Error {
  readonly code = "PERSISTENCE_NOT_FOUND";

  constructor(entity: string, id: string) {
    super(`${entity} '${id}' was not found.`);
    this.name = "PersistenceNotFoundError";
  }
}

type HarikosDrizzleDatabase = BetterSQLite3Database<typeof schema>;

class SqliteHarikosStore implements HarikosStore {
  readonly projects: ProjectRepository;
  readonly sources: SourceRepository;
  readonly events: EventRepository;
  readonly claims: ClaimRepository;
  readonly evidence: EvidenceRepository;
  readonly contradictions: ContradictionRepository;
  readonly resolutions: ResolutionRepository;
  readonly memories: MemoryRepository;
  readonly agentSessions: AgentSessionRepository;
  readonly outcomes: OutcomeRepository;
  readonly contextPacks: ContextPackRepository;

  constructor(
    private readonly client: Database.Database,
    private readonly db: HarikosDrizzleDatabase,
    private readonly now: () => string,
    private readonly nextId: () => string,
  ) {
    this.projects = this.createProjectRepository();
    this.sources = this.createSourceRepository();
    this.events = this.createEventRepository();
    this.claims = this.createClaimRepository();
    this.evidence = this.createEvidenceRepository();
    this.contradictions = this.createContradictionRepository();
    this.resolutions = this.createResolutionRepository();
    this.memories = this.createMemoryRepository();
    this.agentSessions = this.createAgentSessionRepository();
    this.outcomes = this.createOutcomeRepository();
    this.contextPacks = this.createContextPackRepository();
  }

  close(): void {
    this.client.close();
  }

  private createProjectRepository(): ProjectRepository {
    return {
      register: (input) => {
        const parsed = createProjectSchema.parse(input);
        const existing = this.db
          .select()
          .from(schema.projects)
          .where(eq(schema.projects.path, parsed.path))
          .get();

        if (existing) {
          if (
            existing.name !== parsed.name ||
            (parsed.lastScannedAt !== undefined &&
              existing.lastScannedAt !== parsed.lastScannedAt)
          ) {
            return this.db
              .update(schema.projects)
              .set({
                name: parsed.name,
                ...(parsed.lastScannedAt !== undefined
                  ? { lastScannedAt: parsed.lastScannedAt }
                  : {}),
              })
              .where(eq(schema.projects.id, existing.id))
              .returning()
              .get();
          }

          return existing;
        }

        return this.db
          .insert(schema.projects)
          .values({
            id: parsed.id ?? this.nextId(),
            name: parsed.name,
            path: parsed.path,
            createdAt: parsed.createdAt ?? this.now(),
            lastScannedAt: parsed.lastScannedAt ?? null,
          })
          .returning()
          .get();
      },
      findById: (id) =>
        this.db
          .select()
          .from(schema.projects)
          .where(eq(schema.projects.id, id))
          .get(),
      findByPath: (path) =>
        this.db
          .select()
          .from(schema.projects)
          .where(eq(schema.projects.path, path))
          .get(),
      list: () =>
        this.db
          .select()
          .from(schema.projects)
          .orderBy(asc(schema.projects.createdAt))
          .all(),
      setLastScannedAt: (id, timestamp) => {
        if (timestamp !== null) {
          timestampSchema.parse(timestamp);
        }

        const updated = this.db
          .update(schema.projects)
          .set({ lastScannedAt: timestamp })
          .where(eq(schema.projects.id, id))
          .returning()
          .get();

        if (!updated) {
          throw new PersistenceNotFoundError("Project", id);
        }

        return updated;
      },
    };
  }

  private createSourceRepository(): SourceRepository {
    return {
      create: (input) => {
        const parsed = createSourceSchema.parse(input);
        return this.db
          .insert(schema.sources)
          .values({
            id: parsed.id ?? this.nextId(),
            projectId: parsed.projectId,
            type: parsed.type,
            path: parsed.path ?? null,
            contentHash: parsed.contentHash,
            observedAt: parsed.observedAt ?? this.now(),
            metadata: parsed.metadata,
          })
          .returning()
          .get();
      },
      findById: (id) =>
        this.db
          .select()
          .from(schema.sources)
          .where(eq(schema.sources.id, id))
          .get(),
      findByIdentity: (projectId, type, path, contentHash) =>
        this.db
          .select()
          .from(schema.sources)
          .where(
            and(
              eq(schema.sources.projectId, projectId),
              eq(schema.sources.type, type),
              path === null
                ? isNull(schema.sources.path)
                : eq(schema.sources.path, path),
              eq(schema.sources.contentHash, contentHash),
            ),
          )
          .get(),
      listByProject: (projectId) =>
        this.db
          .select()
          .from(schema.sources)
          .where(eq(schema.sources.projectId, projectId))
          .orderBy(asc(schema.sources.observedAt))
          .all(),
    };
  }

  private createEventRepository(): EventRepository {
    return {
      create: (input) => {
        const parsed = createEventSchema.parse(input);
        return this.db
          .insert(schema.events)
          .values({
            id: parsed.id ?? this.nextId(),
            projectId: parsed.projectId,
            type: parsed.type,
            timestamp: parsed.timestamp ?? this.now(),
            sourceId: parsed.sourceId ?? null,
            payload: parsed.payload,
          })
          .returning()
          .get();
      },
      listByProject: (projectId) =>
        this.db
          .select()
          .from(schema.events)
          .where(eq(schema.events.projectId, projectId))
          .orderBy(asc(schema.events.timestamp))
          .all(),
    };
  }

  private createClaimRepository(): ClaimRepository {
    return {
      create: (input) => {
        const parsed = createClaimSchema.parse(input);
        const now = this.now();
        return this.db
          .insert(schema.claims)
          .values({
            id: parsed.id ?? this.nextId(),
            projectId: parsed.projectId,
            subject: parsed.subject,
            predicate: parsed.predicate,
            value: parsed.value,
            scope: parsed.scope ?? null,
            status: parsed.status,
            epistemicType: parsed.epistemicType,
            claimKind: parsed.claimKind,
            confidence: parsed.confidence,
            validFrom: parsed.validFrom ?? now,
            validTo: parsed.validTo ?? null,
            createdAt: parsed.createdAt ?? now,
            updatedAt: parsed.updatedAt ?? now,
          })
          .returning()
          .get();
      },
      findById: (id) =>
        this.db
          .select()
          .from(schema.claims)
          .where(eq(schema.claims.id, id))
          .get(),
      listByProject: (projectId) =>
        this.db
          .select()
          .from(schema.claims)
          .where(eq(schema.claims.projectId, projectId))
          .orderBy(asc(schema.claims.createdAt))
          .all(),
      update: (id, input) => {
        const parsed = updateClaimSchema.parse(input);
        const updated = this.db
          .update(schema.claims)
          .set({
            ...(parsed.status !== undefined ? { status: parsed.status } : {}),
            ...(parsed.confidence !== undefined
              ? { confidence: parsed.confidence }
              : {}),
            ...(parsed.validTo !== undefined ? { validTo: parsed.validTo } : {}),
            updatedAt: parsed.updatedAt ?? this.now(),
          })
          .where(eq(schema.claims.id, id))
          .returning()
          .get();

        if (!updated) {
          throw new PersistenceNotFoundError("Claim", id);
        }

        return updated;
      },
    };
  }

  private createEvidenceRepository(): EvidenceRepository {
    return {
      create: (input) => {
        const parsed = createEvidenceSchema.parse(input);
        return this.db
          .insert(schema.evidence)
          .values({
            id: parsed.id ?? this.nextId(),
            claimId: parsed.claimId,
            sourceId: parsed.sourceId,
            path: parsed.path ?? null,
            lineStart: parsed.lineStart ?? null,
            lineEnd: parsed.lineEnd ?? null,
            excerpt: parsed.excerpt ?? null,
            strength: parsed.strength,
            createdAt: parsed.createdAt ?? this.now(),
          })
          .returning()
          .get();
      },
      listByClaim: (claimId) =>
        this.db
          .select()
          .from(schema.evidence)
          .where(eq(schema.evidence.claimId, claimId))
          .orderBy(asc(schema.evidence.createdAt))
          .all(),
    };
  }

  private createContradictionRepository(): ContradictionRepository {
    return {
      create: (input) => {
        const parsed = createContradictionSchema.parse(input);
        return this.db
          .insert(schema.contradictions)
          .values({
            id: parsed.id ?? this.nextId(),
            projectId: parsed.projectId,
            claimAId: parsed.claimAId,
            claimBId: parsed.claimBId,
            status: parsed.status,
            reason: parsed.reason,
            resolution: parsed.resolution ?? null,
            createdAt: parsed.createdAt ?? this.now(),
            resolvedAt: parsed.resolvedAt ?? null,
          })
          .returning()
          .get();
      },
      listByProject: (projectId) =>
        this.db
          .select()
          .from(schema.contradictions)
          .where(eq(schema.contradictions.projectId, projectId))
          .orderBy(asc(schema.contradictions.createdAt))
          .all(),
    };
  }

  private createResolutionRepository(): ResolutionRepository {
    return {
      create: (input) => {
        const parsed = createResolutionSchema.parse(input);
        return this.db
          .insert(schema.resolutions)
          .values({
            id: parsed.id ?? this.nextId(),
            contradictionId: parsed.contradictionId,
            resolutionType: parsed.resolutionType,
            chosenClaimId: parsed.chosenClaimId ?? null,
            reason: parsed.reason,
            actor: parsed.actor,
            createdAt: parsed.createdAt ?? this.now(),
          })
          .returning()
          .get();
      },
      listByContradiction: (contradictionId) =>
        this.db
          .select()
          .from(schema.resolutions)
          .where(eq(schema.resolutions.contradictionId, contradictionId))
          .orderBy(asc(schema.resolutions.createdAt))
          .all(),
    };
  }

  private createMemoryRepository(): MemoryRepository {
    return {
      create: (input) => {
        const parsed = createMemorySchema.parse(input);
        return this.db
          .insert(schema.memories)
          .values({
            id: parsed.id ?? this.nextId(),
            projectId: parsed.projectId,
            type: parsed.type,
            content: parsed.content,
            importance: parsed.importance,
            status: parsed.status,
            sourceId: parsed.sourceId ?? null,
            createdAt: parsed.createdAt ?? this.now(),
          })
          .returning()
          .get();
      },
      listByProject: (projectId) =>
        this.db
          .select()
          .from(schema.memories)
          .where(eq(schema.memories.projectId, projectId))
          .orderBy(asc(schema.memories.createdAt))
          .all(),
    };
  }

  private createAgentSessionRepository(): AgentSessionRepository {
    return {
      create: (input) => {
        const parsed = createAgentSessionSchema.parse(input);
        return this.db
          .insert(schema.agentSessions)
          .values({
            id: parsed.id ?? this.nextId(),
            projectId: parsed.projectId,
            agent: parsed.agent,
            startedAt: parsed.startedAt ?? this.now(),
            endedAt: parsed.endedAt ?? null,
            task: parsed.task ?? null,
            summary: parsed.summary ?? null,
          })
          .returning()
          .get();
      },
      listByProject: (projectId) =>
        this.db
          .select()
          .from(schema.agentSessions)
          .where(eq(schema.agentSessions.projectId, projectId))
          .orderBy(asc(schema.agentSessions.startedAt))
          .all(),
    };
  }

  private createOutcomeRepository(): OutcomeRepository {
    return {
      create: (input) => {
        const parsed = createOutcomeSchema.parse(input);
        return this.db
          .insert(schema.outcomes)
          .values({
            id: parsed.id ?? this.nextId(),
            sessionId: parsed.sessionId,
            type: parsed.type,
            result: parsed.result,
            success: parsed.success,
            relatedClaimIds: parsed.relatedClaimIds,
            createdAt: parsed.createdAt ?? this.now(),
          })
          .returning()
          .get();
      },
      listBySession: (sessionId) =>
        this.db
          .select()
          .from(schema.outcomes)
          .where(eq(schema.outcomes.sessionId, sessionId))
          .orderBy(asc(schema.outcomes.createdAt))
          .all(),
    };
  }

  private createContextPackRepository(): ContextPackRepository {
    return {
      create: (input) => {
        const parsed = createContextPackSchema.parse(input);
        return this.db
          .insert(schema.contextPacks)
          .values({
            id: parsed.id ?? this.nextId(),
            projectId: parsed.projectId,
            task: parsed.task,
            generatedAt: parsed.generatedAt ?? this.now(),
            claims: parsed.claims,
            memories: parsed.memories,
            files: parsed.files,
            decisions: parsed.decisions,
            changes: parsed.changes,
            tokenEstimate: parsed.tokenEstimate,
          })
          .returning()
          .get();
      },
      listByProject: (projectId) =>
        this.db
          .select()
          .from(schema.contextPacks)
          .where(eq(schema.contextPacks.projectId, projectId))
          .orderBy(asc(schema.contextPacks.generatedAt))
          .all(),
    };
  }
}

export function openHarikosDatabase(
  options: OpenHarikosDatabaseOptions,
): HarikosStore {
  const databasePath = options.databasePath.trim();
  if (!databasePath) {
    throw new Error("A database path is required.");
  }

  mkdirSync(dirname(databasePath), { recursive: true });

  const client = new Database(databasePath);
  client.pragma("foreign_keys = ON");
  client.pragma("journal_mode = WAL");
  client.pragma("busy_timeout = 5000");

  const db = drizzle(client, { schema });

  try {
    migrate(db, {
    migrationsFolder: options.migrationsFolder ?? defaultMigrationsFolder(),
    });
  } catch (error) {
    client.close();
    throw error;
  }

  const clock = options.clock ?? (() => new Date());
  return new SqliteHarikosStore(
    client,
    db,
    () => clock().toISOString(),
    options.idFactory ?? randomUUID,
  );
}
