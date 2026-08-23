# HARIKOS AI — Product Requirements Document

**File:** `docs/harikos_ai_prd.md`
**Status:** Canonical product direction
**Date:** August 23, 2026
**Company:** HARIKOS
**Product:** HARIKOS AI
**Model:** Cloud-first SaaS
**Architecture:** See `docs/ARCHITECTURE.md`

## 1. Product Definition

HARIKOS AI is **the truth layer for AI-built software**.

It connects to a software repository, derives important facts about how the project currently works, attaches evidence to those facts, tracks when they change, explains the project to the builder, and produces current task-specific context for AI coding agents.

Primary product statement:

> **HARIKOS gives your software project one continuously verified understanding that both you and your coding agents can use.**

Primary marketing idea:

> **Your AI can write the code. HARIKOS makes sure it understands the project.**

Alternative:

> **One current, verified understanding of your codebase. Every agent works from it.**

HARIKOS is not generic repo chat, a vector database UI, a generic memory API, or primarily a local developer utility.

## 2. Superseded Direction

Older assumptions are no longer authoritative:

- local-first as the main product;
- CLI-first usage;
- SQLite as the final SaaS DB;
- local MCP as the primary interface;
- no authentication;
- no GitHub App;
- cloud/Vercel/Postgres only later;
- open-source/open-core as the default business model.

The current direction is:

> **A polished cloud-first web SaaS with GitHub-connected repository intelligence.**

Localhost is the development environment, not the product architecture.

Legacy Phase 1 code may still be reused for parsers, truth logic, tests, fixtures, CLI diagnostics, local adapters, and possible future local/self-hosted modes.

## 3. Core Problem

AI coding agents can write software quickly but frequently:

- lose context across sessions;
- build isolated understandings of the same project;
- retrieve stale facts;
- repeat failed approaches;
- misunderstand current architecture;
- rebuild functionality that already exists;
- use outdated paths/providers/patterns;
- force builders to repeatedly explain the project.

The deeper problem is not merely forgetting.

> **Agents do not maintain one trustworthy, current model of what is true about a changing software project.**

## 4. Truth, Memory, Evidence, Context

### Truth

A structured claim HARIKOS currently believes is supported by evidence.

Example:

```text
Category: Authentication
Value: Supabase Auth
Status: VERIFIED
Confidence: 0.98

Evidence:
- middleware.ts
- lib/supabase/server.ts
- package.json

Verified against:
commit c2137fb
```

Truth must support provenance, confidence, scope, temporal validity, contradiction, uncertainty, and supersession.

### Memory

Historical knowledge worth preserving even when it is not current truth:

- decisions;
- failed attempts;
- bugs/root causes;
- constraints;
- incidents;
- previous implementations;
- outcomes.

Memory does not automatically override current truth.

### Evidence

Why HARIKOS believes a claim:

- source code;
- manifests;
- config;
- DB schema;
- tests;
- Git;
- deployment config;
- maintained docs;
- explicit decisions;
- agent events.

### Context

The small subset of current Truth + useful Memory relevant to a task.

HARIKOS optimizes for **minimum useful context**, not maximum context.

## 5. Product Thesis

Generic memory asks:

> What did we remember?

HARIKOS asks:

> **Is what we remember still true?**

Example:

```text
Old:
Authentication = Clerk

Current repo:
Authentication = Supabase
```

HARIKOS should represent:

```text
Supabase Auth
VERIFIED
CURRENT

Clerk
SUPERSEDED
HISTORICAL
```

If README still says Clerk:

```text
CONTRADICTION
README appears stale.
```

## 6. Product Principles

1. Truth is separate from memory.
2. Evidence beats unsupported model inference.
3. Truth is temporal.
4. Contradictions are first-class.
5. LLM output is candidate interpretation, not authority.
6. Deterministic checks come first.
7. Historical truth must not contaminate current context.
8. Agent-neutral truth is more valuable than one-vendor lock-in.
9. Uncertainty is better than fake confidence.
10. The product is simple outside and sophisticated underneath.
11. Cloud SaaS is the main product model.
12. Local/self-hosted is future optional deployment, not MVP.

## 7. Target Market

Primary category:

> **AI-native builders**

Examples:

- founder-builders;
- indie hackers;
- AI-assisted developers;
- junior developers;
- designers building with AI;
- technical creators;
- small startups;
- heavy Codex, Claude Code, and Cursor users.

HARIKOS is especially useful for builders who can ship software with AI without understanding every subsystem like a senior engineer.

Externally, prefer **AI-native builders** over “vibe coders.”

## 8. Jobs To Be Done

1. Help me understand how my AI-built project currently works.
2. Stop agents from acting on stale assumptions.
3. Show me why HARIKOS believes an important project fact.
4. Update project understanding when the repo changes.
5. Tell my agent what already exists before it builds.
6. Preserve history without confusing old state with current truth.
7. Let me switch agents without re-explaining the project.

## 9. Differentiation

HARIKOS cannot win merely with:

- embeddings;
- RAG;
- semantic search;
- MCP;
- shared memory;
- repo chat;
- a polished dashboard.

The strongest wedge is:

