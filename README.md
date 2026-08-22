# HARIKOS AI

HARIKOS AI is a local-first project-truth layer for AI coding agents. It scans a Git repository, derives evidence-backed claims, preserves temporal history, and exposes the same state through a CLI, an MCP server, and a local web dashboard.

## Requirements

- Node.js 20+
- pnpm 11+
- Git

## Install and verify

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Use in a repository

From a Git repository:

```bash
pnpm --dir /path/to/harikos-ai exec harikos init
pnpm --dir /path/to/harikos-ai exec harikos scan
pnpm --dir /path/to/harikos-ai exec harikos truth
pnpm --dir /path/to/harikos-ai exec harikos status
```

The initialized repository receives `.harikos/config.json` and `.harikos/project.db`; `.harikos/` is added to its `.gitignore`.

Run `harikos init` to print the exact local MCP configuration. Start the inspection dashboard with `harikos ui`.

## Reproducible proof

```bash
pnpm demo
```

The demo creates a clean temporary Git repository, scans a Firebase implementation, records a decision, applies a Clerk migration, rescans, and verifies that Firebase is historical while Clerk is current.

The product specification and locked build scope live in [`docs/harikos_ai_prd.md`](docs/harikos_ai_prd.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), and [`docs/MVP.md`](docs/MVP.md).
