# AGENTS.md — HARIKOS AI Repository Instructions

These instructions apply to Codex, Claude Code, Cursor agents, Hermes, and other coding agents working in this repository.

## 1. Read First

Before significant product or architecture work, read:

1. `docs/harikos_ai_prd.md`
2. `docs/ARCHITECTURE.md`

These are authoritative.

If `docs/MVP.md` or older docs still describe local-first, SQLite-first, CLI/MCP-first, no auth, no GitHub App, or “cloud later,” treat those sections as **legacy/superseded** unless explicitly updated after August 23, 2026.

## 2. Product Definition

HARIKOS AI is:

> **The truth layer for AI-built software.**

It is a cloud-first web SaaS that connects to repositories, derives evidence-backed Project Truth, tracks when truth changes, explains the project to the builder, and provides current task-specific context to coding agents.

It is not primarily:

- a local CLI;
- generic repo chat;
- a vector DB;
- generic memory;
- an MCP server;
- a Claude-only/Codex-only plugin;
- an open-source project.

CLI/MCP/local tooling can remain supporting/future interfaces.

## 3. MVP Loop

```text
repository
→ inspect high-signal state
→ derive claims
→ attach evidence
→ resolve Project Truth
→ render truth
→ detect stale/superseded truth
→ show contradictions/drift
→ generate task-specific Context Pack
```

Flagship test:

```text
Clerk
→ repo migrates
→ Supabase

HARIKOS:
Supabase = VERIFIED
Clerk = SUPERSEDED
stale README = CONTRADICTION
```

## 4. Core Invariants

### Truth != Memory
Historical memory is not automatically current truth.

### Evidence
Important verified claims require meaningful evidence.

### Temporal Truth
Preserve history. Use validity/supersession.

### Contradictions
Do not silently flatten conflicts.

### LLM Output
Model claims are candidates until resolved.

### Deterministic First
Do not use AI for facts source/config/Git/tests can establish reliably.

### Repository Abstraction
Truth logic must not directly depend on GitHub or filesystem. Maintain `RepositorySource`-style boundaries.

### Cloud-First
Localhost is development, not the product model.

### PostgreSQL
Main SaaS persistence is PostgreSQL. SQLite may remain for tests/legacy/local tools.

### Agent-Neutral
Do not lock the engine to one provider/agent.

### Minimal Context
Do not dump entire project memory into agents.

## 5. Technology Direction

Use existing stack where compatible:

- TypeScript
- Node.js
- pnpm
- Next.js
- Tailwind/reusable components
- PostgreSQL / Supabase Postgres
- Drizzle where practical
- Zod
- GitHub App / Octokit
- provider-agnostic AI
- Vitest
- Playwright
- Vercel

Phase 1 tools may remain where useful:

- SQLite
- Commander CLI
- MCP TypeScript SDK
- local scanner

## 6. Preserve Phase 1

Prefer to reuse/adapt:

- parsers;
- scanner logic;
- claim/evidence models;
- truth resolver;
- contradictions;
- supersession;
- memory;
- context;
- evaluation fixtures;
- tests;
- AI provider abstraction.

Typical migration:

```text
local scanner
→ RepositorySource
→ LocalRepositorySource + GitHubRepositorySource

SQLite-only
→ PostgreSQL main SaaS DB

CLI-first
→ web-first

local MCP-first
→ later agent integration
```

## 7. Product Surface

Public:

```text
/
login
```

Authenticated:

```text
/app/dashboard
/app/projects
/app/project/[id]
/app/project/[id]/truth
/app/project/[id]/changes
/app/project/[id]/understand
/app/project/[id]/context
/app/settings
```

Keep one Next.js app and one eventual Vercel deployment initially.

## 8. UX Standard

HARIKOS should be premium, fast, understandable, accessible, responsive, and interactive.

Motion should communicate state, progress, or change.

Avoid generic AI visuals, useless animation, or heavy 3D that harms usability.

3D/video are optional marketing tools, not core product dependencies.

## 9. GitHub Rules

Production MVP should use a GitHub App.

Prefer initial permissions:

