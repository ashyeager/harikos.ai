# HARIKOS AI product requirements

## Current product lock (September 2026)

HARIKOS is a cloud-first, closed-source SaaS for verified project state for AI coding agents.

**Category:** The truth layer for AI agents.

**Promise:** One verified project state. Every agent.

HARIKOS keeps Truth, Evidence, Changes, Contradictions, Memory, Context, and agent state coherent as an authorized GitHub repository evolves. Truth is current evidence-backed state. Memory is durable project history. Agent statements never become Truth without evidence.

## Product loop

```text
Supabase sign-in
-> HARIKOS-owned Free entitlement or paid Paddle entitlement
-> authorized GitHub App repository
-> scan and Evidence
-> current Truth and contradictions
-> persistent Memory
-> task-specific Context
-> project-scoped remote MCP
-> agent outcome/write-back
-> repository change
-> paid automatic reverification or Free refresh-required state
```

## Plans

All limits are server-side and centralized in `apps/web/lib/entitlements.ts`.

- **Free — $0:** one active project, one active agent, initial scan plus one additional manual rescan per calendar month, three Context Packs per month, ten Memory writes per month, and no automatic push reverification. Existing Truth, Evidence, project data, Memory, and read-style MCP remain available.
- **Core — $9/month:** one active project and one active agent with continuous push reverification and ongoing usage.
- **Pro — $29/month:** five active projects and five active agents with continuous reverification. Eligible users may choose one seven-day Pro trial through Paddle.
- **Scale — $79/month:** twenty active projects and twenty active agents with high usage limits.
- **Enterprise — custom:** contact path only; no unsupported enterprise features are promised.

A new authenticated nondeveloper without a current paid subscription resolves to Free. Free does not require Paddle. Paddle webhook state remains authoritative for paid and trial entitlement. A checkout return URL never grants access. Developer access uses immutable server-side identity and still requires authentication, GitHub authorization, ownership, and project isolation.

## Product boundaries

- `apps/web` is the only production web application.
- Supabase Auth owns browser sessions and server identity.
- Supabase PostgreSQL stores account, repository, Truth, Memory, Context, usage, billing, and agent state.
- The GitHub App uses read-only Contents and Metadata permissions.
- `/api/mcp/[projectId]` is the remote agent bridge; tokens are hashed, scoped, shown once, and revocable.
- Free quota usage is persistent account state and resets on a deterministic calendar-month window.
- A Free push marks repository state as requiring refresh without presenting stale Truth as current or consuming unlimited scans.
- Paid and developer accounts retain continuous push reverification.

## Release policy

Changes ship through an isolated branch, full lint/typecheck/test/build/e2e gates, Preview browser acceptance, final diff review, and exact-SHA production verification. Production renders real state or honest loading, empty, disabled, or error state. No customer data, subscriptions, metrics, repositories, scans, or agent activity may be fabricated.

For real architecture and setup details, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [SETUP.md](./SETUP.md). For dated release evidence, see [DAILY.md](../DAILY.md).
