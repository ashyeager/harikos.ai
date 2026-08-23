PRAGMA foreign_keys = ON;
--> statement-breakpoint
CREATE TABLE `projects` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `path` text NOT NULL,
  `created_at` text NOT NULL,
  `last_scanned_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_path_unique` ON `projects` (`path`);
--> statement-breakpoint
CREATE TABLE `sources` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL,
  `type` text NOT NULL,
  `path` text,
  `content_hash` text NOT NULL,
  `observed_at` text NOT NULL,
  `metadata` text NOT NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `sources_type_check` CHECK (`type` IN ('file', 'manifest', 'config', 'git_commit', 'test_result', 'documentation', 'agent_session', 'manual'))
);
--> statement-breakpoint
CREATE INDEX `sources_project_idx` ON `sources` (`project_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `sources_identity_unique` ON `sources` (`project_id`, `type`, `path`, `content_hash`);
--> statement-breakpoint
CREATE TABLE `events` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL,
  `type` text NOT NULL,
  `timestamp` text NOT NULL,
  `source_id` text,
  `payload` text NOT NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `events_project_timestamp_idx` ON `events` (`project_id`, `timestamp`);
--> statement-breakpoint
CREATE TABLE `claims` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL,
  `subject` text NOT NULL,
  `predicate` text NOT NULL,
  `value` text NOT NULL,
  `scope` text,
  `status` text NOT NULL,
  `epistemic_type` text NOT NULL,
  `claim_kind` text NOT NULL,
  `confidence` real NOT NULL,
  `valid_from` text NOT NULL,
  `valid_to` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `claims_status_check` CHECK (`status` IN ('candidate', 'current', 'uncertain', 'contradicted', 'historical', 'superseded', 'rejected')),
  CONSTRAINT `claims_epistemic_type_check` CHECK (`epistemic_type` IN ('observed', 'derived', 'inferred', 'declared')),
  CONSTRAINT `claims_kind_check` CHECK (`claim_kind` IN ('implementation', 'intent')),
  CONSTRAINT `claims_confidence_check` CHECK (`confidence` >= 0 AND `confidence` <= 1),
  CONSTRAINT `claims_validity_check` CHECK (`valid_to` IS NULL OR `valid_to` >= `valid_from`)
);
--> statement-breakpoint
CREATE INDEX `claims_project_status_idx` ON `claims` (`project_id`, `status`);
--> statement-breakpoint
CREATE INDEX `claims_identity_idx` ON `claims` (`project_id`, `subject`, `predicate`, `scope`, `claim_kind`);
--> statement-breakpoint
CREATE TABLE `evidence` (
  `id` text PRIMARY KEY NOT NULL,
  `claim_id` text NOT NULL,
  `source_id` text NOT NULL,
  `path` text,
  `line_start` integer,
  `line_end` integer,
  `excerpt` text,
  `strength` real NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`claim_id`) REFERENCES `claims`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `evidence_strength_check` CHECK (`strength` >= 0 AND `strength` <= 1),
  CONSTRAINT `evidence_line_range_check` CHECK (`line_start` IS NULL OR `line_end` IS NULL OR `line_end` >= `line_start`)
);
--> statement-breakpoint
CREATE INDEX `evidence_claim_idx` ON `evidence` (`claim_id`);
--> statement-breakpoint
CREATE INDEX `evidence_source_idx` ON `evidence` (`source_id`);
--> statement-breakpoint
CREATE TABLE `contradictions` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL,
  `claim_a_id` text NOT NULL,
  `claim_b_id` text NOT NULL,
  `status` text NOT NULL,
  `reason` text NOT NULL,
  `resolution` text,
  `created_at` text NOT NULL,
  `resolved_at` text,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`claim_a_id`) REFERENCES `claims`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`claim_b_id`) REFERENCES `claims`(`id`) ON UPDATE no action ON DELETE no action,
  CONSTRAINT `contradictions_status_check` CHECK (`status` IN ('open', 'resolved', 'dismissed')),
  CONSTRAINT `contradictions_distinct_claims_check` CHECK (`claim_a_id` <> `claim_b_id`)
);
--> statement-breakpoint
CREATE INDEX `contradictions_project_status_idx` ON `contradictions` (`project_id`, `status`);
--> statement-breakpoint
CREATE UNIQUE INDEX `contradictions_pair_unique` ON `contradictions` (`project_id`, `claim_a_id`, `claim_b_id`);
--> statement-breakpoint
CREATE TABLE `resolutions` (
  `id` text PRIMARY KEY NOT NULL,
  `contradiction_id` text NOT NULL,
  `resolution_type` text NOT NULL,
  `chosen_claim_id` text,
  `reason` text NOT NULL,
  `actor` text NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`contradiction_id`) REFERENCES `contradictions`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`chosen_claim_id`) REFERENCES `claims`(`id`) ON UPDATE no action ON DELETE no action,
  CONSTRAINT `resolutions_type_check` CHECK (`resolution_type` IN ('supersede', 'coexist', 'reject', 'merge', 'human_override'))
);
--> statement-breakpoint
CREATE INDEX `resolutions_contradiction_idx` ON `resolutions` (`contradiction_id`);
--> statement-breakpoint
CREATE TABLE `memories` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL,
  `type` text NOT NULL,
  `content` text NOT NULL,
  `importance` real NOT NULL,
  `status` text NOT NULL,
  `source_id` text,
  `created_at` text NOT NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE set null,
  CONSTRAINT `memories_type_check` CHECK (`type` IN ('decision', 'failed_attempt', 'bug', 'root_cause', 'constraint', 'preference', 'outcome', 'note', 'incident')),
  CONSTRAINT `memories_status_check` CHECK (`status` IN ('active', 'historical', 'superseded', 'duplicate', 'invalidated', 'archived')),
  CONSTRAINT `memories_importance_check` CHECK (`importance` >= 0 AND `importance` <= 1)
);
--> statement-breakpoint
CREATE INDEX `memories_project_type_idx` ON `memories` (`project_id`, `type`);
--> statement-breakpoint
CREATE TABLE `agent_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL,
  `agent` text NOT NULL,
  `started_at` text NOT NULL,
  `ended_at` text,
  `task` text,
  `summary` text,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `agent_sessions_time_check` CHECK (`ended_at` IS NULL OR `ended_at` >= `started_at`)
);
--> statement-breakpoint
CREATE INDEX `agent_sessions_project_started_idx` ON `agent_sessions` (`project_id`, `started_at`);
--> statement-breakpoint
CREATE TABLE `outcomes` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `type` text NOT NULL,
  `result` text NOT NULL,
  `success` integer NOT NULL,
  `related_claim_ids` text NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `agent_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `outcomes_success_check` CHECK (`success` IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `outcomes_session_idx` ON `outcomes` (`session_id`);
--> statement-breakpoint
CREATE TABLE `context_packs` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL,
  `task` text NOT NULL,
  `generated_at` text NOT NULL,
  `claims` text NOT NULL,
  `memories` text NOT NULL,
  `files` text NOT NULL,
  `decisions` text NOT NULL,
  `changes` text NOT NULL,
  `token_estimate` integer NOT NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `context_packs_token_estimate_check` CHECK (`token_estimate` >= 0)
);
--> statement-breakpoint
CREATE INDEX `context_packs_project_generated_idx` ON `context_packs` (`project_id`, `generated_at`);
