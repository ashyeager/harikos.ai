ALTER TABLE "harikos"."memories"
  ADD COLUMN IF NOT EXISTS "source_id" uuid,
  ADD COLUMN IF NOT EXISTS "agent" text,
  ADD COLUMN IF NOT EXISTS "session_id" uuid;

CREATE TABLE IF NOT EXISTS "harikos"."agent_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "token_hash" text NOT NULL UNIQUE,
  "token_prefix" text NOT NULL,
  "revoked_at" timestamptz,
  "last_used_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "agent_connections_project_idx"
  ON "harikos"."agent_connections" ("project_id");
ALTER TABLE "harikos"."agent_connections" ENABLE ROW LEVEL SECURITY;
