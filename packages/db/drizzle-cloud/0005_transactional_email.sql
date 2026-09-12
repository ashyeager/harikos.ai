CREATE TABLE IF NOT EXISTS "harikos"."email_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "harikos"."users"("id") ON DELETE CASCADE,
  "event_key" text NOT NULL UNIQUE,
  "event_type" text NOT NULL,
  "sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "email_events_user_idx" ON "harikos"."email_events" ("user_id");
ALTER TABLE "harikos"."email_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "harikos"."email_events" FROM anon, authenticated;
