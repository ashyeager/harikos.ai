# AGENTS.md — HARIKOS production rules

**Authority:** September 2026 product lock. These instructions supersede older phase, local-first, demo, open-source, and pricing documents.

## Product

HARIKOS is verified project state for AI coding agents: the truth layer for AI agents.

```text
GitHub repository -> scan -> Evidence -> current Truth -> Changes and contradictions
-> persistent Memory -> task-specific Context -> MCP agent -> outcome/write-back
-> repository change -> reverification
```

Truth and Memory are separate. Truth is what current evidence supports. Memory records what happened. Agent statements never become Truth without evidence. Preserve provenance, uncertainty, contradictions, supersession, and temporal history.

HARIKOS is a cloud-first, closed-source SaaS. `apps/web` is the only production web app. Do not create alternate frontends, local/demo customer modes, fake production state, generic chat, or another coding agent.

## Plans and entitlement

`apps/web/lib/entitlements.ts` is the single server-side plan authority.

- Free: $0; 1 active project; 1 active agent; initial scan plus 1 manual rescan per UTC calendar month; 3 Context Packs/month; 10 Memory writes/month; no automatic push reverification.
- Core: $9/month; 1 project; 1 agent; continuous reverification and ongoing usage.
- Pro: $29/month; 5 projects; 5 agents; continuous reverification; optional one-time 7-day no-card trial for eligible accounts.
- Scale: $79/month; 20 projects; 20 agents; high usage.
- Enterprise: custom contact path; do not invent enterprise capabilities.

A new authenticated nondeveloper without a valid paid subscription receives Free. Free does not require Paddle. Free users can complete the real GitHub -> scan -> Truth/Evidence -> one agent -> Context loop. Reading existing Truth, Evidence, Memory, Context history, and read-style MCP remains available after write quota exhaustion.

Paddle is the only paid billing authority. Signed webhooks determine trial and paid state. Never grant entitlement from browser redirects or client data. Missing Paddle configuration must produce an honest temporary-unavailable state.

Developer access uses an immutable Supabase UUID allowlist or persisted server-side role. It bypasses payment and quotas while retaining authentication, ownership, GitHub authorization, isolation, and token security.

## Authentication and data

Use Supabase Auth with current SSR cookie patterns. Resolve identity server-side for protected operations. Validate redirect targets. GitHub login and GitHub App repository authorization are separate.

Supabase PostgreSQL stores users, subscription state, GitHub installations, repositories, projects, scans, claims, evidence, contradictions, changes, memories, Context Packs, agent connections, sessions, outcomes, and usage state. Inspect remote schema and checked-in migrations before DDL. Prefer additive migration and preserve data. Use RLS where appropriate and retain application-level ownership checks.

Never commit or expose `.env` files, private keys, service-role keys, OAuth secrets, Paddle secrets, GitHub secrets, webhook secrets, user tokens, or agent tokens.

## GitHub and scans

Preserve the working GitHub App path and least privileges: Contents Read and Metadata Read. Validate installation ownership and repository selection. Use short-lived installation tokens.

Verify webhook signatures. Paid and developer default-branch pushes reverify the project. Free pushes record that the repository changed and requires refresh; they do not run unlimited scans. A successful allowed manual scan clears the refresh-required state. Never present stale state as continuously verified.

Do not rewrite the Truth engine speculatively. Fix proven defects narrowly. Do not ingest secret paths or execute arbitrary repository code.

## MCP

The production remote endpoint is `apps/web/app/api/mcp/[projectId]/route.ts`. Maintain semantic tools for project Truth, Memory search, recent changes, Context Packs, assumption checks, Memory/outcome write-back, and agent sessions. Reuse tools rather than duplicating them.

Tokens are high entropy, hashed, project-scoped, shown once, and revocable. Every call checks token, project scope, ownership, and entitlement. Free read tools remain useful; Context and Memory writes enforce the same persistent quotas as the browser product. Revoked tokens fail immediately.

## Product experience

Marketing uses warm ivory, near-black type, and champagne gold. Product surfaces use graphite. Orange denotes changes, contradictions, or warnings; green denotes verified. Preserve the approved architectural H logo. The homepage uses:

- “Your agents can read the code. HARIKOS tells them what’s actually true.”
- “Continuously verified project state, evidence, memory, and task-specific context for AI coding agents.”
- “One verified project state. Every agent.”
- Primary CTA: “Start Free.”

Do not redesign established routes without explicit instruction. Keep the multi-page public site and refine existing app flows. Use real data or honest loading, empty, disabled, refresh-required, and error states. No fake repos, users, scans, billing, metrics, customers, memories, agents, testimonials, or integrations.

## Repository work

Before modifying, read `docs/harikos_ai_prd.md`, `docs/ARCHITECTURE.md`, `docs/SETUP.md`, relevant ADRs, current manifests, schema/migrations, and the affected implementation. Check `git status`, branch, and diff. Preserve uncommitted work.

Before deleting or replacing code, trace imports, runtime use, scripts/tests, Vercel use, and package consumers. Delete only when dead, duplicate, superseded, or unsafe is proven. Local development, fixtures, tests, mock servers, and verification tools remain legitimate engineering infrastructure.

Never use `git reset --hard`, `git clean -fd`, force-push, or destructive data migration without explicit authorization.

## Verification and release

Run the configured layers appropriate to the change:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
git diff --check
```

Do not treat a Next build that skips checks as proof; run typecheck separately. Browser-check desktop and mobile, public routes, login boundaries, real data states, and console errors.

Release from an isolated `codex/` branch. Push the branch, verify the Vercel Preview, and run a fresh final-diff security/correctness review. Only then merge/push to `main` without force and verify Production is READY at the exact expected SHA. Check `/`, `/pricing`, `/login`, `/api/status`, protected-route behavior, and configured authenticated/GitHub/MCP flows. Record evidence in `DAILY.md` without fabricating untested success.
