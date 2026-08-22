# HARIKOS AI MVP

**Status:** Locked 48–72 hour build scope  
**Canonical placement:** `docs/MVP.md`  
**Purpose:** Prove that HARIKOS can maintain and deliver more reliable project truth than an agent's isolated memory

## 1. The Proof

The MVP must make one complete story work:

> HARIKOS initializes a local repository, scans real project evidence, establishes evidence-backed project claims, detects when Firebase is replaced by Clerk, preserves Firebase as history, marks Clerk as current, and gives a fresh coding agent the correct answer through MCP with provenance.

Everything in the sprint must directly support that story.

## 2. Required Deliverables

### Repository and local state

- pnpm workspace with `apps/web`, `packages/core`, `packages/db`, `packages/cli`, and `packages/mcp`
- TypeScript configuration shared across packages
- local `.harikos/config.json` and `.harikos/project.db`
- Drizzle schema and reproducible SQLite migrations
- default Git ignore entry for `.harikos/`

### Core data

Implement projects, sources, events, claims, evidence, contradictions, resolutions, and memories. Agent sessions, outcomes, and persisted Context Packs may be minimal if the end-to-end flow does not require richer behavior.

Claims must support:

- status: candidate, current, uncertain, contradicted, historical, superseded, rejected
- epistemic type: observed, derived, inferred, declared
- optional scope
- confidence derived from evidence
- valid-from and valid-to timestamps
- links to one or more evidence records

### Initialization and scanning

`harikos init` must detect the repository root, create local configuration/database state, register the project, apply migrations, and print MCP setup guidance.

`harikos scan` must:

- read `package.json` and one present lockfile,
- inspect common TypeScript, Next.js, Drizzle, Prisma, auth, and deployment configs,
- inspect README/AGENTS/CLAUDE documentation when present,
- collect the repository tree and recent Git commits/changes,
- honor default secret and generated-file exclusions,
- hash sources and skip unchanged content,
- persist observations and scan timestamps.

### Deterministic extraction

Before any AI call, derive grounded candidates for at least:

- language,
- framework,
- database,
- ORM,
- authentication provider,
- deployment provider.

Installed-only and actively-used states must not be treated as identical. Corroborating config, imports, source implementation, tests, and Git changes should strengthen a claim.

### Gemini structured extraction

Add a provider-neutral Gemini adapter for ambiguous natural-language sources. It must:

- accept selected excerpts rather than whole repositories,
- request structured JSON,
- validate output with Zod,
- label output as inferred candidate claims,
- fail clearly and preserve deterministic behavior when no key or provider is available.

The Firebase-to-Clerk proof must not depend on a paid API.

### Truth resolution

Implement normalization, evidence merging, known-domain contradiction detection, authority/recency comparison, temporal supersession, and review-required outcomes.

At minimum, truth resolution must handle:

- a new compatible source strengthening a current claim,
- a stronger and newer incompatible claim superseding an old claim,
- stale documentation losing to active implementation,
- an installed-but-unused dependency not becoming current truth,
- scoped coexistence,
- a migration-in-progress remaining uncertain/coexistent rather than producing a false single answer,
- agent or memory claims remaining non-canonical until verified.

### Memory and Context Packs

`harikos remember` records a typed, manually sourced memory for decisions, failures, bugs, constraints, outcomes, or notes. It must not directly rewrite canonical claims.

`get_context_pack(task)` returns a compact task-specific result containing:

- current relevant truth,
- relevant decisions and constraints,
- known failures or issues,
- recent changes,
- relevant files,
- provenance summaries.

Superseded facts appear only when historical or migration context is relevant.

### CLI

The following commands must be usable:

```text
harikos init
harikos scan
harikos truth
harikos contradictions
harikos remember "<memory>"
harikos status
harikos ui
```

`truth`, `contradictions`, and `status` need readable terminal output. Core read commands should also offer stable JSON output for tests and integrations.

### MCP

Expose these six local tools with Zod-validated inputs and outputs:

```text
get_project_truth
search_project_memory
get_recent_changes
get_decisions
get_context_pack
record_memory
```

A fresh Codex session is the first integration target. Claude Code compatibility must follow the same standard MCP contract without vendor-specific truth logic.

### Local web app

`harikos ui` starts a local Next.js dashboard backed by the same core services and SQLite data. It must show:

- project and scan health,
- current truth,
- claim detail and evidence,
- contradictions,
- timeline,
- categorized memory,
- a Context Pack preview.

The UI should be restrained, technical, accessible, responsive, and immediately understandable during the demo. It is an inspection surface, not the core product.

### Fixture and tests

Create a deterministic `fixtures/demo-project` with two reproducible states:

1. Firebase is active.
2. Clerk is active after a documented migration.

Include tests for source hashing, deterministic parsing, claim normalization, authority scoring, contradiction creation, temporal supersession, scoped coexistence, stale-doc rejection, installed-but-unused dependencies, memory/truth separation, MCP schemas, and the full fixture transition.

## 3. Flagship Firebase -> Clerk Demo

The demo must run in this order:

