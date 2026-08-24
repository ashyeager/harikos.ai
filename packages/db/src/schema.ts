import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const SOURCE_TYPES = [
  "file",
  "manifest",
  "config",
  "git_commit",
  "test_result",
  "documentation",
  "agent_session",
  "manual",
] as const;

export const CLAIM_STATUSES = [
  "candidate",
  "current",
  "uncertain",
  "contradicted",
  "historical",
  "superseded",
  "rejected",
] as const;

export const EPISTEMIC_TYPES = [
  "observed",
  "derived",
  "inferred",
  "declared",
] as const;

export const CLAIM_KINDS = ["implementation", "intent"] as const;

export const CONTRADICTION_STATUSES = [
  "open",
  "resolved",
  "dismissed",
] as const;

export const RESOLUTION_TYPES = [
  "supersede",
  "coexist",
  "reject",
  "merge",
  "human_override",
] as const;

export const MEMORY_TYPES = [
  "decision",
  "attempt",
  "failed_attempt",
  "fix",
  "bug",
  "root_cause",
  "constraint",
  "discovery",
  "preference",
  "outcome",
  "note",
  "incident",
] as const;

export const MEMORY_STATUSES = [
  "active",
  "historical",
  "superseded",
  "duplicate",
  "invalidated",
  "archived",
] as const;

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    path: text("path").notNull(),
    createdAt: text("created_at").notNull(),
    lastScannedAt: text("last_scanned_at"),
  },
  (table) => [uniqueIndex("projects_path_unique").on(table.path)],
);

export const sources = sqliteTable(
  "sources",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    type: text("type", { enum: SOURCE_TYPES }).notNull(),
    path: text("path"),
    contentHash: text("content_hash").notNull(),
    observedAt: text("observed_at").notNull(),
    metadata: text("metadata", { mode: "json" })
      .$type<JsonValue>()
      .notNull(),
  },
  (table) => [
    index("sources_project_idx").on(table.projectId),
    uniqueIndex("sources_identity_unique").on(
      table.projectId,
      table.type,
      table.path,
      table.contentHash,
    ),
    check(
      "sources_type_check",
      sql`${table.type} IN ('file', 'manifest', 'config', 'git_commit', 'test_result', 'documentation', 'agent_session', 'manual')`,
    ),
  ],
);

export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    timestamp: text("timestamp").notNull(),
    sourceId: text("source_id").references(() => sources.id, {
      onDelete: "set null",
    }),
    payload: text("payload", { mode: "json" })
      .$type<JsonValue>()
      .notNull(),
  },
  (table) => [
    index("events_project_timestamp_idx").on(
      table.projectId,
      table.timestamp,
    ),
  ],
);

export const claims = sqliteTable(
  "claims",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    predicate: text("predicate").notNull(),
    value: text("value", { mode: "json" }).$type<JsonValue>().notNull(),
    scope: text("scope"),
    status: text("status", { enum: CLAIM_STATUSES }).notNull(),
    epistemicType: text("epistemic_type", {
      enum: EPISTEMIC_TYPES,
    }).notNull(),
    claimKind: text("claim_kind", { enum: CLAIM_KINDS }).notNull(),
    confidence: real("confidence").notNull(),
    validFrom: text("valid_from").notNull(),
    validTo: text("valid_to"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("claims_project_status_idx").on(table.projectId, table.status),
    index("claims_identity_idx").on(
      table.projectId,
      table.subject,
      table.predicate,
      table.scope,
      table.claimKind,
    ),
    check(
      "claims_confidence_check",
      sql`${table.confidence} >= 0 AND ${table.confidence} <= 1`,
    ),
    check(
      "claims_status_check",
      sql`${table.status} IN ('candidate', 'current', 'uncertain', 'contradicted', 'historical', 'superseded', 'rejected')`,
    ),
    check(
      "claims_epistemic_type_check",
      sql`${table.epistemicType} IN ('observed', 'derived', 'inferred', 'declared')`,
    ),
    check(
      "claims_kind_check",
      sql`${table.claimKind} IN ('implementation', 'intent')`,
    ),
    check(
      "claims_validity_check",
      sql`${table.validTo} IS NULL OR ${table.validTo} >= ${table.validFrom}`,
    ),
  ],
);

export const evidence = sqliteTable(
  "evidence",
  {
    id: text("id").primaryKey(),
    claimId: text("claim_id")
      .notNull()
      .references(() => claims.id, { onDelete: "cascade" }),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    path: text("path"),
    lineStart: integer("line_start"),
    lineEnd: integer("line_end"),
    excerpt: text("excerpt"),
    strength: real("strength").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("evidence_claim_idx").on(table.claimId),
    index("evidence_source_idx").on(table.sourceId),
    check(
      "evidence_strength_check",
      sql`${table.strength} >= 0 AND ${table.strength} <= 1`,
    ),
    check(
      "evidence_line_range_check",
      sql`${table.lineStart} IS NULL OR ${table.lineEnd} IS NULL OR ${table.lineEnd} >= ${table.lineStart}`,
    ),
  ],
);

