DO $$ BEGIN
  CREATE TYPE "claim_status" AS ENUM ('candidate', 'verified', 'likely', 'uncertain', 'contradicted', 'stale', 'superseded', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "epistemic_type" AS ENUM ('observed', 'derived', 'inferred', 'declared');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "github_user_id" text NOT NULL UNIQUE,
  "login" text NOT NULL,
  "display_name" text,
  "avatar_url" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_owner_idx" ON "projects" ("owner_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "repositories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL UNIQUE REFERENCES "projects"("id") ON DELETE CASCADE,
  "github_repository_id" text NOT NULL UNIQUE,
  "owner" text NOT NULL,
  "name" text NOT NULL,
  "default_branch" text NOT NULL,
  "private" boolean NOT NULL,
  "last_commit_sha" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "repository_installations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL UNIQUE REFERENCES "projects"("id") ON DELETE CASCADE,
  "installation_id" text NOT NULL,
  "account_login" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "status" text NOT NULL,
  "commit_sha" text NOT NULL,
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz,
  "error_code" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scans_project_started_idx" ON "scans" ("project_id", "started_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "claims" (
  "id" text PRIMARY KEY,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "category" text NOT NULL,
  "subject" text NOT NULL,
  "predicate" text NOT NULL,
  "value" jsonb NOT NULL,
  "scope" text,
  "status" claim_status NOT NULL,
  "epistemic_type" epistemic_type NOT NULL,
  "confidence" real NOT NULL CHECK ("confidence" >= 0 AND "confidence" <= 1),
  "valid_from" timestamptz NOT NULL,
  "valid_to" timestamptz,
  "first_seen_at" timestamptz NOT NULL,
  "last_verified_at" timestamptz NOT NULL,
  "supersedes_claim_id" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claims_project_status_idx" ON "claims" ("project_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claims_project_identity_idx" ON "claims" ("project_id", "subject", "predicate", "scope");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evidence" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "claim_id" text NOT NULL REFERENCES "claims"("id") ON DELETE CASCADE,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "source_type" text NOT NULL,
  "file_path" text,
  "commit_sha" text,
  "content_hash" text NOT NULL,
  "line_start" integer,
  "line_end" integer,
  "authority" real NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "evidence_claim_idx" ON "evidence" ("claim_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contradictions" (
  "id" text PRIMARY KEY,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "claim_a_id" text NOT NULL,
  "claim_b_id" text NOT NULL,
  "status" text NOT NULL,
  "reason" text NOT NULL,
  "resolution" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "resolved_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contradictions_project_idx" ON "contradictions" ("project_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "content" text NOT NULL,
  "status" text NOT NULL,
  "importance" real NOT NULL CHECK ("importance" >= 0 AND "importance" <= 1),
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "memories_project_idx" ON "memories" ("project_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_changes" (
  "id" text PRIMARY KEY,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "scan_id" uuid REFERENCES "scans"("id") ON DELETE SET NULL,
  "category" text NOT NULL,
  "summary" text NOT NULL,
  "previous_claim_id" text,
  "current_claim_id" text,
  "commit_sha" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_changes_project_idx" ON "project_changes" ("project_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "context_packs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "task" text NOT NULL,
  "payload" jsonb NOT NULL,
  "token_estimate" integer NOT NULL CHECK ("token_estimate" >= 0),
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "context_packs_project_idx" ON "context_packs" ("project_id");
