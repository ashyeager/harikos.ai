# HARIKOS AI — Architecture

**File:** `docs/ARCHITECTURE.md`
**Status:** Canonical cloud-first MVP architecture
**Date:** August 23, 2026
**Product source of truth:** `docs/harikos_ai_prd.md`

## 1. Goal

HARIKOS AI is a cloud-first SaaS that connects to GitHub repositories, derives evidence-backed project claims, resolves them into temporal Project Truth, stores derived knowledge in PostgreSQL, and exposes it through the web product and later agent APIs/MCP.

Localhost is development only.

## 2. Superseded Architecture

The old primary architecture:

```text
Local repo
→ CLI / MCP / Web
→ SQLite
```

is no longer the main product architecture.

Keep useful Phase 1 code for parsers, truth logic, tests, fixtures, LocalRepositorySource, CLI diagnostics, and future local/self-hosted options.

## 3. High-Level System

```text
                     GitHub
                       │
                GitHub App / Auth
                       │
                       ▼
                HARIKOS Web/API
                       │
                 RepositorySource
                       │
          ┌────────────┴────────────┐
          │                         │
 deterministic analyzers       AI provider
          │                         │
          └────────────┬────────────┘
                       ▼
                Candidate Claims
                       │
                    Evidence
                       │
                 Truth Resolver
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      VERIFIED     UNCERTAIN   CONTRADICTED
          │
          ▼
      Temporal Truth
          │
       PostgreSQL
          │
     ┌────┴───────────┐
     ▼                ▼
 HARIKOS Web      Agent API/MCP
```

## 4. Principles

1. Truth != Memory.
2. Evidence for verified claims.
3. Truth is temporal.
4. Contradictions are explicit.
5. Model output is not authority.
6. Deterministic first.
7. Repository access is abstracted.
8. GitHub is the primary MVP repo source.
9. PostgreSQL is main SaaS persistence.
10. No permanent full repo clone by default.
11. Web app is primary human surface.
12. Agent APIs/MCP consume truth later.
13. AI layer is provider-agnostic.
14. Minimal useful context.
15. Cloud-first now; local/self-hosted later if demanded.
16. Avoid premature distributed infrastructure.

## 5. Stack

| Layer | Direction |
|---|---|
| Language | TypeScript |
| Runtime | Node.js 20+ |
| Package manager | pnpm |
| Web | Next.js App Router |
| UI | Tailwind + reusable components |
| Auth | GitHub-oriented auth |
| Repo integration | GitHub App + Octokit |
| DB | PostgreSQL |
| Managed DB | Supabase Postgres acceptable |
| ORM | Reuse/adapt Drizzle |
| Validation | Zod |
| AI | Provider abstraction |
| Tests | Vitest |
| Browser QA | Playwright |
| Hosting | Vercel |
| Legacy DB | SQLite for tests/tools if useful |
| MCP | Later agent interface |

## 6. Monorepo Direction

Preserve current structure where practical:

```text
harikos-ai/
├── AGENTS.md
├── docs/
│   ├── harikos_ai_prd.md
│   ├── ARCHITECTURE.md
│   ├── BUILD_STATE.md
│   └── adr/
├── apps/
│   └── web/
├── packages/
│   ├── core/
│   ├── db/
│   ├── cli/
│   └── mcp/
└── fixtures/
```

Do not rewrite working structure just to match documentation.

## 7. RepositorySource

Truth logic must not depend directly on GitHub or filesystem.

Conceptual interface:

```ts
interface RepositorySource {
  getMetadata(): Promise<RepositoryMetadata>;
  getTree(ref?: string): Promise<RepositoryTree>;
  getFile(path: string, ref?: string): Promise<RepositoryFile>;
  getFiles(paths: string[], ref?: string): Promise<RepositoryFile[]>;
  getChangedFiles(base: string, head: string): Promise<ChangedFile[]>;
  getCommit(ref?: string): Promise<RepositoryCommit>;
}
```

Implementations:

```text
LocalRepositorySource
GitHubRepositorySource
```

Local adapter preserves Phase 1/testing. GitHub adapter powers SaaS.

## 8. GitHub App

Use minimum permissions initially:

```text
Contents: Read
Metadata: Read
```

Flow:

```text
authenticate
→ authorize/install HARIKOS
→ select repo
→ analyze
```

Installation credentials remain server-side. Authorize project/repo access per user/workspace.

## 9. Authentication / Authorization

Requirements:

- secure sessions;
- user/project ownership;
- repository-installation ownership validation;
- no service secrets client-side;
- authorization on every project API;
- prevent IDOR-style project access.

## 10. Initial Scan Flow

