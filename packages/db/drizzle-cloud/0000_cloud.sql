CREATE SCHEMA IF NOT EXISTS "harikos";
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "harikos"."claim_status" AS ENUM ('candidate', 'verified', 'likely', 'uncertain', 'contradicted', 'stale', 'superseded', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "harikos"."epistemic_type" AS ENUM ('observed', 'derived', 'inferred', 'declared');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "supabase_user_id" text NOT NULL UNIQUE,
  "github_user_id" text NOT NULL UNIQUE,
  "login" text NOT NULL,
  "display_name" text,
  "avatar_url" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."repository_installations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "owner_id" uuid NOT NULL REFERENCES "harikos"."users"("id") ON DELETE CASCADE,
  "installation_id" text NOT NULL UNIQUE,
  "account_id" text NOT NULL,
  "account_login" text NOT NULL,
  "account_type" text NOT NULL,
  "repository_selection" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "repository_installations_owner_idx"
  ON "harikos"."repository_installations" ("owner_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "owner_id" uuid NOT NULL REFERENCES "harikos"."users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_owner_idx"
  ON "harikos"."projects" ("owner_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."repositories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL UNIQUE REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
  "installation_id" uuid NOT NULL REFERENCES "harikos"."repository_installations"("id") ON DELETE RESTRICT,
  "github_repository_id" text NOT NULL UNIQUE,
  "owner" text NOT NULL,
  "name" text NOT NULL,
  "default_branch" text NOT NULL,
  "private" boolean NOT NULL,
  "last_commit_sha" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."scans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
  "status" text NOT NULL,
  "commit_sha" text NOT NULL,
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz,
  "error_code" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scans_project_started_idx"
  ON "harikos"."scans" ("project_id", "started_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."claims" (
  "id" text PRIMARY KEY,
  "project_id" uuid NOT NULL REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
  "category" text NOT NULL,
  "subject" text NOT NULL,
  "predicate" text NOT NULL,
  "value" jsonb NOT NULL,
  "scope" text,
  "status" "harikos"."claim_status" NOT NULL,
  "epistemic_type" "harikos"."epistemic_type" NOT NULL,
  "confidence" real NOT NULL CHECK ("confidence" >= 0 AND "confidence" <= 1),
  "valid_from" timestamptz NOT NULL,
  "valid_to" timestamptz,
  "first_seen_at" timestamptz NOT NULL,
  "last_verified_at" timestamptz NOT NULL,
  "supersedes_claim_id" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claims_project_status_idx"
  ON "harikos"."claims" ("project_id", "status");
CREATE INDEX IF NOT EXISTS "claims_project_identity_idx"
  ON "harikos"."claims" ("project_id", "subject", "predicate", "scope");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."evidence" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "claim_id" text NOT NULL REFERENCES "harikos"."claims"("id") ON DELETE CASCADE,
  "project_id" uuid NOT NULL REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS "evidence_claim_idx"
  ON "harikos"."evidence" ("claim_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."contradictions" (
  "id" text PRIMARY KEY,
  "project_id" uuid NOT NULL REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
  "claim_a_id" text NOT NULL,
  "claim_b_id" text NOT NULL,
  "status" text NOT NULL,
  "reason" text NOT NULL,
  "resolution" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "resolved_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contradictions_project_idx"
  ON "harikos"."contradictions" ("project_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."memories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "content" text NOT NULL,
  "status" text NOT NULL,
  "importance" real NOT NULL CHECK ("importance" >= 0 AND "importance" <= 1),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "source_id" uuid,
  "agent" text,
  "session_id" uuid
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "memories_project_idx"
  ON "harikos"."memories" ("project_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."project_changes" (
  "id" text PRIMARY KEY,
  "project_id" uuid NOT NULL REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
  "scan_id" uuid REFERENCES "harikos"."scans"("id") ON DELETE SET NULL,
  "category" text NOT NULL,
  "summary" text NOT NULL,
  "previous_claim_id" text,
  "current_claim_id" text,
  "commit_sha" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_changes_project_idx"
  ON "harikos"."project_changes" ("project_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "harikos"."context_packs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
  "task" text NOT NULL,
  "payload" jsonb NOT NULL,
  "token_estimate" integer NOT NULL CHECK ("token_estimate" >= 0),
  "created_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "context_packs_project_idx"
  ON "harikos"."context_packs" ("project_id");
--> statement-breakpoint
ALTER TABLE "harikos"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "harikos"."projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "harikos"."repositories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "harikos"."repository_installations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "harikos"."scans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "harikos"."claims" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "harikos"."evidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "harikos"."contradictions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "harikos"."memories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "harikos"."project_changes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "harikos"."context_packs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  REVOKE USAGE ON SCHEMA "harikos" FROM anon, authenticated;
  REVOKE ALL ON ALL TABLES IN SCHEMA "harikos" FROM anon, authenticated;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
