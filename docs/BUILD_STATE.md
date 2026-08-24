# HARIKOS AI Build State

Updated: August 24, 2026

## REAL

- V3 product, architecture, and agent instructions migrated to canonical paths.
- Supabase Auth GitHub identity, callback, SSR session cookies, protected app routes, and logout.
- GitHub App installation flow with signed state, installation ownership checks, and read-only short-lived installation tokens.
- GitHub repository listing and repository-scoped authorization.
- Provider-neutral `RepositorySource` with local and GitHub implementations.
- Bounded deterministic repository scanning with secret/path filtering.
- Truth resolution with evidence, confidence, temporal validity, contradictions, and supersession.
- Cloud PostgreSQL persistence for users, projects, repositories, scans, claims, evidence, contradictions, changes, memories, context packs, and agent connections.
- Ownership-filtered cloud project queries and server-only database access.
- Human project overview, Truth, claim detail, Changes, Understand, Context, Projects, and Settings routes.
- Local SQLite persistence, CLI diagnostics, flagship Clerk-to-Supabase fixture, unit tests, build, and browser test configuration.
- Google OAuth initiation is implemented as a separate Supabase Auth provider path; external provider dashboard setup is required.
- Centralized Free/Pro entitlement defaults exist; server-side usage enforcement is still partial.

## PARTIAL

- Cloud Memory CRUD and a project Memory UI now persist real records for GitHub projects; search is currently type filtering and agent write-back is not connected.
- Context generation is real and persisted for GitHub projects, but currently derives from the existing snapshot and does not yet include cloud Memory.
- Dashboard and project surfaces still use the clearly labeled fixture as a default visual shell in some routes.
- Scan status persistence exists, but scans are user-triggered and there is no webhook-driven incremental reverification.
- Remote HTTP MCP transport, project-scoped hashed bearer tokens, token revocation, and Truth/Context read tools exist; agent sessions, Memory/Outcome write-back, and the MCP SDK package implementation remain incomplete.
- Stripe server routes for Checkout, signed subscription webhooks, and Customer Portal exist; entitlement persistence and server-side Free/Pro limits are not yet wired into project/agent/memory operations.
- User/profile persistence exists through cloud user upsert, but there is no separate profile/settings model.

## MOCKED

- The isolated flagship fixture is used for local/demo product routes and is explicitly labeled as a fixture.
- No production success path intentionally fabricates repository, scan, memory, agent, customer, or billing state.

## BLOCKED

- Stripe Checkout, signed webhook entitlement updates, Customer Portal, and centralized Free/Pro enforcement are not implemented.
- Stripe routes are CONFIG_REQUIRED until Stripe credentials and webhook dashboard configuration exist; webhook-derived subscription state is persisted when configured.
- Agent handoff is blocked: MCP Memory/Outcome writes and session persistence are not implemented.
- Automatic GitHub webhook drift processing is not implemented.

## CONFIG REQUIRED

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `HARIKOS_SESSION_SECRET`
- `GITHUB_APP_ID`
- `GITHUB_APP_SLUG`
- `GITHUB_APP_PRIVATE_KEY`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `DATABASE_URL` or `POSTGRES_URL`
- Stripe variables are not yet consumed by the application.
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`

## NEXT

1. Integrate cloud Memory into Context and add MCP Memory/Outcome/session write-back.
2. Persist webhook-derived billing state and enforce centralized Free/Pro entitlements.
3. Replace fixture defaults in authenticated dashboard paths with real empty states and real counts.
