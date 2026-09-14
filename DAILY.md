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

---

# HARIKOS final product release — September 12, 2026

## BASELINE

- This continuation started from `origin/main` `689b4f3e460dfc569fb8f311a194dacf116cc9bd` with the release work isolated on `codex/frontend-iteration`.
- Production was serving the earlier paid-only stabilization. Supabase Auth, PostgreSQL, and the GitHub App were configured; Paddle remained unconfigured.

## PRODUCT AND STRUCTURE

- `apps/web` remains the single production application. Existing 3D assets remain available on established secondary routes; the homepage no longer loads 3D.
- The supplied HARIKOS mark is now the shared brand and favicon asset. Public pages use the approved warm ivory direction while the authenticated workspace keeps its graphite product surface.
- Public navigation, the locked homepage copy and video placement, pricing, legal/support routes, settings, loading, empty, error, and accessibility states were corrected without replacing the product architecture.
- Documentation now defines one current cloud SaaS product. Historical reports remain dated evidence rather than current policy.

## AUTH AND GITHUB

- Supabase cookie-backed authentication, safe redirects, server route protection, logout behavior, ownership checks, and the durable developer role passed focused tests.
- Production authenticated acceptance retained Ash's real session and rendered the server-side `Developer access` state. Payment limits are bypassed; authentication, GitHub authorization, ownership, and project isolation remain enforced.
- Production listed the two real authorized repositories already connected to the account. GitHub installation ownership, repository authorization, signed push handling, and paid/developer reverification remain intact.
- Free projects record that a refresh is required after a push instead of silently consuming or bypassing the manual monthly rescan allowance.

## TRUTH, MEMORY, CONTEXT, AND MCP

- Existing deterministic Truth, inspectable Evidence, temporal history, contradictions, persistent Memory, task-specific Context, and agent outcome behavior were preserved.
- The canonical remote endpoint remains `/api/mcp/[projectId]` with all nine semantic tools.
- MCP authentication still enforces hashed scoped tokens, ownership, project isolation, revocation, and server-side entitlement. Context Pack creation, Memory writes, outcomes, and scans now share the same monthly usage authority as the web APIs.
- A final review found a scan-count array access bug that could bypass the Free manual-rescan quota; it was fixed before release and covered by the focused entitlement/MCP suite.

## BILLING AND ENTITLEMENT

- HARIKOS Free is the default real plan: 1 active project, 1 active agent connection, the initial scan plus 1 manual rescan per calendar month, 3 Context Packs per month, and 10 Memory/outcome writes per month. Read access remains available when a write allowance is exhausted.
- Paid catalog: Core `$9/month` for 1 project/1 agent with continuous verification, Pro `$29/month` for 5/5 with an optional 7-day trial, Scale `$79/month` for 20/20, and Enterprise custom.
- `resolveEntitlement` and shared plan usage are the server authority for project creation, scans, agent connections, MCP, Context, Memory, and outcomes. UI state alone never grants access.
- Paddle remains the only billing provider in code. Checkout, webhook-derived subscription state, and portal paths are implemented, but production reports `paddle:false`; no live paid billing claim is made.

## DATABASE

- Added and applied `20260912021524_free_plan_usage.sql` to Supabase project `nfhxdvfpctwwijhnrdkv` after a linked dry run showed only that migration pending.
- Post-push migration history is aligned and a second dry run returned `Remote database is up to date.`
- Schema verification found every expected application table, RLS enabled on all application tables, no anonymous/authenticated table grants, all expected metadata columns, and the authenticated role blocked from direct protected data access.

## TESTS

- `pnpm.cmd lint`: passed.
- `pnpm.cmd typecheck`: passed separately.
- `pnpm.cmd test`: 25 files, 77 tests passed.
- Focused entitlement/MCP regression suite: 2 files, 21 tests passed.
- `pnpm.cmd build`: passed with strict TypeScript and 39 routes.
- `pnpm.cmd test:e2e`: 6 desktop/mobile Playwright checks passed against the production build.
- `git diff --check` and secret review passed; no environment file or credential was committed.
- The requested Sol review could not start because the account had reached its agent usage limit. A fresh Luna final-diff review completed; its valid quota-bypass finding was fixed and reverified.

## PREVIEW