```text
select repo
→ create Project + Scan
→ get repository tree
→ filter
→ rank high-signal files
→ fetch selected files
→ deterministic analysis
→ AI interpretation where useful
→ candidate claims
→ evidence
→ truth resolver
→ current + historical truth
→ PostgreSQL
→ web UI
```

## 11. Filtering

Ignore by default:

- node_modules
- .next
- dist/build/coverage
- .git
- generated output
- binaries/media unless relevant

Never ingest live secrets:

- `.env`
- tokens
- credentials
- private keys
- secret stores

A future `.harikoignore` may provide project-level exclusions.

## 12. High-Signal Files

Prioritize for JS/TS MVP:

- package.json
- README
- tsconfig
- next/vite config
- Dockerfile
- .env.example
- middleware
- auth
- API routes
- DB schema/config
- Prisma/Drizzle
- Supabase/Clerk/Firebase config
- deployment config
- tests
- CI
- AGENTS.md / CLAUDE.md
- architecture docs

## 13. Deterministic Analyzers

Build explicit analyzers/verifiers for:

- framework;
- language;
- authentication;
- database;
- ORM;
- deployment;
- payments;
- testing;
- API routing;
- common conventions.

AI should not replace deterministic evidence.

## 14. AI Boundary

Conceptual interface:

```ts
interface AIProvider {
  extractCandidateClaims(input: ClaimExtractionInput): Promise<CandidateClaim[]>;
  explainTruth(input: ExplainTruthInput): Promise<TruthExplanation>;
  explainContradiction(input: ContradictionInput): Promise<ContradictionExplanation>;
  composeContextPack(input: ContextPackInput): Promise<ContextPackDraft>;
}
```

Rules:

- structured output;
- Zod validation;
- timeout/retry handling;
- preserve provenance;
- candidate until resolved;
- provider swappable.

## 15. Claim Model

Concept:

```text
id
project_id
category
subject
predicate
value
scope
status
confidence
valid_from
valid_to
first_seen_at
last_verified_at
supersedes_claim_id
```

Statuses:

- candidate
- verified
- likely
- uncertain
- contradicted
- stale
- superseded
- rejected

## 16. Evidence Model

Concept:

```text
id
claim_id
project_id
source_type
file_path
commit_sha
blob_hash/content_hash
line_start
line_end
authority
observed_at
metadata
```

Prefer pointers over permanently stored full file content.

## 17. Truth Resolver

```text
candidate
→ normalize
→ find related active truth
→ verify evidence

no active truth:
  VERIFIED / LIKELY / UNCERTAIN

active truth exists:
  compatible → strengthen evidence
  incompatible → contradiction
               → authority + recency + scope
               → supersede / coexist / uncertain
```

Never delete history silently.

## 18. Temporal Truth

Example:

```text
Clerk
valid_from: 2026-07-10
valid_to: 2026-08-23
status: superseded

Supabase Auth
valid_from: 2026-08-23
valid_to: null
status: verified
```

Current-context retrieval excludes superseded truth unless history is relevant.

## 19. Contradictions

Represent contradictions explicitly.

Cases include:

- stale docs;
- migration coexistence;
- different scopes;
- intended vs current state;
- ambiguous evidence;
- extraction error.

Do not force false single answers.

## 20. Memory

Memory types:

- decision;
- failed_attempt;
- bug;
- root_cause;
- constraint;
- incident;
- outcome;
- historical_note.

Agent-written memories enter as proposals/events, not automatic truth.

## 21. Context Packs

Selection order:

```text
task
→ current verified truth
→ recent related changes
→ constraints
→ decisions
→ known failures
→ relevant historical memory
```

Return compact, explainable context.

## 22. PostgreSQL

Main SaaS database.

Primary concepts:

```text
users
projects
repositories
repository_installations
scans
claims
evidence
contradictions
memories
project_changes
context_packs
```

Reuse Drizzle if practical.

SQLite can stay for Phase 1/tests/local tooling but is not the primary SaaS DB.

## 23. API Boundary

Frontend should not directly import DB/truth internals.

Conceptual endpoints/actions:

```text
GET  /api/projects
POST /api/projects
GET  /api/projects/:id
POST /api/projects/:id/scan
GET  /api/projects/:id/truth
GET  /api/projects/:id/changes
GET  /api/projects/:id/truth/:claimId
POST /api/projects/:id/context
```

Framework-native actions are fine if boundaries remain clear.

## 24. Product Routes

```text
/
login
/app/dashboard
/app/projects
/app/project/[id]
/app/project/[id]/truth
/app/project/[id]/changes
/app/project/[id]/understand
/app/project/[id]/context
/app/settings
```

