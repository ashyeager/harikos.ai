# HARIKOS AI Build State

Updated: August 23, 2026

## Verified locally

- cloud-first canonical PRD, architecture, MVP, and implementation ADR;
- local and GitHub `RepositorySource` adapters with secret/path controls;
- deterministic high-signal scanning and active-import detection;
- evidence-backed claims, confidence, contradictions, supersession, and stale-state handling;
- task-specific Context Packs and evidence-grounded project explanations;
- SQLite persistence retained for local tools;
- PostgreSQL/Supabase-ready schema, migrations, and authorized project queries;
- encrypted GitHub OAuth sessions and repository-scoped, read-only GitHub App tokens;
- landing, login, projects, overview, truth, claim detail, changes, understand, context, and settings routes;
- typed APIs, supporting CLI, and reproducible Clerk-to-Supabase fixture;
- desktop/mobile browser flow, responsive layout, runtime/console checks, and Playwright coverage.

## Credential-dependent

The GitHub OAuth/App and PostgreSQL implementations are real, but this checkout
does not contain credentials. Their live external handshake and managed database
connection therefore remain unverified. The UI reports these boundaries as
`NOT CONFIGURED` instead of simulating success.

Required values are documented in `.env.example`:

- `HARIKOS_SESSION_SECRET`;
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`;
- `GITHUB_APP_ID`, `GITHUB_APP_SLUG`, and `GITHUB_APP_PRIVATE_KEY`;
- `DATABASE_URL`.

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

The repository includes a Vercel monorepo build configuration for the Next.js
application under `apps/web`. Production deployment and its live verification
are tracked as release evidence rather than inferred from a local build.
