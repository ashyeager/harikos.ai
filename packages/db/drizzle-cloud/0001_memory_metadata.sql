ALTER TABLE "harikos"."memories"
  ADD COLUMN IF NOT EXISTS "source_id" uuid,
  ADD COLUMN IF NOT EXISTS "agent" text,
  ADD COLUMN IF NOT EXISTS "session_id" uuid;

ALTER TABLE "harikos"."users" ALTER COLUMN "github_user_id" DROP NOT NULL;

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

CREATE TABLE IF NOT EXISTS "harikos"."subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "harikos"."users"("id") ON DELETE CASCADE,
  "stripe_customer_id" text NOT NULL UNIQUE,
  "stripe_subscription_id" text UNIQUE,
  "stripe_price_id" text,
  "status" text NOT NULL,
  "current_period_end" timestamptz,
  "cancel_at_period_end" boolean NOT NULL DEFAULT false,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "subscriptions_user_idx" ON "harikos"."subscriptions" ("user_id");
ALTER TABLE "harikos"."subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "harikos"."agent_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
  "agent_connection_id" uuid NOT NULL REFERENCES "harikos"."agent_connections"("id") ON DELETE CASCADE,
  "task" text,
  "status" text NOT NULL DEFAULT 'active',
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "ended_at" timestamptz
);
CREATE INDEX IF NOT EXISTS "agent_sessions_project_idx" ON "harikos"."agent_sessions" ("project_id");
ALTER TABLE "harikos"."agent_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "harikos"."outcomes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "harikos"."projects"("id") ON DELETE CASCADE,
  "session_id" uuid NOT NULL REFERENCES "harikos"."agent_sessions"("id") ON DELETE CASCADE,
  "summary" text NOT NULL,
  "status" text NOT NULL,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "outcomes_project_idx" ON "harikos"."outcomes" ("project_id");
ALTER TABLE "harikos"."outcomes" ENABLE ROW LEVEL SECURITY;