> **Continuous verification of high-value project claims against the current repository.**

HARIKOS combines:

```text
cloud convenience
+ project understanding
+ evidence
+ temporal truth
+ drift detection
+ contradiction handling
+ human explanation
+ agent context
```

## 10. Truth Resolution

Conceptual flow:

```text
candidate claim
→ normalize
→ find related current truth
→ verify evidence
→ compatible? strengthen
→ incompatible? contradiction
→ compare authority + recency + scope
→ supersede / coexist / uncertain
```

Initial states:

- VERIFIED
- LIKELY
- UNCERTAIN
- CONTRADICTED
- STALE
- SUPERSEDED
- REJECTED

Source authority is claim-type-aware. Active implementation and executable evidence usually outrank stale docs or agent claims, but no universal ranking applies to every claim.

HARIKOS must distinguish current implementation from future intent.

## 11. Product Experience

For MVP:

```text
ONE repository
ONE Next.js app
ONE eventual Vercel deployment
```

Public:

```text
/
landing

/login
authentication
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

The landing page is marketing. After authentication, the user enters the actual product.

## 12. Landing Page

Hero:

# Your AI can write the code.
## HARIKOS makes sure it understands the project.

Supporting:

> One continuously verified understanding of your software — for every coding agent.

Primary CTA:

> **Connect GitHub**

Secondary:

> **See how it works**

The page should demonstrate the product visually, not bury users in technical terminology.

Design quality should aspire to modern products such as Linear, Vercel, Raycast, and Cursor without copying them.

## 13. Hero Demo

Example visual story:

```text
Authentication
Clerk
VERIFIED

Repository changed

Authentication
Supabase Auth
VERIFIED

Clerk
SUPERSEDED

README.md still references Clerk
CONTRADICTION
```

Motion should explain causality.

## 14. Authentication / GitHub

Desired flow:

```text
Landing
→ Connect GitHub
→ Authenticate
→ Authorize HARIKOS GitHub App
→ Select repository
→ Analyze
→ Project Truth
```

Use a GitHub App with minimum permissions. Initial target:

```text
Contents: Read
Metadata: Read
```

Do not ask normal users to paste PATs.

## 15. First Scan

Show meaningful progress:

```text
✓ Found your framework
✓ Mapped authentication
✓ Found your database
✓ Found deployment
✓ Found API structure
✓ Detected project conventions

Building Project Truth...
```

Then:

> **HARIKOS found 37 things your AI should know.**

## 16. Project Overview

Example:

```text
37 verified truths
2 changed
1 uncertain
1 contradiction
```

Architecture summary:

- Framework
- Language
- Authentication
- Database
- Deployment
- Payments
- Testing

The point is to help a non-expert understand the software quickly.

## 17. Project Truth

The flagship surface.

Categories can include:

- Stack
- Architecture
- Authentication
- Database
- API
- Deployment
- Payments
- Testing
- Infrastructure
- Conventions

Each verified truth should expose evidence.

## 18. Changes / Drift

Show meaningful semantic change:

```text
Authentication changed

Clerk
→
Supabase Auth

3 related truths updated.

README.md still references Clerk.
```

This proves HARIKOS is a living model rather than a static summary.

## 19. Understand Your Project

Users can ask grounded questions such as:

- How does authentication work?
- How is the database structured?
- Where do API routes live?
- How does deployment work?

Answers should support:

- Simple
- Technical
- Evidence

This is not generic repo chat. It is explanation grounded in Project Truth.

## 20. Before You Build

User enters:

> Add subscriptions.

HARIKOS returns current facts the agent needs:

```text
✓ Stripe is already installed.
✓ /api/webhooks/stripe already exists.
✓ Users are stored in profiles.
✓ Authentication uses Supabase.
⚠ No subscription_status field exists.
✓ Service-role credentials must stay server-side.
```

CTA:

> **Prepare Agent Context**

## 21. Context Packs

Input:

```text
Add Google OAuth
```

Output:

```text
CURRENT PROJECT CONTEXT

Authentication
Supabase Auth

Framework
Next.js App Router

Middleware
middleware.ts

Server helper
lib/supabase/server.ts

Existing routes
/login
/signup

Constraint
Service-role credentials stay server-side.

