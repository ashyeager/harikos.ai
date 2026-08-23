# ADR 0001: Cloud-first SaaS boundaries

- Status: accepted
- Date: 2026-08-23

## Context

HARIKOS began with a verified SQLite/init foundation, but the canonical product
is now a cloud-first GitHub-connected SaaS. The Truth Engine must remain usable
for deterministic local tests while the production product uses GitHub and
PostgreSQL.

## Decision

1. Introduce a provider-neutral `RepositorySource` contract with
   `LocalRepositorySource` and `GitHubRepositorySource` implementations.
2. Keep truth resolution in `packages/core` and adapters at the edges.
3. Retain SQLite for local proof, tests, CLI diagnostics, and future local mode.
4. Add a real PostgreSQL/Drizzle adapter as the SaaS persistence boundary.
5. Keep GitHub OAuth/App credentials server-side and expose an honest local demo
   session when they are absent.
6. Do not permanently clone connected repositories; fetch bounded files and
   persist derived truth plus evidence pointers.

## Consequences

The local product remains fully testable without external credentials while the
production boundaries no longer encode a local-first product assumption. Some
Stage 1 flows use SQLite; production project ownership and durable multi-user
state require configured PostgreSQL and GitHub credentials.

## Alternatives

- Rebuilding everything around Postgres immediately would discard verified
  Phase 1 work and make local proof credential-dependent.
- Keeping only SQLite would preserve the old architecture and fail the current
  SaaS direction.

## Rollback

The adapters are isolated. Either persistence or repository source can be
replaced without changing deterministic analyzers or truth-resolution rules.
