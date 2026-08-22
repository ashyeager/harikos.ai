# HARIKOS AI Architecture

**Status:** Authoritative MVP architecture  
**Canonical placement:** `docs/ARCHITECTURE.md`  
**Product:** HARIKOS AI — the local-first, evidence-backed project-truth layer for AI coding agents

## 1. Architectural Objective

HARIKOS AI gives Codex, Claude Code, Cursor, Hermes, and other MCP-compatible agents the same verified understanding of a software project.

The core product is a **Truth Engine**, not a chatbot, vector database, or agent-specific memory plugin. It observes repository state, converts observations into typed evidence and candidate claims, reconciles those claims against existing project truth, preserves temporal history, and returns the minimum relevant context for a task.

```text
Repository + Git + Docs + Tests + Human Decisions + Agent Events
                              |
                              v
                    Scanner and Parsers
                              |
                  Sources, Events, Candidates
                              |
                              v
                        Truth Engine
                 verify / merge / contradict
                 supersede / coexist / review
                              |
                              v
                     Local Project State
                       SQLite + Drizzle
                              |
               +--------------+--------------+
               |              |              |
              CLI            MCP          Web App
          developer       coding agents     humans
```

The CLI, MCP server, and web app are adapters over the same core services and database. Business rules must not be reimplemented in those surfaces.

## 2. Required Technology

- TypeScript on Node.js 20+
- pnpm workspaces; no monorepo framework is required
- Next.js for the local web app
- SQLite with Drizzle ORM and migrations
- Zod at every untrusted or cross-package boundary
- Commander for the CLI
- Git CLI for repository history and change inspection
- Official MCP TypeScript SDK
- Vitest for unit and integration tests
- Gemini for optional interpretation through schema-constrained structured outputs
- Google AI Studio for prompt experiments, not as a runtime dependency

The MVP must work locally without a paid service. Gemini must be replaceable through a provider interface, and deterministic truth extraction must continue to work when no AI key is configured.

## 3. Monorepo Layout

```text
harikos-ai/
├── apps/
│   └── web/                    # Local human inspection UI
├── packages/
│   ├── core/
│   │   └── src/
│   │       ├── scanner/        # Source discovery, filtering, hashing
│   │       ├── parsing/        # Deterministic parsers
│   │       ├── claims/         # Claim schemas and normalization
│   │       ├── truth/          # Resolution and authority policy
│   │       ├── retrieval/      # Structured and FTS retrieval
│   │       ├── context/        # Task-specific Context Packs
│   │       └── ai/             # Provider-neutral AI boundary
│   ├── db/                     # Drizzle schema, migrations, repositories
│   ├── cli/                    # Commander commands
│   └── mcp/                    # MCP server and tool adapters
├── fixtures/
│   └── demo-project/           # Firebase -> Clerk controlled fixture
├── docs/
│   ├── harikos_ai_prd.md       # Product source of truth
│   ├── ARCHITECTURE.md         # This document
│   └── MVP.md                  # Locked sprint scope
├── AGENTS.md                   # Repository-working rules
├── package.json
└── pnpm-workspace.yaml
```

Package dependencies flow inward:

```text
apps/web  packages/cli  packages/mcp
             |              |
             +-------> packages/core
                           |
                           v
                       packages/db
```

`core` owns domain behavior. `db` owns persistence implementation. Surfaces may compose core services, but must not contain truth-resolution rules or write canonical state directly.

## 4. Local Project State

Each initialized repository has a private local data directory:

```text
.harikos/
├── config.json
└── project.db
```

`.harikos/` is ignored by Git by default. Export and team-sync behavior are post-MVP concerns. A future `.harikosignore` file may add repository-specific scan exclusions.

The initial relational model contains:

- `projects`: registered repositories and scan state
- `sources`: observed files, commits, tests, docs, manual input, or agent sessions
- `events`: timestamped project changes or actions
- `claims`: structured propositions with scope, status, confidence, validity, and epistemic type
- `evidence`: claim-to-source links with location, excerpt, and strength
- `contradictions`: incompatible or apparently incompatible claim pairs
- `resolutions`: supersede, coexist, reject, merge, or human-override decisions
- `memories`: decisions, failures, bugs, causes, constraints, preferences, outcomes, incidents, and notes
- `agent_sessions`: bounded metadata about agent work
- `outcomes`: results associated with sessions or claims
- `context_packs`: generated task context and token estimates