- Final corrective Preview: `dpl_Exmvu9QNZ53bcWQRJpewhma3z2J7`, READY.
- Public home, pricing, login, logo, and video checks passed; unauthenticated `/app/dashboard` redirected to `/login`.
- Preview `/api/status` reported Supabase Auth and PostgreSQL available, with GitHub and Paddle unavailable in the Preview environment as configured.

## PRODUCTION

- Application release commit before this evidence-only report: `87a5271d0eb63b7dd095037a712d8d566f128552`.
- Production deployment `dpl_38FnN6HAH566kPSKrntJemifC47R` is READY and aliased to `https://harikos-ai.vercel.app`.
- Live `/api/status` reports Supabase Auth true, GitHub App true, PostgreSQL true, and Paddle false.
- Public routes, protected-route redirect, authenticated project access, and the corrected Billing page were verified. Billing renders `Developer access` with real workspace totals. The only error log in the inspected interval predated the corrective deployment; the corrected request completed successfully.

## REMAINING MANUAL BLOCKERS

- **ACTION REQUIRED:** configure and approve the Paddle merchant account, products/prices, API key, webhook secret, checkout domain, and production webhook before accepting paid customers; then run sandbox and production lifecycle acceptance.
- **ACTION REQUIRED:** make `ashyeager/harikos.ai` private before treating source confidentiality as complete.
- Replace the current approved product video only when the final asset is supplied.
- Retain the older worktrees for now: the primary local `main` worktree contains a unique unpushed agent-configuration commit, so automated deletion would risk losing work.
- After these operational items, begin the dedicated UI/UX revamp as a separate mission.

## WHOLE-PRODUCT COHERENCE PASS

- Unified the public ivory and authenticated graphite modes around the HARIKOS logo, Space Grotesk/Inter/JetBrains Mono type system, restrained radii, visible borders, and champagne-gold emphasis.
- Replaced the legacy orange hexagon treatment with a graphite-and-gold project-state sphere, removed particle clutter and repeated section reveals, reduced ambient animation, capped WebGL density, and stopped the render loop entirely for reduced-motion users.
- Fixed signed-in primary actions whose text could disappear against white backgrounds, added a coherent workspace recovery page, distinguished GitHub lookup failures from honest empty installation state, and made Context start from the user's real task instead of canned input.
- Improved keyboard and screen-reader behavior for the public navigation, project/settings navigation, Truth filters, command palette, Memory composer, and asynchronous errors.
- Standardized public entry copy around `Start Free` and normalized project timestamps through the shared UTC formatter.
- Fresh gates: lint passed, typecheck passed, 25 test files / 77 tests passed, production build passed with 39 routes, and all 6 Playwright public journey checks passed on desktop and mobile.
- Independent Sol review returned `ship` after the valid recovery-copy and Escape-focus findings were fixed. Its request to restore red/green status colors was declined because the locked palette explicitly requires ivory, black, grey, and gold with status conveyed through labels and icons.
- Preview deployment `dpl_2UfJWoB8uKKaUpQnwfewsEn7Kqe4` reached READY. Public routes and `/api/status` passed; the authenticated browser check remained on the protected production domain rather than weakening Preview protection.
- Production deployment `dpl_8NzhjiEC1eKnHL7mLQu6c7xWjLXb` reached READY for release commit `3ac11c55b8c32e5a98d09159535baa46e3b6697d`. GitHub recorded the deployment against that exact SHA.
- Production verification passed for `/`, `/product`, `/developers`, `/pricing`, `/login`, `/api/status`, the unauthenticated app redirect, the authenticated billing/projects/project surfaces, GitHub installation discovery, live Truth/Evidence, and the corrected Context action. No new error-level Vercel logs were present.

## FINAL PRODUCTION PRODUCT / UI / COMMERCIAL LOCK

