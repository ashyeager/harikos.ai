# HARIKOS AI Setup

## Supabase

1. Create or use the existing HARIKOS Supabase project.
2. Copy the project URL and publishable key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Set Supabase Authentication > URL Configuration > Site URL to `https://<production-domain>` and add `https://<production-domain>/auth/callback` plus `http://localhost:3000/auth/callback` to Redirect URLs.
4. Enable Google and GitHub providers in Authentication > Providers. Use each provider's client credentials and the Supabase callback URL shown in the dashboard.
5. Set `DATABASE_URL` or `POSTGRES_URL` to the existing project's server-side Postgres connection string.
6. Keep the ignored root `.env.local` configured. `pnpm dev:web`, `pnpm db:migrate:cloud`, and the `verify:*` scripts load it explicitly.
7. Inspect the linked target and remote migration history before applying migrations with `pnpm db:migrate:cloud`.
8. Verify the deployed schema and access boundary with `pnpm verify:cloud:schema`.

## GitHub App

Configure the existing HARIKOS GitHub App with Contents: Read and Metadata: Read. Set `GITHUB_APP_ID`, `GITHUB_APP_SLUG`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and a 32+ character `HARIKOS_SESSION_SECRET`. The GitHub App callback is `/api/github/install/callback`; the login provider remains separate from repository authorization. For push reverification, set `GITHUB_WEBHOOK_SECRET` and register `https://<production-domain>/api/github/webhook` for the `push` event.

Use `pnpm verify:github-app` to verify App authentication without printing credentials. For the full cloud acceptance, start `pnpm dev:web`, set `HARIKOS_ACCEPTANCE_GITHUB_TOKEN` to an authorized CLI/user token for the real test repository, and run `pnpm verify:cloud:functional`.

## Billing provider

HARIKOS provides a HARIKOS-owned Free plan without Paddle, plus Core ($9/month),
Pro ($29/month), Scale ($79/month), and custom Enterprise agreements. Eligible
users may choose a 7-day Pro trial after experiencing Free.
Paddle Billing is the single provider. Configure `PADDLE_API_KEY`,
`PADDLE_WEBHOOK_SECRET`, `PADDLE_CORE_PRICE_ID`, `PADDLE_PRO_PRICE_ID`, and
`PADDLE_SCALE_PRICE_ID`; set `PADDLE_ENVIRONMENT=sandbox` outside live billing.
Deployed requests use Vercel's trusted country header when creating the required
Paddle billing address. `PADDLE_DEFAULT_COUNTRY_CODE` is an optional two-letter
fallback for local or non-Vercel environments.
The Pro recurring price must contain a 7-day trial with `requires_payment_method=false`.
Free must never require or create a Paddle customer. Paddle merchant setup is
intentionally deferred until this product release is complete.
Register
`https://<production-domain>/api/billing/webhook` for subscription lifecycle
events and grant the API key permission to create transactions and retrieve
temporary subscription management URLs. Paddle lifecycle state is authoritative;
checkout redirects never grant entitlement. Keep provider credentials server-side
and never commit them.

## Transactional email

Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CRON_SECRET` on the server. HARIKOS sends the welcome and trial lifecycle messages through one fail-soft service and stores an idempotency event before delivery. A daily authenticated Vercel cron checks for trials ending within 48 hours. The browser never chooses the recipient. Email delivery failure never rolls back authentication or billing state.

Internal developer access is stored as `role = 'developer'` on the immutable
server-side `harikos.users` row. `HARIKOS_DEVELOPER_USER_IDS` is an optional
server-only UUID allowlist for recovery; never use email, login, or browser state.

## Vercel

Set `NEXT_PUBLIC_APP_URL` to the production origin and add all server variables in the Vercel project for the Production environment. Deploy from `main`, then verify `/`, `/login`, `/pricing`, and the protected app routes. Never expose server-only keys with a `NEXT_PUBLIC_` prefix.
