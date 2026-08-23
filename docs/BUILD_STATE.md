# HARIKOS AI Build State

Updated: August 23, 2026

## Verified locally

- cloud-first canonical PRD, architecture, MVP, and implementation ADR;
- local and GitHub `RepositorySource` adapters with secret/path controls;
- deterministic high-signal scanning and active-import detection;
- evidence-backed claims, confidence, contradictions, supersession, and stale-state handling;
- task-specific Context Packs and evidence-grounded project explanations;
- SQLite persistence retained for local tools;
- Supabase PostgreSQL schema, migrations, ownership-filtered project queries, and RLS-enabled server-only tables;
- Supabase Auth with GitHub identity and refreshed SSR cookies;
- signed GitHub installation state plus repository-scoped, short-lived, read-only GitHub App tokens;
- landing, login, projects, overview, truth, claim detail, changes, understand, context, and settings routes;
- typed APIs, supporting CLI, and reproducible Clerk-to-Supabase fixture;
- desktop/mobile browser flow, responsive layout, runtime/console checks, and Playwright coverage.

## Verified in production

Production at <https://harikos-ai.vercel.app> was exercised end to end with the
canonical private repository `ashyeager/harikos.ai`:

- GitHub sign-in completed through Supabase Auth;
- the public GitHub App was installed with only Contents: Read and Metadata: Read;
- installation ownership was verified against the signed-in GitHub identity;
- access was restricted to the canonical repository;
- the first GitHub scan persisted one project, one completed scan, 9 claims, and
  51 evidence rows from 42 analyzed source files;
- Project Truth, claim provenance, and a persisted Context Pack rendered from
  the managed PostgreSQL data.

Production secrets are stored only in Supabase, GitHub, and Vercel. No secret or
private-key material is stored in this repository. `.env.example` documents the
required names without values.

## Deferred boundary

GitHub webhooks are intentionally deferred. Scans are user-triggered and always
resolve a fresh, repository-scoped installation token; no webhook-dependent
success path is shown.

## Verification commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm demo
```

## Delivery boundary

The repository includes the Vercel monorepo build configuration for the Next.js
application under `apps/web`. Production verification covers rendered pages,
authentication, GitHub authorization, PostgreSQL writes, scanning, truth
retrieval, and Context Pack persistence rather than deployment status alone.

Canonical production URL: <https://harikos-ai.vercel.app>