Recent change
Authentication migrated from Clerk.
```

MVP actions:

- Copy Context
- Copy for Claude
- Copy for Codex
- Copy for Cursor

Direct automatic agent integrations can come later.

## 22. Repository Analysis

Do not send the whole repo blindly to an LLM.

Pipeline:

```text
tree
→ filter
→ rank high-signal files
→ deterministic extraction
→ AI interpretation when needed
→ candidate claims
→ evidence
→ truth resolution
```

Ignore:

- node_modules
- .next
- dist/build/coverage
- generated files
- binaries
- irrelevant media

Never ingest live secrets from `.env`, tokens, keys, or credential stores.

Initial first-class support focuses on modern JS/TS web applications.

## 23. Main Data Concepts

Primary SaaS concepts:

- User
- Project
- Repository
- Scan
- Claim
- Evidence
- Contradiction/Resolution
- Memory
- ProjectChange
- ContextPack
- AgentSession/Outcome later

Claim concept:

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

Evidence concept:

```text
claim_id
file_path
source_type
commit_sha
blob/content hash
line range
authority
observed_at
```

## 24. Source Retention

Desired default:

```text
GitHub
→ fetch relevant source temporarily
→ analyze
→ derive Project Truth
→ discard unnecessary raw source
→ persist claims/evidence pointers/history
```

Do not permanently store full repository clones by default.

Do not claim zero retention if external AI providers retain request logs.

## 25. MVP Technical Direction

- TypeScript
- Node.js 20+
- pnpm
- Next.js App Router
- Tailwind/reusable component system
- GitHub-oriented auth
- GitHub App + Octokit
- PostgreSQL
- Supabase Postgres acceptable/preferred
- reuse/adapt Drizzle
- Zod
- provider-agnostic AI layer
- Vitest
- Playwright
- Vercel

Legacy SQLite/CLI/MCP can remain where useful but are not the primary product.

## 26. 72-Hour MVP Scope

Required:

1. premium landing page;
2. auth/onboarding flow;
3. repository selection;
4. real repo analysis;
5. real Project Truth;
6. evidence in UI;
7. current/uncertain/superseded/contradicted states;
8. rescan/update flow;
9. Changes/Drift;
10. Understand;
11. Context Pack;
12. localhost validation;
13. Vercel-ready architecture.

## 27. Flagship Technical Test

State A:

```text
Authentication = Clerk
```

Expected:

```text
Clerk VERIFIED
```

Change repo to Supabase.

Expected:

```text
Supabase VERIFIED
Clerk SUPERSEDED
```

README still says Clerk:

```text
README contradiction
```

Then request:

```text
Modify authentication middleware
```

Context must use Supabase as current truth.

## 28. MVP Non-Goals

Do not spend the first MVP on:

- billing;
- enterprise SSO;
- complex team RBAC;
- GitLab/Bitbucket;
- Jira/Linear/Slack;
- mobile/desktop;
- self-hosting;
- Kubernetes/Kafka;
- Neo4j/Elasticsearch;
- large vector infrastructure;
- microservices;
- twenty agent integrations;
- autonomous action execution;
- complex policy engine.

## 29. UX Standard

HARIKOS should feel:

- premium;
- intentional;
- fast;
- modern;
- understandable;
- interactive.

Use strong typography, hierarchy, responsive layouts, accessible interactions, polished loading/error states, and purposeful motion.

Motion hierarchy:

```text
CSS/native
→ Motion
→ GSAP for complex choreography
→ Rive/Lottie for authored assets
→ React Three Fiber only for genuine 3D value
```

Do not sacrifice speed for spectacle.

## 30. Validation

Targets:

- >90% truth precision on supported controlled claim categories;
- meaningful evidence for VERIFIED claims;
- >80% stale-fact detection on controlled fixtures;
- measurable reduction in wrong assumptions, exploration, tokens, or time for agents using HARIKOS context.

After MVP, get 5–10 real AI-heavy builders using it quickly.

## 31. Pricing Hypothesis

Not locked.

Potential:

- Free: 1 repo, manual scans, core truth;
- Pro: roughly $15–25/month for private/multiple repos, monitoring, history, context;
- Team: later.

Do not build complex billing before demand.

## 32. Roadmap

### Stage 1
Cloud Project Truth MVP.

### Stage 2
Continuous GitHub webhook monitoring and selective reverification.

### Stage 3
Agent integrations/API/remote MCP.

### Stage 4
Richer verification via AST, tests, CI, schemas, deployment state.

### Stage 5
Memory + agent outcomes + evaluation.

### Stage 6
Teams and multi-repo truth.

### Stage 7
Assumption/plan verification.

### Stage 8
Action Gateway / policy / approvals / runtime.

Do not build later stages now.

## 33. Current Build Order

```text
1. stabilize repo/frontend
2. localhost working
3. clean frontend/backend boundaries
4. RepositorySource abstraction
5. GitHub integration
6. PostgreSQL SaaS persistence
7. real repo → Project Truth
8. evidence in UI
9. supersession/contradiction demo
10. Context Pack
11. browser/security/performance QA
12. deploy after local validation
```

## 34. Definition of Done

The MVP is done when:

1. HARIKOS runs locally as a full-stack web app.
2. The public landing/onboarding experience is polished.
3. A real repository can be analyzed through the intended repository-source architecture.
4. Real structured Project Truth is generated.
5. VERIFIED truths expose evidence.
6. A controlled repo change supersedes old truth.
7. Stale docs can appear as contradictions.
8. The builder can understand the project in human language.
9. Context Packs use current truth.
10. Critical flows are not fake or dead.
11. Typecheck/build/tests pass.
12. Main browser flows are QA'd.
13. Security basics are in place.
14. The app is ready for one Vercel deployment.

## 35. North Star

```text
Connect GitHub.

HARIKOS understands your project.

HARIKOS knows why each important fact is true.

When your project changes,
HARIKOS changes its understanding.

You understand the project better.

Your coding agents get current context
instead of stale assumptions.
```