1. Initialize the Firebase fixture.
2. Scan it.
3. Show `authentication.provider = Firebase` as current with evidence.
4. Record one historical decision or memory related to Firebase.
5. Apply the fixture's Clerk migration: add `@clerk/nextjs`, active Clerk middleware/source, remove or retire Firebase implementation, and include a migration commit/event.
6. Rescan.
7. Show Firebase as superseded with a closed validity interval.
8. Show Clerk as current with stronger, newer, corroborated evidence.
9. Show the contradiction/resolution and transition in the timeline.
10. Connect a fresh Codex session through MCP.
11. Ask which auth provider the project currently uses.
12. Receive Clerk, confidence, and provenance; Firebase must appear only as historical context.
13. Ask what changed and receive the Firebase-to-Clerk transition.
14. Show the same result in the web app.

The demo fails if HARIKOS merely returns both auth memories, silently overwrites Firebase, or produces Clerk without evidence.

## 4. Implementation Order

### Hours 0–4: freeze and scaffold

- place PRD, architecture, MVP, and AGENTS files
- create pnpm workspace and packages
- establish shared TypeScript, lint, test, and build commands
- define Zod domain schemas before implementation types diverge

### Hours 4–12: database and init

- implement Drizzle schema and migrations
- implement repository interfaces
- implement `harikos init`
- verify a clean repository can initialize twice safely

### Hours 12–22: scanner

- repository-root detection
- exclusions and secret protection
- source discovery, hashing, and change detection
- manifest/config/docs/Git collection
- scanner integration tests

### Hours 22–32: extraction

- deterministic parsers for the required domains
- evidence creation and corroboration
- provider-neutral AI interface
- optional Gemini structured extractor with Zod validation

### Hours 32–44: truth engine

- normalization and identity rules
- authority and confidence policy
- compatible evidence merge
- contradiction records
- supersession, coexistence, rejection, and review states
- truth-engine fixture tests

### Hours 44–52: CLI and MCP

- complete CLI read/write commands
- expose the six MCP tools
- test a fresh agent query against the local fixture

### Hours 52–64: web app

- overview, truth, claim evidence, contradictions, timeline, memory, Context Pack preview
- responsive layout and empty/error states

### Hours 64–72: proof and cleanup

- run the full Firebase-to-Clerk demo from a clean state
- run lint, typecheck, tests, and production build
- remove dead code and unused dependencies
- verify local CLI, MCP, and web all report the same canonical state
- record the short demo only after the flow is repeatable

If time compresses, protect the core loop in this order: database -> scanner -> deterministic extraction -> truth resolution -> CLI -> MCP -> web polish -> Gemini enrichment.

## 5. Exact Success Criteria

The MVP is complete only when all statements are true:

1. A real Git repository initializes locally with no cloud account.
2. Rescanning unchanged files does not duplicate sources or claims.
3. At least six project domains produce structured, evidence-linked claims.
4. Every current claim can explain its status, scope, confidence, and provenance.
5. Firebase becomes superseded when the controlled repository moves to Clerk.
6. Historical Firebase truth remains queryable but is excluded from default current truth.
7. Stale docs, unused dependencies, scoped coexistence, and migration-in-progress cases behave correctly.
8. Memory cannot directly overwrite truth.
9. No AI output becomes canonical without Zod validation and truth resolution.
10. The six MCP tools operate against the same state as the CLI.
11. A fresh Codex session receives Clerk as the current provider with evidence and needs no manual project re-explanation.
12. A task Context Pack is materially smaller and more relevant than a raw history dump.
13. The web app visibly explains current truth, evidence, contradiction, and temporal transition.
14. The product remains useful without a paid API or cloud deployment.
15. Lint, typecheck, Vitest, and production build pass from a clean install.

## 6. Explicit Non-Goals

Do not add any of the following to the 48–72 hour build:

- accounts, cloud authentication, billing, subscriptions, teams, SSO, or enterprise permissions
- remote sync, hosted database, production multi-tenancy, or multi-region infrastructure
- GitHub App, IDE extension, mobile app, Slack, Linear, Jira, or broad integrations
- action execution, autonomous repository mutation, approval gateway, or production policy engine
- generic chat assistant or Life OS features
- dedicated vector database, embeddings requirement, graph database, Elasticsearch, Pinecone, Redis Cloud, Kafka, Kubernetes, or microservices
- knowledge-graph visualization
- complete agent-session recording
- automatic ingestion of entire conversations or repositories
- more than the six MCP tools
- more than the locked project-truth domains unless required by the demo
- UI polish that delays the end-to-end proof

Future architecture may be considered only where a small interface boundary prevents lock-in. Future features must not be partially built.

## 7. Definition of Done

Done means a new developer can clone the repository, follow the README, install with pnpm, run migrations, execute the full fixture demo, connect Codex through MCP, open the local web app, and observe one consistent truth state across every surface.

A screenshot, a mocked dashboard, a passing unit test in isolation, or a model-generated explanation is not completion. The complete repository -> evidence -> truth -> MCP -> agent -> web flow must work.