Required claim statuses are `candidate`, `current`, `uncertain`, `contradicted`, `historical`, `superseded`, and `rejected`.

Required epistemic types are:

- `observed`: directly present in a source
- `derived`: produced by deterministic logic
- `inferred`: produced by an LLM or non-deterministic heuristic
- `declared`: explicitly stated by a developer or team

Claims also carry an optional `scope`. For example, Next.js in `apps/web` and Astro in `apps/docs` may coexist rather than contradict one another.

## 5. Core Interfaces

Exact filenames may vary, but these boundaries must remain stable.

```ts
type ClaimStatus =
  | "candidate"
  | "current"
  | "uncertain"
  | "contradicted"
  | "historical"
  | "superseded"
  | "rejected";

type EpistemicType = "observed" | "derived" | "inferred" | "declared";

interface SourceEvidence {
  sourceType: "file" | "manifest" | "config" | "git_commit" | "test_result" | "documentation" | "agent_session" | "manual";
  path?: string;
  contentHash: string;
  observedAt: string;
  excerpt?: string;
  lineStart?: number;
  lineEnd?: number;
  metadata: Record<string, unknown>;
}

interface CandidateClaim {
  subject: string;
  predicate: string;
  value: unknown;
  scope?: string;
  epistemicType: EpistemicType;
  sourceIds: string[];
  extractorConfidence?: number;
}

interface ResolutionResult {
  accepted: string[];
  strengthened: string[];
  superseded: string[];
  contradictions: string[];
  reviewRequired: string[];
}

interface Scanner {
  scan(projectPath: string): Promise<SourceEvidence[]>;
}

interface ClaimExtractor {
  extract(sources: SourceEvidence[]): Promise<CandidateClaim[]>;
}

interface TruthEngine {
  resolve(projectId: string, candidates: CandidateClaim[]): Promise<ResolutionResult>;
}

interface AiProvider {
  extractClaims(input: unknown): Promise<unknown>;
  composeContext(input: unknown): Promise<unknown>;
}
```

Unknown AI output is parsed by Zod after the provider returns it. Provider success never implies semantic acceptance.

## 6. Scan and Processing Flow

`harikos scan` performs this sequence:

1. Resolve and validate the Git repository root.
2. Load default exclusions, `.gitignore`, and optional HARIKOS exclusions.
3. Never read live secrets, credentials, private keys, dependency caches, build output, or Git object storage.
4. Discover high-information sources: manifests, lockfiles, selected configs, README/agent docs, recent Git history, relevant source paths, and test metadata.
5. Hash every source; skip unchanged content.
6. Persist new source observations and change events.
7. Run deterministic parsers first.
8. Send only selected, redacted excerpts to the configured AI provider when interpretation is necessary and explicitly enabled.
9. Validate AI output with Zod and store it only as candidate/inferred information.
10. Normalize candidates and run truth resolution.
11. Persist evidence links, validity intervals, contradictions, and resolutions in one transaction where practical.
12. Rebuild affected retrieval indexes and report a scan summary.

The scanner must not dump an entire repository into Gemini. Initial deterministic extraction covers language, framework, ORM, database, authentication, deployment, queue, and major provider choices where recognizable.

## 7. Truth Engine

Truth resolution is deterministic policy assisted by evidence, not an LLM vote.

For every candidate:

1. Normalize subject, predicate, value, and scope.
2. Find related current claims.
3. If compatible, merge or strengthen evidence.
4. If incompatible, create a contradiction before changing canonical state.
5. Compare claim-type-aware source authority, recency, corroboration, execution evidence, scope, and explicit human input.
6. Resolve as `supersede`, `coexist`, `reject`, `merge`, or `review required`.
7. Preserve the losing or previous claim and its validity interval; never erase history to simplify the current answer.

Initial authority guidance:

```text
passing tests or executable configuration
  > active source implementation
  > corroborated manifest/config evidence
  > recent Git change
  > approved architecture decision
  > maintained documentation
  > agent assertion
  > old note or unsupported inference
```

This is claim-type-aware, not a universal fixed ranking. A manifest proves installation, not active use. A human declaration may establish intended architecture while source code establishes current implementation.

