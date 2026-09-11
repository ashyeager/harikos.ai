# HARIKOS AI Build State

Updated: September 11, 2026

## Verified repository state

- `apps/web` is the sole production application. Obsolete root Next.js files and
  the empty `packages/mcp` placeholder are removed; the remote MCP route remains
  `apps/web/app/api/mcp/[projectId]/route.ts`.
- Supabase Auth, cookie-backed identity, explicit project ownership, the read-only
  GitHub App boundary, PostgreSQL persistence, Truth/Evidence, Memory/Context, and
  the nine-tool remote MCP bridge remain implemented.
- One server entitlement resolver governs Core ($9, 1/1), Pro ($29, 5/5), Scale
  ($79, 20/20), trialing, active, past-due, canceled, expired, and developer state.
- Paddle is the only billing implementation. Signed raw-body webhooks are
  replay-bounded, idempotent, and ordered by provider occurrence time. Browser
  redirects never grant entitlement.
- Production database migrations `paddle_billing` and
  `internal_developer_role` are applied. One existing immutable user row holds
  the developer role; payment bypass does not bypass authentication or ownership.
- Customer-facing local/demo projects and stale Free/Stripe product copy are removed.

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` — 23 files, 66 tests
- `pnpm build` — strict Next.js production build
- `pnpm test:e2e` — 6 desktop/mobile Playwright tests

## External configuration still required

- Create/approve the Paddle merchant catalog and configure the Core, Pro, and
  Scale price IDs, API key, webhook destination secret, and approved checkout
  domain. The Pro price must contain the real 7-day trial.
- Live checkout, subscription lifecycle, and customer portal acceptance cannot be
  claimed until those Paddle credentials exist.
- GitHub App and OAuth secrets are Production-only in Vercel, so Preview can verify
  public and auth boundaries but cannot perform a real GitHub installation flow.
- Make `ashyeager/harikos.ai` private before treating source confidentiality as complete.

`DAILY.md` records release-specific Preview and Production evidence.