- Baseline: canonical `origin/main` `fd359eb8782d51e0846c0b4e1f8fe6720c24ecbb`, released from isolated branch `codex/final-visual-revamp`.
- Replaced Inter, Space Grotesk, and JetBrains Mono imports with Geist Sans and Geist Mono. Consolidated seven overlapping legacy style layers into one component layer plus shared base and scoped public theme files.
- Restricted the rendered palette to neutral black, white, grey, and champagne gold; raised microscopic operational labels and retained explicit text/icon status semantics.
- Rebuilt the homepage around “Many agents. One verified project state,” the final product video, one system flow, Truth/Memory/Context, one contradiction example, MCP, pricing, and one final CTA.
- Replaced the rejected glowing sphere with a skeletal project-state spear. Desktop uses lazy Three.js with capped DPR, a stopped offscreen loop, disposal, subtle motion, and reduced-motion handling; mobile uses the static structural fallback.
- Moved the final product video to `/public/media/harikos-product-demo.mp4`, preserved its full 16:9 frame with `object-fit: contain`, and removed the superseded root media copies.
- Kept the real Free workspace. Pro now advertises the optional one-time 7-day Paddle trial with no card required; signed webhook state remains the only trial entitlement authority.
- Added server-only, fail-soft Resend delivery for welcome, trial-started, trial-ending, and trial-expired messages. `harikos.email_events` provides durable idempotency; the additive migration is applied with RLS enabled and direct anon/authenticated grants revoked.
- Added the daily authenticated Vercel trial-reminder job and documented `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CRON_SECRET` without values.
- Verification: lint passed; separate typecheck passed; 25 test files / 78 tests passed; production build passed with 40 routes; 6/6 desktop/mobile Playwright journeys passed; `git diff --check` passed.
- Replaced the initial walkthrough with the supplied final 1280x720, 10-second product video and reduced the desktop frame to 980px so the complete composition remains visible without cropping.
- Corrected the Pro trial integration to use Paddle's documented cardless flow: validate a 7-day `requires_payment_method:false` price, create the customer and address, then create a server-side `status:billed` transaction. The UI waits for the signed subscription webhook before showing entitlement.
- Added a durable, expiring per-user trial reservation to prevent concurrent trial claims. The `harikos.trial_reservations` migration and the previously added transactional-email migration are now registered in Drizzle's journal and verified on the linked Supabase database.
- Corrected email delivery ordering: request handlers await the fail-soft delivery attempt, Resend's idempotency key protects retries, and `harikos.email_events` records only acknowledged sends.
- Cardless-trial conversion now requests Paddle's payment-method update transaction and uses its hosted checkout URL.
- Production configuration audit confirms Paddle, Resend, and the cron secret are not yet present in Vercel. Billing and lifecycle email remain honestly unavailable until those external credentials and catalog objects are configured.
- Corrective Preview `dpl_63NdZ49J2bKd1fFoQUuA3ubVUYgm` for commit `1532be62acfe42008473fd797088934537caebf5` reached READY. All 13 public route families, `/api/status`, and the final MP4 returned 200; unauthenticated `/app/dashboard` redirected to `/login`; no new error-level runtime logs were present.
- Final dependency review upgraded Next.js from 16.3.3 to 16.3.5 and pinned patched transitive Browserslist and baseline-browser-mapping releases. `pnpm audit --prod` now reports no known vulnerabilities.

## SHARED UX SYSTEM AND BLACK / WHITE RELEASE

- Added one shared UX provider for public and authenticated surfaces: binary BLACK/WHITE theme persistence, route transitions, scroll progress, accessible tooltips, global toasts, loading controls, skeletons, empty states, and safe confirmed-action feedback.
- Expanded the shared command palette with grouped, searchable, project-aware routes, keyboard navigation, focus trapping/restoration, and empty-search recovery. Added bounded load-more behavior to Truth and Memory lists.
- Placed the same BLACK/WHITE control across all 13 public routes, the authenticated app chrome, and the centered sign-in page. The Project Brain remains the sign-in backdrop; the authentication and GitHub authorization boundary remains unchanged.
- Local release gates passed: lint, separate typecheck, 25 test files / 78 tests, production build with 40 routes, 6/6 desktop/mobile Playwright journeys, `git diff --check`, secret scan, and explicit 375px/430px browser checks.
- Preview deployment `6443389935` completed for application commit `e1979ecaa147f4f343ffa380672dcdebb0e4f0a8`; rendered anonymous inspection was blocked by the configured Vercel SSO protection.
- Production deployment `6443417022` completed for the same commit and the public alias `https://harikos-ai.vercel.app` was verified independently. All 13 public routes exposed the toggle, centered login passed, 375px/430px had no overflow, `/api/status` returned Supabase Auth, PostgreSQL, and GitHub App ready, the logged-out dashboard redirected to `/login`, and the browser console remained clean.