Confidence is computed from observable factors—authority, recency, corroboration, execution evidence, and penalties—not copied from model self-confidence.

Current implementation and intended state must remain distinct. A migration can truthfully represent:

```text
current auth: Firebase
target auth: Clerk
migration: in progress
```

## 8. Memory, Retrieval, and Context Packs

Memory and truth are separate stores with separate authority.

- Truth answers what HARIKOS currently believes about the project.
- Memory preserves useful history such as decisions, failures, causes, constraints, and outcomes.
- An agent-proposed memory may create candidate claims, but cannot directly become canonical truth.

MVP retrieval order is:

1. current scoped claims,
2. recent related changes,
3. relevant decisions and constraints,
4. known failures and incidents,
5. supporting memories,
6. SQLite full-text fallback.

Vector search is not required.

A Context Pack is a small, explainable, task-specific projection containing the task, current truth, relevant decisions, known issues and failed approaches, recent changes, and relevant files. Superseded facts are excluded from current context unless the task explicitly asks for history or migration details.

## 9. Product Surfaces

### CLI

Required commands:

- `harikos init`
- `harikos scan`
- `harikos truth`
- `harikos contradictions`
- `harikos remember "..."`
- `harikos status`
- `harikos ui`

CLI commands call core application services and support stable machine-readable JSON where useful in addition to human output.

### MCP

The local MCP server exposes exactly these MVP tools:

- `get_project_truth`
- `search_project_memory`
- `get_recent_changes`
- `get_decisions`
- `get_context_pack`
- `record_memory`

All inputs and outputs are schema-validated. Read tools return provenance. `record_memory` creates a proposed memory/event; it does not rewrite truth.

### Web App

The local Next.js app reads the same project state through core services and provides:

- project overview and scan health,
- current truth table,
- claim detail with evidence and validity,
- unresolved contradictions,
- temporal timeline,
- categorized memory,
- Context Pack preview.

No auth, billing, teams, or remote sync are part of the MVP.

## 10. AI Boundary

Gemini may help with natural-language claim extraction, decision extraction, memory classification, contradiction explanation, and Context Pack composition.

Every AI operation must:

- be optional or have a deterministic degraded mode,
- use a provider-neutral interface,
- receive the smallest relevant source excerpt,
- exclude secrets and ignored paths,
- request structured output,
- validate with Zod,
- label results `inferred`,
- preserve model/provider metadata for audit,
- remain candidate information until the Truth Engine verifies it.

Prompts prototyped in Google AI Studio must be versioned in the repository before they affect runtime behavior.

## 11. Security and Privacy

- Local SQLite is the default and system of record for the MVP.
- `.env`, credentials, tokens, private keys, secret stores, `.git`, dependencies, and build output are denied by default.
- `.env.example` may be inspected only as a schema-like file and must never be assumed secret-free.
- Paths are resolved and constrained to the registered repository root.
- Source excerpts sent to cloud AI are explicit, minimal, and visible in logs or audit records.
- Logs must redact secrets and avoid storing whole-file content by default.
- MCP writes are validated and restricted to HARIKOS state; the MVP MCP server does not execute project code or mutate the repository.
- Uncertain AI output is never silently canonicalized.

## 12. Future Cloud Path

The cloud version must extend, not replace, the local architecture.

```text
Local scanner and agent adapters
             |
      encrypted sync/outbox
             |
      HARIKOS Cloud API
             |
   Postgres + team policies
```

Prepare for this by keeping persistence behind repository interfaces, using stable IDs and timestamps, recording append-friendly events, and separating project-local identity from future user/team identity.

Post-MVP capabilities may include encrypted sync, Postgres, accounts, teams, source-level access controls, conflict-aware replication, additional agent adapters, evaluation analytics, policy enforcement, and an Action Gateway. None may distort the local MVP or enter the first sprint without an explicit spec change.

## 13. Architectural Invariants

1. Truth is evidence-backed and temporal.
2. Memory is not canonical truth.
3. Deterministic parsing precedes AI inference.
4. AI produces typed candidates, never unilateral truth.
5. Contradictions are recorded, not hidden.
6. Scope differences may coexist.
7. Current implementation and intended architecture are distinct.
8. All product surfaces share one core implementation.
9. Local operation does not require cloud infrastructure or a paid API.
10. Every answer can explain what HARIKOS believes and why.
