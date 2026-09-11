# HARIKOS stabilization report — September 11, 2026

## BASELINE

- Starting `origin/main`: `427a8fb98bd6bb1436cddaecaccb24f98260e83f`; the stabilization worktree was clean.
- Starting production: Vercel deployment `dpl_FMKBvzc1bKhLepwbAGRgbu2EhqHT`, READY on the same commit.
- Starting live `/api/status`: Supabase Auth, GitHub App, and PostgreSQL configured; local demo and Stripe disabled.
- Supabase project: `nfhxdvfpctwwijhnrdkv`. The checked-in migration history was reconciled with the remote database before DDL.

## STRUCTURAL CLEANUP

- `apps/web` remains the canonical production application.
- Removed the unreferenced root Next.js application, root UI/assets/config, empty `packages/mcp` placeholder, and their root-only dependencies after tracing imports, scripts, workspace references, and Vercel behavior.
- Retained the root Vercel build adapter because the linked Vercel project still uses it to build `apps/web`.
- Retained `packages/cli`, deterministic scanner/database adapters, fixtures, and verification scripts as engineering infrastructure.
- Replaced unsupported OSS-integration claims with a bounded provenance audit. No vendored third-party source tree was found; normal package dependencies and license duties remain.

## AUTH

- Supabase remains the single authentication authority; server components and APIs resolve identity from the cookie-backed session.
- Redirect safety, callback behavior, logout route behavior, protected route handling, and ownership checks are covered by the passing suite.
- Production acceptance used an existing authenticated Chrome session: `/app/projects` loaded two real authorized projects, and a fresh tab after deployment retained the session.
- Unauthenticated `/app/dashboard` redirected to `/login`; unauthenticated `/api/projects` returned 401.
- A destructive live logout/login cycle was not run against Ash's active browser session.

## GITHUB

- Production reports the GitHub App configured and the authenticated repository list showed `ashyeager/harikos.ai` and `ashyeager/virally`.
- Installation and repository ownership validation remain server-side with least-privilege Contents: Read and Metadata: Read access.
- The push webhook requires a valid HMAC signature and now matches repository ID, installation ID, and the tracked default branch before reverification.
- A real production rescan of `ashyeager/harikos.ai` completed and advanced the project snapshot from `427a8fb9` to `06571b43` with 61 files analyzed.

## TRUTH / MEMORY / CONTEXT

- Truth resolution preserves A → B → A history, exposes competing evidence, and does not raise confidence when replacement evidence is weaker.
- Assumption checks use current supported Truth rather than superseded or stale claims.
- Context Packs rank task-relevant persistent Memory before applying limits and include Memory in token estimates.
- The production Truth view rendered 7 current claims with inspectable evidence after the real rescan and no browser console errors.
- A factual stabilization memory and production outcome were written through MCP and persisted.

## MCP

- Canonical endpoint remains `/api/mcp/[projectId]`; no competing endpoint was added.
- Production round trip verified protocol `2025-06-18` and all 9 tools: `get_project_truth`, `search_project_memory`, `get_recent_changes`, `get_context_pack`, `check_assumption`, `record_memory`, `record_outcome`, `begin_agent_session`, and `end_agent_session`.
- The round trip initialized, listed tools, began sessions, retrieved Truth/Memory/Changes/Context, checked an assumption, recorded a factual Memory and outcome, and ended sessions.
- Token authentication enforces project scope, revocation state, connection-bound sessions, owner entitlement, and no-active-entitlement denial. Revocation and expired-entitlement behavior passed focused automated tests; the existing live token was not revoked.

## BILLING / ENTITLEMENT

