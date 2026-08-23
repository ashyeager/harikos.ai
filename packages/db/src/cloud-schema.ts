import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const cloudClaimStatus = pgEnum("claim_status", [
  "candidate",
  "verified",
  "likely",
  "uncertain",
  "contradicted",
  "stale",
  "superseded",
  "rejected",
]);

export const cloudEpistemicType = pgEnum("epistemic_type", [
  "observed",
  "derived",
  "inferred",
  "declared",
]);

export const cloudUsers = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  githubUserId: text("github_user_id").notNull().unique(),
  login: text("login").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const cloudProjects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => cloudUsers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("projects_owner_idx").on(table.ownerId)],
);

export const cloudRepositories = pgTable(
  "repositories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => cloudProjects.id, { onDelete: "cascade" }),
    githubRepositoryId: text("github_repository_id").notNull(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    defaultBranch: text("default_branch").notNull(),
    private: boolean("private").notNull(),
    lastCommitSha: text("last_commit_sha"),
  },
  (table) => [
    uniqueIndex("repositories_github_id_unique").on(table.githubRepositoryId),
    uniqueIndex("repositories_project_unique").on(table.projectId),
  ],
);

export const cloudRepositoryInstallations = pgTable(
  "repository_installations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => cloudProjects.id, { onDelete: "cascade" }),
    installationId: text("installation_id").notNull(),
    accountLogin: text("account_login").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("repository_installations_project_unique").on(table.projectId),
  ],
);

export const cloudScans = pgTable(
  "scans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => cloudProjects.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    commitSha: text("commit_sha").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    errorCode: text("error_code"),
  },
  (table) => [index("scans_project_started_idx").on(table.projectId, table.startedAt)],
);

export const cloudClaims = pgTable(
  "claims",
  {
    id: text("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => cloudProjects.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    subject: text("subject").notNull(),
    predicate: text("predicate").notNull(),
    value: jsonb("value").notNull(),
    scope: text("scope"),
    status: cloudClaimStatus("status").notNull(),
    epistemicType: cloudEpistemicType("epistemic_type").notNull(),
    confidence: real("confidence").notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
    validTo: timestamp("valid_to", { withTimezone: true }),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull(),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }).notNull(),
    supersedesClaimId: text("supersedes_claim_id"),
  },
  (table) => [
    index("claims_project_status_idx").on(table.projectId, table.status),
    index("claims_project_identity_idx").on(
      table.projectId,
      table.subject,
      table.predicate,
      table.scope,
    ),
  ],
);

export const cloudEvidence = pgTable(
  "evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    claimId: text("claim_id")
      .notNull()
      .references(() => cloudClaims.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => cloudProjects.id, { onDelete: "cascade" }),
    sourceType: text("source_type").notNull(),
    filePath: text("file_path"),
    commitSha: text("commit_sha"),
    contentHash: text("content_hash").notNull(),
    lineStart: integer("line_start"),
    lineEnd: integer("line_end"),
    authority: real("authority").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    active: boolean("active").notNull().default(true),
    metadata: jsonb("metadata").notNull().default({}),
  },
  (table) => [index("evidence_claim_idx").on(table.claimId)],
);

export const cloudContradictions = pgTable(
  "contradictions",
  {
    id: text("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => cloudProjects.id, { onDelete: "cascade" }),
    claimAId: text("claim_a_id").notNull(),
    claimBId: text("claim_b_id").notNull(),
    status: text("status").notNull(),
    reason: text("reason").notNull(),
    resolution: text("resolution"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [index("contradictions_project_idx").on(table.projectId)],
);

export const cloudMemories = pgTable(
  "memories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => cloudProjects.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    content: text("content").notNull(),
    status: text("status").notNull(),
    importance: real("importance").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("memories_project_idx").on(table.projectId)],
);

export const cloudProjectChanges = pgTable(
  "project_changes",
  {
    id: text("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => cloudProjects.id, { onDelete: "cascade" }),
    scanId: uuid("scan_id").references(() => cloudScans.id, {
      onDelete: "set null",
    }),
    category: text("category").notNull(),
    summary: text("summary").notNull(),
    previousClaimId: text("previous_claim_id"),
    currentClaimId: text("current_claim_id"),
    commitSha: text("commit_sha"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("project_changes_project_idx").on(table.projectId)],
);

export const cloudContextPacks = pgTable(
  "context_packs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => cloudProjects.id, { onDelete: "cascade" }),
    task: text("task").notNull(),
    payload: jsonb("payload").notNull(),
    tokenEstimate: integer("token_estimate").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("context_packs_project_idx").on(table.projectId)],
);

export const cloudSchema = {
  users: cloudUsers,
  projects: cloudProjects,
  repositories: cloudRepositories,
  repositoryInstallations: cloudRepositoryInstallations,
  scans: cloudScans,
  claims: cloudClaims,
  evidence: cloudEvidence,
  contradictions: cloudContradictions,
  memories: cloudMemories,
  projectChanges: cloudProjectChanges,
  contextPacks: cloudContextPacks,
};
