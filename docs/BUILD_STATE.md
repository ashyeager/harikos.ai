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
- Cloud PostgreSQL persistence for users, projects, repositories, scans, claims, evidence, contradictions, changes, memories, context packs, agent connections, agent sessions, outcomes, and subscription records is migration-backed; live target verification requires configured credentials.
- Ownership-filtered cloud project queries and server-only database access.
- Human project overview, Truth, claim detail, Changes, Understand, Context, Projects, and Settings routes.
- Local SQLite persistence, CLI diagnostics, flagship Clerk-to-Supabase fixture, unit tests, build, and browser test configuration.
- Google OAuth initiation and provider-aware identity parsing are implemented as a separate Supabase Auth path; external provider dashboard setup is required.
- Centralized Free/Pro entitlement defaults exist; server-side usage enforcement is still partial.

## PARTIAL

- Cloud Memory CRUD/UI, agent Memory search/write-back, and Memory-to-Context retrieval are implemented; live persistence requires the configured Supabase database.
- Context generation combines current Truth with active relevant Memory for browser and MCP requests.
- Dashboard and project surfaces still use the clearly labeled fixture as a default visual shell in some routes.
- Scan status persistence exists; manual scans and signed GitHub push webhook bounded rescans are implemented; live webhook delivery requires GitHub App dashboard configuration.
- Remote HTTP MCP transport, project-scoped hashed bearer tokens, token revocation, Truth/Memory/Context/Changes/assumption tools, AgentSession lifecycle, and Outcome/Memory write-back are implemented without browser-session dependency.
- Stripe server routes for Checkout, signed subscription webhooks, Customer Portal, subscription persistence, and centralized entitlement definitions exist; live Stripe configuration and broad server-side usage enforcement remain deferred.
- User/profile persistence exists through cloud user upsert, but there is no separate profile/settings model.

## MOCKED

- The isolated flagship fixture is used for local/demo product routes and is explicitly labeled as a fixture.
- No production success path intentionally fabricates repository, scan, memory, agent, customer, or billing state.

## BLOCKED

- Live Supabase acceptance flow and negative ownership test cannot run without the existing project's credentials in this environment.
- Live Stripe payment/webhook verification is deferred by mission scope.

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
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`

## NEXT

1. Configure the existing Supabase project and apply/verify cloud migrations.
2. Run the real Google/GitHub, GitHub App, scan, Memory, MCP handoff, and webhook acceptance flows.
3. Perform the dedicated frontend/UI/UX overhaul after this functional lock.