One app + one Vercel deployment initially.

## 25. Scan Progress

Semantic stages:

- Found framework
- Mapped authentication
- Found database
- Found deployment
- Found API structure
- Detected conventions
- Building Project Truth

Avoid exposing internal chunk/vector counts.

## 26. Incremental Reverification

After initial MVP scan works:

```text
GitHub push webhook
→ verify signature
→ identify project
→ compare SHAs
→ changed files
→ affected evidence/claims
→ re-fetch relevant files
→ rerun analyzers
→ resolve truth
→ persist ProjectChange
```

Prefer selective reverification over full rescans.

## 27. Project Changes

Persist meaningful semantic events:

```text
Authentication changed
Clerk → Supabase
```

Reference:

- old/new claim;
- commit;
- evidence;
- contradiction;
- timestamp.

## 28. Source Retention

Default goal:

- no permanent full clone;
- no permanent arbitrary source warehouse;
- fetch when needed;
- derive structured knowledge;
- persist pointers/hashes/history.

If source excerpts must be stored later, make retention explicit.

## 29. Security

Required:

- secrets server-side;
- webhook signature verification;
- GitHub installation validation;
- project ownership authorization;
- Zod validation;
- safe rendering;
- no arbitrary command execution;
- no live `.env` ingestion;
- no service-role key in browser;
- RLS where appropriate;
- rate limits/basic abuse controls where needed.

## 30. AI Privacy Boundary

If source is sent to AI providers:

- send only relevant excerpts;
- exclude secrets;
- disclose provider use;
- do not claim zero retention unless true;
- never train on customer code unless explicitly supported/authorized.

## 31. Performance

Web:

- server components by default where appropriate;
- minimize client JS;
- lazy-load heavy visuals;
- optimize media;
- reduced-motion support.

Analysis:

- content hashes;
- skip unchanged files;
- bounded file selection;
- selective reverification;
- cache deterministic outputs where safe.

## 32. Motion / 3D

Motion communicates state/progress/change.

Hierarchy:

```text
CSS/native
→ Motion
→ GSAP
→ Rive/Lottie
→ React Three Fiber
```

3D belongs mainly on marketing/hero surfaces and must have static/reduced-motion fallbacks.

## 33. Testing

Unit:

- parsers;
- normalization;
- authority;
- truth resolution;
- contradiction;
- supersession;
- context selection.

Fixtures:

- Firebase → Clerk;
- Clerk → Supabase;
- Drizzle → Prisma;
- stale README;
- installed-but-unused package;
- migration coexistence;
- agent hallucination.

Integration:

- RepositorySource;
- GitHub adapter;
- DB;
- scan lifecycle;
- authorization.

Browser:

- landing;
- auth/onboarding;
- repo select;
- scan;
- dashboard;
- truth detail;
- changes;
- understand;
- context pack.

## 34. Flagship Test

Initial:

```text
Clerk active
README says Clerk
```

After migration:

```text
Supabase active
README still says Clerk
```

Expected:

```text
Supabase VERIFIED
Clerk SUPERSEDED
README CONTRADICTION
```

Context for auth work must use Supabase.

## 35. Local Development

Current iteration target:

```text
http://localhost:3000
```

Local development may use:

- LocalRepositorySource;
- fixtures;
- dev GitHub App;
- dev Postgres/Supabase.

The product architecture remains cloud SaaS.

## 36. Deployment

Production target:

> Vercel

Initially:

```text
harikos.ai
```

hosts both marketing and authenticated product.

Later split only if needed:

```text
harikos.ai
app.harikos.ai
api.harikos.ai
mcp.harikos.ai
```

## 37. MCP / CLI

MCP remains a future agent integration layer.

CLI remains useful for diagnostics, tests, legacy Phase 1, and possible future local mode.

Neither is the primary MVP user experience.

## 38. Non-Goals

Do not add now:

- Kubernetes;
- Kafka;
- microservice explosion;
- Neo4j;
- Elasticsearch;
- large vector infra;
- premature Redis;
- enterprise SSO;
- multi-region;
- self-hosted deployment.

## 39. Architecture Success

Architecture succeeds when:

1. app runs locally;
2. web UI is the primary product surface;
3. repo flows through `RepositorySource`;
4. real Truth Engine produces claims;
5. evidence is persisted/visible;
6. PostgreSQL stores SaaS state;
7. stale facts can be superseded;
8. contradictions are representable;
9. history remains available;
10. Context Packs use current truth;
11. frontend/backend boundaries stay clean;
12. one Vercel deployment is possible;
13. GitHub becomes the production repo source without rewriting core truth logic.