```text
Contents: Read
Metadata: Read
```

Never ask normal users to paste PATs.

Never expose GitHub secrets client-side.

Authorize every project/repository action to the current user/workspace.

## 10. Data Policy

Default:

```text
GitHub
→ fetch relevant source temporarily
→ analyze
→ derive Project Truth
→ discard unnecessary raw source
→ persist claims/evidence pointers/history
```

Never ingest live `.env` secrets, tokens, keys, or credentials.

Do not claim privacy properties the implementation does not actually provide.

## 11. Dependency Policy

Before adding a dependency:

1. check built-in/framework capability;
2. check existing dependencies;
3. prefer maintained focused packages;
4. consider security/performance;
5. avoid packages for trivial utilities.

Do not add infrastructure for hypothetical scale.

## 12. Scope Control

Do not prioritize unless explicitly requested:

- billing;
- enterprise SSO;
- complex team RBAC;
- GitLab/Bitbucket;
- Jira/Linear/Slack;
- mobile/desktop;
- self-hosting;
- Kubernetes;
- Kafka;
- Neo4j;
- Elasticsearch;
- large vector systems;
- microservices;
- autonomous action gateway.

Current focus:

```text
repo
→ truth
→ evidence
→ drift
→ explanation
→ context
```

## 13. Vertical Slices

Prefer:

> one real repository → real truth → DB → UI

over:

> many mocked screens or giant infrastructure.

Leave the repo runnable/testable after meaningful steps.

## 14. Database Rules

Main SaaS DB:

> PostgreSQL

Core concepts:

```text
User
Project
Repository
Scan
Claim
Evidence
Contradiction
Memory
ProjectChange
ContextPack
```

Do not collapse Claim and Memory.

Do not delete SQLite if it remains useful to tests/Phase 1.

## 15. AI Rules

Model output should:

- be structured where practical;
- be validated;
- preserve provenance;
- remain candidate until resolved;
- never silently overwrite truth.

AI interprets evidence; it does not manufacture authority.

## 16. Security

Never:

- commit secrets;
- expose service-role keys client-side;
- log credentials;
- trust project IDs without authorization;
- skip webhook verification;
- render unsafe repository HTML;
- execute arbitrary repo code without a safe explicit design.

Maintain `.env.example`.

## 17. Git Safety

Before risky changes:

- inspect `git status`;
- inspect branch;
- preserve uncommitted work.

Never without explicit approval:

```bash
git reset --hard
git clean -fd
git push --force
```

Do not push or deploy unless explicitly instructed.

## 18. Tests

At milestones run relevant:

- typecheck;
- lint;
- unit tests;
- integration tests;
- production build;
- browser/Playwright checks.

Important fixtures:

- Firebase → Clerk;
- Clerk → Supabase;
- Drizzle → Prisma;
- stale README;
- installed-but-unused package;
- migration coexistence;
- agent hallucination.

## 19. Repository Context

Maintain when present:

```text
docs/harikos_ai_prd.md
docs/ARCHITECTURE.md
docs/BUILD_STATE.md
docs/adr/
```

`AGENTS.md` is a map, not the complete product spec.

Update `BUILD_STATE.md` after meaningful milestones if it exists.

Use ADRs for major decisions only.

## 20. Builder-With-Intent

For significant architecture changes, briefly explain:

- what changed;
- why;
- important files;
- data flow;
- trade-offs.

Keep code understandable.

## 21. Current Priority

```text
1. stabilize existing repo/frontend
2. localhost working
3. preserve/adapt Phase 1
4. clean web/backend boundaries
5. RepositorySource
6. GitHub integration
7. PostgreSQL persistence
8. real repository → Project Truth
9. evidence in UI
10. supersession/contradiction test
11. Context Pack
12. UX/security/browser/performance QA
13. deploy only when explicitly instructed
```

## 22. North Star

```text
Connect GitHub.

HARIKOS understands the project.

HARIKOS knows why each important fact is true.

When the repository changes,
HARIKOS changes its understanding.

The builder understands the project better.

The coding agent receives current context
instead of stale assumptions.
```
