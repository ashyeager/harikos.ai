# HARIKOS AI

Production: [harikos-ai.vercel.app](https://harikos-ai.vercel.app)

HARIKOS AI is a cloud-first Project Truth layer for AI-built software. It
collects bounded repository evidence, derives typed claims, preserves temporal
history, surfaces contradictions, and prepares current context for coding
agents.

The production surface is a responsive Next.js application backed by Supabase
Auth, a read-only GitHub App, and Supabase PostgreSQL. SQLite and the CLI remain local
supporting adapters for deterministic development and verification.

## Requirements

- Node.js 20+
- pnpm 11+
- Git
- Supabase and GitHub credentials from `.env.example` for the cloud product

## Install and verify

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Run the product

```bash
pnpm dev:web
```

Open `http://localhost:3000`. Public pages remain available without credentials;
product routes require a verified Supabase Auth session. Copy `.env.example`
to `.env.local` only when configuring the real GitHub and PostgreSQL boundaries.

## Local CLI

```bash
pnpm exec harikos init --cwd .
pnpm exec harikos scan --cwd .
pnpm exec harikos truth --cwd .
pnpm exec harikos context --cwd . --task "Modify authentication middleware"
```

Local state lives under `.harikos/` and is ignored by Git.

## Reproducible flagship proof

```bash
pnpm demo
```

The demo creates a temporary Git repository, verifies Clerk as the original
authentication provider, applies a Supabase migration, and proves that:

- Supabase Auth becomes `VERIFIED`;
- Clerk becomes `SUPERSEDED`;
- the stale README becomes an open contradiction;
- generated agent context uses Supabase as current truth.

## Canonical documents

- [`docs/harikos_ai_prd.md`](docs/harikos_ai_prd.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/MVP.md`](docs/MVP.md)
- [`docs/BUILD_STATE.md`](docs/BUILD_STATE.md)

## Deploy to Vercel

Create a Vercel project with `apps/web` as its Root Directory. The checked-in
`apps/web/vercel.json` builds the web application together with its required
`@harikos/db` and `@harikos/core` workspace packages.

Connect the Supabase Marketplace resource to Vercel, configure the GitHub OAuth
provider in Supabase, and add only the server-side GitHub App values listed in
`.env.example`. Never commit credential values. Apply schema migrations with
`pnpm db:migrate:cloud` before promoting a release.
