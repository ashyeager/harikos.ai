-- Reconcile historical Stripe-shaped local schema with the provider-neutral
-- subscription shape already used by production. This migration is additive.
ALTER TABLE "harikos"."subscriptions"
  ADD COLUMN IF NOT EXISTS "provider" text,
  ADD COLUMN IF NOT EXISTS "provider_customer_id" text,
  ADD COLUMN IF NOT EXISTS "provider_subscription_id" text,
  ADD COLUMN IF NOT EXISTS "provider_price_id" text,
  ADD COLUMN IF NOT EXISTS "plan" text,
  ADD COLUMN IF NOT EXISTS "trial_start" timestamptz,
  ADD COLUMN IF NOT EXISTS "trial_end" timestamptz,
  ADD COLUMN IF NOT EXISTS "current_period_start" timestamptz,
  ADD COLUMN IF NOT EXISTS "provider_occurred_at" timestamptz;

ALTER TABLE "harikos"."users"
  ADD COLUMN IF NOT EXISTS "email" text,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();

-- Preserve any historical records without making Stripe an active provider.
UPDATE "harikos"."subscriptions"
SET provider = COALESCE(provider, 'stripe')
WHERE provider IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'harikos' AND table_name = 'subscriptions' AND column_name = 'stripe_customer_id') THEN
    EXECUTE 'UPDATE harikos.subscriptions SET provider_customer_id = COALESCE(provider_customer_id, stripe_customer_id), provider_subscription_id = COALESCE(provider_subscription_id, stripe_subscription_id), provider_price_id = COALESCE(provider_price_id, stripe_price_id)';
    EXECUTE 'ALTER TABLE harikos.subscriptions ALTER COLUMN stripe_customer_id DROP NOT NULL';
  END IF;
END $$;

ALTER TABLE "harikos"."subscriptions"
  ALTER COLUMN "provider" SET DEFAULT 'paddle',
  ALTER COLUMN "provider" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_provider_customer_unique"
  ON "harikos"."subscriptions" ("provider_customer_id")
  WHERE "provider_customer_id" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_provider_subscription_unique"
  ON "harikos"."subscriptions" ("provider_subscription_id")
  WHERE "provider_subscription_id" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "harikos"."billing_webhook_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "provider" text NOT NULL,
  "provider_event_id" text NOT NULL UNIQUE,
  "event_type" text NOT NULL,
  "received_at" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE "harikos"."billing_webhook_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "harikos"."billing_webhook_events" FROM anon, authenticated;
