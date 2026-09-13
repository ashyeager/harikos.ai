CREATE TABLE IF NOT EXISTS "harikos"."trial_reservations" (
  "user_id" uuid PRIMARY KEY REFERENCES "harikos"."users"("id") ON DELETE CASCADE,
  "reserved_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "provider_transaction_id" text UNIQUE,
  "completed_at" timestamp with time zone
);
ALTER TABLE "harikos"."trial_reservations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "harikos"."trial_reservations" FROM anon, authenticated;
