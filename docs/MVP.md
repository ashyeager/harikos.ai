# HARIKOS AI Cloud MVP

**Status:** Active local delivery scope
**Date:** August 23, 2026
**Product direction:** Cloud-first web SaaS

## Proof

The MVP must make this complete story real:

```text
repository
-> bounded evidence collection
-> deterministic candidate claims
-> temporal Project Truth
-> visible evidence and drift
-> current task Context Pack
```

The flagship controlled transition is Clerk to Supabase. Supabase must become
`VERIFIED`, Clerk must become `SUPERSEDED`, a stale README reference must be
represented as a contradiction, and authentication context must use Supabase.

## Required local product

- polished public landing and login/onboarding experience;
- one responsive Next.js App Router product;
- projects, overview, truth, claim detail, changes, understand, context, and settings routes;
- `RepositorySource` with local and GitHub implementations;
- real deterministic analysis of modern JavaScript/TypeScript repositories;
- evidence-backed, scoped, temporal claims;
- explicit contradictions and supersession;
- task-specific Context Packs using current truth;
- PostgreSQL/Supabase-ready SaaS persistence with SQLite retained for local tools and deterministic tests;
- GitHub OAuth/App integration boundaries that fail safely when credentials are absent;
- typed and authorized API boundaries;
- a real local repository analysis path and a reproducible flagship fixture;
- accessible states, purposeful motion, responsive browser behavior, and honest configuration messaging.

## Credential-dependent boundaries

Missing GitHub or PostgreSQL credentials must never be replaced with invented
values or fake success. Local development may expose a clearly labeled demo
session, `LocalRepositorySource`, the controlled fixture, and the verified
SQLite adapter. The GitHub and PostgreSQL implementations must remain real,
server-only boundaries ready for supplied credentials.

## Non-goals

- billing, subscriptions, teams, enterprise RBAC, or SSO;
- GitLab, Bitbucket, Slack, Linear, Jira, IDE extensions, or a mobile app;
- webhook-driven incremental reverification beyond the documented boundary;
- autonomous repository mutation or arbitrary code execution;
- generic repo chat, vector databases, graph databases, or broad RAG infrastructure;
- Kubernetes, Kafka, microservices, Redis, or premature distributed systems;
- deployment during this stage.

## Quality gate

From the repository root:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Also exercise the real scanner/Truth flow, the Clerk-to-Supabase fixture, API
contracts, and critical browser routes. Do not push until the local gate passes.

## Definition of done

The local MVP is done when a builder can open HARIKOS, understand a real
project, inspect why its important truths are believed, see semantic drift,
prepare current agent context, and distinguish operational integrations from
credential-dependent configuration without encountering mocked success paths.