export const contradictions = sqliteTable(
  "contradictions",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    claimAId: text("claim_a_id")
      .notNull()
      .references(() => claims.id),
    claimBId: text("claim_b_id")
      .notNull()
      .references(() => claims.id),
    status: text("status", { enum: CONTRADICTION_STATUSES }).notNull(),
    reason: text("reason").notNull(),
    resolution: text("resolution"),
    createdAt: text("created_at").notNull(),
    resolvedAt: text("resolved_at"),
  },
  (table) => [
    index("contradictions_project_status_idx").on(
      table.projectId,
      table.status,
    ),
    uniqueIndex("contradictions_pair_unique").on(
      table.projectId,
      table.claimAId,
      table.claimBId,
    ),
    check(
      "contradictions_distinct_claims_check",
      sql`${table.claimAId} <> ${table.claimBId}`,
    ),
    check(
      "contradictions_status_check",
      sql`${table.status} IN ('open', 'resolved', 'dismissed')`,
    ),
  ],
);

export const resolutions = sqliteTable(
  "resolutions",
  {
    id: text("id").primaryKey(),
    contradictionId: text("contradiction_id")
      .notNull()
      .references(() => contradictions.id, { onDelete: "cascade" }),
    resolutionType: text("resolution_type", {
      enum: RESOLUTION_TYPES,
    }).notNull(),
    chosenClaimId: text("chosen_claim_id").references(() => claims.id),
    reason: text("reason").notNull(),
    actor: text("actor").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("resolutions_contradiction_idx").on(table.contradictionId),
    check(
      "resolutions_type_check",
      sql`${table.resolutionType} IN ('supersede', 'coexist', 'reject', 'merge', 'human_override')`,
    ),
  ],
);

export const memories = sqliteTable(
  "memories",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    type: text("type", { enum: MEMORY_TYPES }).notNull(),
    content: text("content").notNull(),
    importance: real("importance").notNull(),
    status: text("status", { enum: MEMORY_STATUSES }).notNull(),
    sourceId: text("source_id").references(() => sources.id, {
      onDelete: "set null",
    }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("memories_project_type_idx").on(table.projectId, table.type),
    check(
      "memories_importance_check",
      sql`${table.importance} >= 0 AND ${table.importance} <= 1`,
    ),
    check(
      "memories_type_check",
      sql`${table.type} IN ('decision', 'failed_attempt', 'bug', 'root_cause', 'constraint', 'preference', 'outcome', 'note', 'incident')`,
    ),
    check(
      "memories_status_check",
      sql`${table.status} IN ('active', 'historical', 'superseded', 'duplicate', 'invalidated', 'archived')`,
    ),
  ],
);

export const agentSessions = sqliteTable(
  "agent_sessions",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    agent: text("agent").notNull(),
    startedAt: text("started_at").notNull(),
    endedAt: text("ended_at"),
    task: text("task"),
    summary: text("summary"),
  },
  (table) => [
    index("agent_sessions_project_started_idx").on(
      table.projectId,
      table.startedAt,
    ),
    check(
      "agent_sessions_time_check",
      sql`${table.endedAt} IS NULL OR ${table.endedAt} >= ${table.startedAt}`,
    ),
  ],
);

export const outcomes = sqliteTable(
  "outcomes",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => agentSessions.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    result: text("result", { mode: "json" }).$type<JsonValue>().notNull(),
    success: integer("success", { mode: "boolean" }).notNull(),
    relatedClaimIds: text("related_claim_ids", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("outcomes_session_idx").on(table.sessionId),
    check(
      "outcomes_success_check",
      sql`${table.success} IN (0, 1)`,
    ),
  ],
);

export const contextPacks = sqliteTable(
  "context_packs",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    task: text("task").notNull(),
    generatedAt: text("generated_at").notNull(),
    claims: text("claims", { mode: "json" }).$type<JsonValue[]>().notNull(),
    memories: text("memories", { mode: "json" })
      .$type<JsonValue[]>()
      .notNull(),
    files: text("files", { mode: "json" }).$type<string[]>().notNull(),
    decisions: text("decisions", { mode: "json" })
      .$type<JsonValue[]>()
      .notNull(),
    changes: text("changes", { mode: "json" }).$type<JsonValue[]>().notNull(),
    tokenEstimate: integer("token_estimate").notNull(),
  },
  (table) => [
    index("context_packs_project_generated_idx").on(
      table.projectId,
      table.generatedAt,
    ),
    check(
      "context_packs_token_estimate_check",
      sql`${table.tokenEstimate} >= 0`,
    ),
  ],
);

export type Project = typeof projects.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type Contradiction = typeof contradictions.$inferSelect;
export type Resolution = typeof resolutions.$inferSelect;
export type Memory = typeof memories.$inferSelect;
export type AgentSession = typeof agentSessions.$inferSelect;
export type Outcome = typeof outcomes.$inferSelect;
export type ContextPack = typeof contextPacks.$inferSelect;