- Paddle is the sole launch billing authority in code. Stripe runtime code, dependencies, copy, and Vercel environment entries were removed.
- Canonical plans are Core `$9/month` (1 project, 1 agent), Pro `$29/month` (5/5), Scale `$79/month` (20/20), and Enterprise custom. There is no permanent Free plan.
- New eligible users use a 7-day Pro trial configured on the Paddle Pro price. Hosted Paddle Checkout handles payment details.
- Signed raw-body webhook events are idempotent and ordered by provider occurrence time; trialing and active grant access only through authoritative persisted lifecycle state.
- `resolveEntitlement` is the single server-side resolver for project creation, scans, project data, Memory, Context, agent creation, and MCP.
- Ash's internal access is a persisted server-side `developer` role assigned to the immutable existing Supabase user; it bypasses payment only and preserves authentication, GitHub authorization, ownership, and project isolation.
- Applied remote migrations `paddle_billing` and `internal_developer_role`. Verified one developer role, two customer roles, no subscription rows, and protected webhook-event storage.
- Production `/api/status` reports `paddle:false`. Live checkout, trial conversion, cancellation, past-due, and webhook acceptance remain blocked until a real Paddle merchant catalog and credentials are configured.

## TESTS

- `pnpm.cmd lint`: passed with zero warnings.
- `pnpm.cmd typecheck`: passed separately from the Next.js build.
- `pnpm.cmd test`: 24 files, 67 tests passed.
- `pnpm.cmd build`: passed, including strict Next.js TypeScript validation and 39 generated routes.
- `pnpm.cmd test:e2e`: 6 Playwright checks passed across desktop and mobile.
- `git diff --check` and the secret-pattern scan passed; no environment file or credential was committed.
- A production-only hydration mismatch found during authenticated acceptance was traced to timezone-dependent client rendering, fixed with deterministic UTC formatting, and covered by a regression test.
- The requested fresh Sol security-review agent could not start because the account reached its agent usage limit. The Orchestrator completed the final-diff auth, entitlement, ownership, MCP scope, webhook, secret, migration, cleanup, and dependency checklist directly.

## PREVIEW

- Primary stabilization Preview: `dpl_88BHhJsHtUP318TF29d6pPeq3m5t`, READY on `6152635`.
- Final corrective Preview: `dpl_CM6idZKMVbU9QXCgJdwJw6pmRMt6`, READY on `06571b4`.
- Both Vercel builds compiled and ran TypeScript successfully. Public routes returned 200, unauthenticated protected UI redirected to login, protected API returned 401, and no Preview runtime errors were found.
- Preview intentionally reported GitHub App and Paddle unavailable because GitHub credentials are Production-only and Paddle is not configured.

## PRODUCTION

- Application release SHA: `06571b43de610f68d872de1154810ed199de5a30`.
- Production deployment: `dpl_f13EhEdp4eS8ggCwy1DhvPHrSiSZ`, READY and aliased to `https://harikos-ai.vercel.app`.
- Vercel build logs identify branch `main` and commit `06571b4`; compilation, strict TypeScript, and deployment completed.
- `/`, `/login`, `/pricing`, and `/api/status` returned 200. Pricing showed `$9`, `$29`, `$79`, and the 7-day trial with no Free, Stripe, or local-scan copy.
- Live status: Supabase Auth true, GitHub App true, PostgreSQL true, Paddle false.
- Authenticated projects, real rescan, Truth/Evidence rendering, persistent Memory/Context, MCP read/write round trip, and post-fix clean browser console were verified. Vercel reported no new error-level runtime logs in the checked interval.

## REMAINING NON-BLOCKERS / ACTION REQUIRED

- **ACTION REQUIRED:** configure the Paddle merchant account, approved checkout domain, Core/Pro/Scale price IDs, 7-day Pro trial, API key, webhook secret, and webhook destination before accepting real customers.
- **ACTION REQUIRED:** make `ashyeager/harikos.ai` private before treating source confidentiality as complete.
- Run Paddle sandbox lifecycle acceptance once those credentials exist, including trialing → active, cancellation/expiration, past due, reactivation, and denied MCP access after entitlement loss.
- Run a dedicated UI/UX revamp only after this stabilized backend/product base; the current mission intentionally preserved the existing visual system.
