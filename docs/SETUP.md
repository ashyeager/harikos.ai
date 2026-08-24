# HARIKOS AI Setup

## Supabase

1. Create or use the existing HARIKOS Supabase project.
2. Copy the project URL and publishable key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Set Supabase Authentication > URL Configuration > Site URL to `https://<production-domain>` and add `https://<production-domain>/auth/callback` plus `http://localhost:3000/auth/callback` to Redirect URLs.
4. Enable Google and GitHub providers in Authentication > Providers. Use each provider's client credentials and the Supabase callback URL shown in the dashboard.
5. Set `DATABASE_URL` or `POSTGRES_URL` to the existing project's server-side Postgres connection string.
6. Apply migrations with `pnpm db:migrate:cloud`. Inspect the target and migration history before applying it.

## GitHub App

Configure the existing HARIKOS GitHub App with Contents: Read and Metadata: Read. Set `GITHUB_APP_ID`, `GITHUB_APP_SLUG`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and a 32+ character `HARIKOS_SESSION_SECRET`. The GitHub App callback is `/api/github/install/callback`; the login provider remains separate from repository authorization.

## Stripe

1. Create a HARIKOS Pro product with a recurring monthly price of $15.
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET` in Vercel and local server environments.
3. Register `https://<production-domain>/api/billing/webhook` for subscription created, updated, and deleted events.
4. Enable Stripe Customer Portal.

Stripe webhook state is authoritative for entitlement. Checkout redirects do not grant Pro.

## Vercel

Set `NEXT_PUBLIC_APP_URL` to the production origin and add all server variables in the Vercel project for the Production environment. Deploy from `main`, then verify `/`, `/login`, `/pricing`, and the protected app routes. Never expose server-only keys with a `NEXT_PUBLIC_` prefix.
