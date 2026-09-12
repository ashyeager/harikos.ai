# HARIKOS architecture

**Current authority:** September 2026 production architecture.

HARIKOS is a cloud SaaS that maintains verified project state for AI coding agents. The canonical production application is `apps/web`. This document describes the current runtime; older planning and phase documents are historical.

## System map

```text
Browser / coding agent
        |
        v
Next.js App Router (`apps/web`)
  |-- Supabase Auth session and server identity
  |-- centralized entitlement and quota policy
  |-- GitHub App installation and repository authorization
  |-- remote project-scoped MCP endpoint
        |
        v
Supabase PostgreSQL (`packages/db`)
  users, subscriptions, installations, repositories, projects,
  scans, evidence, claims, contradictions, changes, memories,
  context packs, agent connections, sessions, outcomes, email events
        |
        v
Truth domain (`packages/core`)
  deterministic repository scan -> evidence -> claims -> current/historical Truth
```

## Repository layout

- `apps/web`: only customer-facing and Vercel production application; public site, authenticated app, auth callbacks, GitHub, billing, scan, project, and MCP routes.
- `packages/core`: repository source contracts, deterministic parsers, evidence, claims, contradictions, temporal resolution, Context composition, and domain schemas.
- `packages/db`: PostgreSQL schema and migrations. SQLite adapters remain engineering/test support only.
- `packages/cli`: internal engineering verification harness; it is not a customer product surface.
- `tests/fixtures` and package fixtures: deterministic test repositories and local verification data.

The remote MCP implementation is `apps/web/app/api/mcp/[projectId]/route.ts`. There is no separate production MCP service.

## Identity and authorization

Supabase Auth provides GitHub and Google OAuth, cookie-backed sessions, callback exchange, refresh, and logout. Every protected server operation resolves identity on the server. Redirect targets pass through `safeAuthNext`.

GitHub sign-in and GitHub App installation are separate. Installation callbacks verify the authenticated HARIKOS user, GitHub installation ownership, selected repository metadata, and installation binding. Private data requires both authenticated ownership and database policy boundaries.

Developer access is derived from the immutable Supabase UUID allowlist or persisted server-side role. It bypasses commercial payment and quotas while retaining authentication, ownership, GitHub authorization, and project isolation.

## Entitlement and quotas

`apps/web/lib/entitlements.ts` is the only plan-policy authority. It defines Free, Core, Pro, Scale, and Enterprise limits for projects, agents, monthly manual scans, Context Packs, Memory writes, and continuous push reverification.

New authenticated nondeveloper accounts without a current paid Paddle subscription resolve to Free. Free has one project, one agent, an initial scan plus one manual rescan per UTC calendar month, three Context Packs per month, ten Memory writes per month, and no automatic push reverification. Existing Truth, Evidence, Memory, Context history, and read-style MCP remain readable after a write quota is exhausted.

Core, Pro, and Scale use signed Paddle subscription state. Trialing and active subscriptions are valid only through their persisted provider period. Checkout return URLs only trigger a bounded status refresh; they never grant entitlement. Past-due, canceled, expired, and invalid subscriptions fall back to Free access and preserve user data.

Quota usage is derived from persistent account-owned records and UTC calendar-month timestamps, so logout, cookies, or OAuth reconnection cannot reset it. Route handlers and MCP write tools call the same quota functions.

## GitHub and reverification

The GitHub App uses Contents: Read and Metadata: Read. HARIKOS creates short-lived installation tokens server-side and does not store them.

A signed default-branch push locates the installation-bound project. Paid and developer entitlements trigger the existing bounded scan. Free records `refresh_required_at` and does not run an automatic full scan. The UI presents that state as repository changed / verification required. A successful allowed manual scan clears it.

## Truth, Evidence, Memory, and Context

The scanner fetches bounded authorized repository files, rejects secret paths, and derives deterministic evidence before claims. Claims link to file, line, commit, authority, confidence, and validity data. Contradictions and superseded state remain inspectable.

Truth represents what current evidence supports. Memory records decisions, attempts, failures, fixes, discoveries, and outcomes. Recording Memory never promotes an assertion into Truth. Context Packs select the smallest useful combination of current Truth, evidence, changes, constraints, and relevant Memory for a stated task.

## Agent bridge

Project-scoped tokens are high entropy, stored as hashes with a display prefix, shown once, and revocable. The remote MCP endpoint verifies token, project scope, ownership, entitlement, and applicable quotas. Read tools can retrieve Truth, Evidence, changes, and Memory. Context generation and Memory write-back share the browser product quota checks. Sessions and outcomes remain tied to the authenticated agent connection.

## Billing

Paddle is the single paid billing authority. Hosted checkout handles payment details. Signed, idempotent webhooks persist customer, subscription, price, plan, status, trial, period, cancellation, and provider event data. Customer management uses Paddle URLs. Free and developer access do not require Paddle.

Paddle merchant credentials and production catalog are external deployment configuration. Missing billing configuration produces an honest temporary-unavailable state and never fabricates a subscription.

## Transactional email

Resend is the single transactional email transport. Welcome and trial lifecycle messages derive their recipient from the authenticated server-side account or verified Paddle event. `harikos.email_events` provides durable idempotency, and delivery fails softly so an email outage cannot undo a successful account or billing transition.

## Deployment and verification

Vercel builds the monorepo and serves `apps/web`. Releases follow:

```text
isolated branch -> lint -> typecheck -> unit/integration tests -> production build
-> browser/e2e checks -> Preview -> final diff review -> main -> Production
```

Production acceptance requires exact commit parity between GitHub `main` and the Vercel deployment, a healthy `/api/status`, public/auth boundary checks, and no new runtime errors. Environment secrets stay outside Git and are never exposed to the browser.
