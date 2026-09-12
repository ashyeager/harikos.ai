-- Free-plan webhook updates are recorded as a refresh requirement instead of
-- triggering a full repository scan. Monthly quota usage is derived from the
-- existing scans, context_packs, and memories timestamps.
ALTER TABLE "harikos"."projects"
  ADD COLUMN IF NOT EXISTS "refresh_required_at" timestamptz;

ALTER TABLE "harikos"."scans"
  ADD COLUMN IF NOT EXISTS "initial" boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "projects_refresh_required_idx"
  ON "harikos"."projects" ("refresh_required_at")
  WHERE "refresh_required_at" IS NOT NULL;
