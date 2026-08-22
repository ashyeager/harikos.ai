# HARIKOS AI — Product Requirements Document

**Document:** `harikos-ai-prd.md`  
**Status:** Locked flagship product direction — MVP specification  
**Date:** August 22, 2026  
**Company:** HARIKOS  
**Product / software line:** HARIKOS AI  
**Services arm:** H Agency  
**Primary build target:** Local-first MVP + CLI + MCP + web app  
**Primary development tools:** Codex, Google AI Studio, Gemini API where useful  
**MVP infrastructure goal:** $0-first; no paid API or cloud dependency required to prove the product

---

# 1. Executive Summary

HARIKOS AI is a **truthful, context-driven project intelligence and persistent memory layer for AI coding agents**.

It is designed for developers who use multiple AI coding agents—such as **Codex, Claude Code, Cursor, Hermes, and other MCP-compatible agents**—across the same software project.

The core problem is not merely that agents “forget.”

The deeper problem is that agents:

- lose context across sessions,
- maintain isolated memories,
- retrieve outdated information,
- repeat failed approaches,
- misunderstand the current architecture,
- act on stale assumptions,
- carry forward claims that were once true but are no longer true,
- cannot reliably explain why a remembered project fact should be trusted,
- and force developers to repeatedly re-explain the same project state.

HARIKOS AI solves this by maintaining a **canonical, evidence-backed, continuously updated model of project truth**.

It observes the project itself—Git history, code, tests, configuration, manifests, documentation, agent sessions, explicit developer decisions, and selected outcomes—then extracts structured claims, verifies them, records provenance, detects contradictions, supersedes stale facts, preserves historical state, and generates task-specific context for whichever agent is working next.

The product is therefore **not a generic semantic-memory database**.

Semantic search, embeddings, vector retrieval, and summaries may be internal primitives, but they are not the product thesis.

The product thesis is:

> **AI agents should not merely remember a software project. They should share the same verified understanding of what is true about it right now, why it is believed, what changed, and what happened before.**

Short product statement:

> **HARIKOS AI gives every coding agent the same verified understanding of your project.**

Longer product statement:

> **HARIKOS AI is a persistent project-truth layer for AI coding agents. It observes code, Git, tests, configuration, documentation, decisions, and agent work; converts them into evidence-backed claims; detects contradictions and stale facts; preserves temporal history; and delivers the minimum relevant context to Codex, Claude Code, Cursor, Hermes, and other agents across the development workflow.**

---

# 2. What HARIKOS AI “Stands For”

HARIKOS is the company and master brand.

At this stage, **HARIKOS is not being treated as an acronym** unless the company later deliberately defines one. The name should not be reverse-engineered into a forced acronym.

Conceptually, HARIKOS AI stands for the following product philosophy:

- **Truth over accumulation**
- **Context over prompt dumping**
- **Evidence over unsupported memory**
- **Current state over stale retrieval**
- **History without confusion**
- **Portability across agents**
- **Developer control over opaque agent state**
- **Useful context over maximum context**
- **Verification over confident hallucination**

HARIKOS AI should eventually be known as infrastructure that helps AI agents operate with **persistent, verifiable, shared context**.

---

# 3. Company Structure

The company should remain deliberately simple.

```text
HARIKOS
│
├── HARIKOS AI
│   Software / product
│   Flagship direction: project truth + agent memory infrastructure
│
└── H Agency
    Services
    AI automation / implementation / client work
```

There should be no unnecessary proliferation of sub-brands.

For now:

- **HARIKOS** = company
- **HARIKOS AI** = flagship software product/business line
- **H Agency** = service arm

Terms such as “Truth Engine,” “Context Engine,” or “Action Gateway” are internal product architecture concepts or future modules, not additional company brands.

---

# 4. Product Vision

Software development is moving toward a world where one project may be touched by many agents:

```text
Developer
   │
   ├── Codex
   ├── Claude Code
   ├── Cursor
   ├── Hermes
   ├── local/open-source agents
   └── future autonomous agents
```

Today, these systems largely operate with fragmented or temporary project understanding.

A developer may spend hours with Claude Code establishing:

- architecture,
- constraints,
- coding conventions,
- rejected approaches,
- known bugs,
- product decisions,
- deployment state,
- database assumptions,
- and project goals.

Then a later Codex session may know none of it.

Worse, if context is persisted naively, the new agent may retrieve facts that used to be true but are now obsolete.

HARIKOS AI aims to become the layer between the evolving software project and the agents acting on it.

Long-term vision:

```text
Software Project
     │
     ▼
HARIKOS AI
     │
     ├── observes
     ├── remembers
     ├── verifies
     ├── reconciles
     ├── evaluates
     └── governs
     │
     ▼
All AI Agents
```

Eventually, HARIKOS AI can expand from project truth into:

1. persistent memory,
2. project state,
3. agent handoffs,
4. context generation,
5. agent correctness evaluation,
6. permissions,
7. approvals,
8. action policies,
9. execution audit,
10. and a broader runtime/control layer for autonomous agents.

The initial wedge, however, is deliberately narrow:

> **Verified project truth and persistent context for AI coding agents.**

---

# 5. Problem Statement

## 5.1 Agents forget between sessions

AI coding agents frequently begin new sessions with incomplete context.

The developer repeatedly explains:

- what the project does,
- which stack it uses,
- what was changed yesterday,
- why a certain implementation was rejected,
- where the current bug is,
- and what the next task is.

This wastes developer time and tokens.

---

## 5.2 Different agents hold different realities

A developer may use Claude Code in one session and Codex in another.

Claude may know:

> “We migrated authentication from Firebase to Clerk.”

Codex may still infer Firebase from old files, old notes, previous conversation, or stale generated memory.

The tools do not naturally share a single verified project state.

---

## 5.3 Generic memory becomes stale

Traditional persistent memory systems often follow roughly this model:

```text
capture
   ↓
embed
   ↓
store
   ↓
semantic search
   ↓
retrieve
```

That is useful, but insufficient for software projects.

If a fact changes:

```text
Monday: ORM = Drizzle
Friday: ORM = Prisma
```

both facts may remain semantically searchable forever.

A vector database does not inherently understand:

- which fact is current,
- which fact was superseded,
- whether both apply in different scopes,
- what source is authoritative,
- when the transition happened,
- or whether the agent is retrieving historical context when it needs current truth.

---

## 5.4 Agents repeat failed work

An agent may try an approach, fail, and later another agent repeats the same approach because the failure was not captured in usable form.

Useful persistent context includes more than static facts.

It includes:

- failed approaches,
- bugs,
- root causes,
- rejected architecture decisions,
- constraints,
- deployment incidents,
- unresolved problems,
- and known dangerous assumptions.

---

## 5.5 Project documentation decays

README files, AGENTS.md files, architecture docs, and hand-maintained context documents become stale.

The source code itself changes faster than documentation.

HARIKOS should use documentation as evidence—but not assume documentation is automatically authoritative.

---

## 5.6 More context is not always better

Dumping an entire project history into an agent:

- wastes tokens,
- creates distraction,
- increases contradictory context,
- increases prompt cost,
- and can reduce answer quality.

HARIKOS must answer:

> **What does this agent need to know for this task right now?**

not:

> **How much project data can we stuff into the prompt?**

---

# 6. Core Product Thesis

HARIKOS AI separates three concepts that are often incorrectly merged.

## 6.1 Memory

Historical or contextual information worth preserving.

Examples:

- “We tried Redis Streams and rejected it due to operational complexity.”
- “Stripe webhook duplication caused issue #41.”
- “The developer prefers Drizzle migrations to be committed.”
- “This bug appeared after the auth migration.”

Memory may be useful even when it is not “current truth.”

---

## 6.2 Truth

A structured claim about the project that HARIKOS currently believes is true.

Example:

```text
Subject: authentication
Predicate: provider
Value: Clerk
Status: current
Confidence: 0.99
```

Truth should have:

- evidence,
- provenance,
- time validity,
- confidence,
- scope,
- and relationship to any superseded or contradictory claims.

---

## 6.3 Context

The subset of truth + memory that is relevant to the agent’s current task.

Example task:

> “Implement Stripe webhook handling.”

HARIKOS should not return all project memory.

It should return something like:

```text
TASK CONTEXT

Goal:
Implement Stripe webhook handling.

Current stack:
- Next.js
- PostgreSQL
- Drizzle
- Stripe

Relevant decisions:
- Stripe is source of truth for subscription state.
- Webhook handlers must be idempotent.

Known issue:
- invoice.payment_failed is not handled.

Failed approach:
- Updating billing state from checkout success page caused duplicate state.

Relevant files:
- src/api/stripe/webhook.ts
- src/db/subscriptions.ts
```

This is the **Context Pack** concept.

---

# 7. Product Principles

## 7.1 Truth > memory

A remembered claim is not automatically true.

---

## 7.2 Evidence first

Important claims should point back to evidence wherever possible:

- file,
- line,
- commit,
- test,
- config,
- manifest,
- documentation,
- developer decision,
- agent session,
- or explicit manual input.

---

## 7.3 Current truth must be temporal

Facts change.

HARIKOS must model:

```text
Firebase Auth
valid_from: May 1
valid_to: Aug 18
status: superseded

Clerk
valid_from: Aug 18
valid_to: null
status: current
```

Historical facts should remain available without contaminating current retrieval.

---

## 7.4 Contradictions are first-class objects

HARIKOS should not silently overwrite every disagreement.

A contradiction can be:

- genuine conflict,
- stale fact,
- scoped difference,
- uncertain evidence,
- temporary migration state,
- or model extraction error.

Contradictions need explicit representation and resolution.

---

## 7.5 Deterministic evidence beats LLM inference

If `package.json` contains `@clerk/nextjs`, HARIKOS should not need an LLM to decide whether Clerk is installed.

LLMs should be used where interpretation is actually required.

---

## 7.6 Minimal useful context

HARIKOS should optimize for useful context, not maximum context.

---

## 7.7 Agent portability

The project’s memory and truth should belong to the project/developer/team—not to one AI vendor.

---

## 7.8 Local-first MVP

The initial product should work locally with:

- SQLite,
- Git,
- local project files,
- MCP,
- optional local/free-tier models.

Cloud sync can come later.

---

## 7.9 Inspectability

Developers should be able to see:

- what HARIKOS believes,
- why,
- what changed,
- what contradicted it,
- and what an agent received.

Opaque “AI memory magic” is not the goal.

---

# 8. Target Users

## Initial ICP

Developers and small engineering teams that:

- use AI coding agents heavily,
- use more than one coding agent,
- work on non-trivial repositories,
- regularly reopen projects after time away,
- work across many agent sessions,
- have recurring architecture/context decisions,
- and feel pain from agent context loss or stale assumptions.

Early users likely include:

- solo founders,
- indie hackers,
- AI-native developers,
- open-source maintainers,
- startup engineering teams,
- agent-framework developers,
- power users of Claude Code,
- power users of Codex,
- Cursor users,
- Hermes/open-source agent users.

---

# 9. Initial Jobs To Be Done

## JTBD 1

> When I start a fresh agent session, give the agent the current project state without making me explain everything again.

## JTBD 2

> When the project changes, stop old facts from resurfacing as though they are still true.

## JTBD 3

> When an agent claims something about my project, let me understand what evidence supports it.

## JTBD 4

> When one coding agent learns something important, make that context available to the next agent.

## JTBD 5

> When an approach fails, preserve the failure so future agents do not blindly repeat it.

## JTBD 6

> When I ask an agent to perform a task, give it only the relevant project context.

---

# 10. Competitive Frame

HARIKOS is not entering an empty market.

Existing products validate the demand for persistent agent memory.

## Mem.ai

Primary orientation:

- personal knowledge,
- notes,
- meetings,
- calendar,
- human productivity,
- proactive personal context.

HARIKOS differentiation:

- software-project truth,
- source verification,
- coding-agent workflow,
- Git/code/test/config awareness.

Mem.ai validates the idea that persistent context is valuable, but it is not the primary product model HARIKOS should copy.

---

## Mem0

Primary orientation:

- generic memory infrastructure for AI applications,
- memory storage/retrieval,
- developer APIs,
- broad agent use cases.

HARIKOS should not compete by becoming “another generic memory API.”

HARIKOS should sit **above commodity memory primitives** and solve project-truth problems.

---

## AgentMemory-style systems

Primary orientation:

- persistent coding-agent memory,
- multi-agent integrations,
- recall,
- lifecycle,
- confidence,
- search.

This means HARIKOS cannot win simply with:

> “Claude and Codex share memory.”

That is already being built.

---

## Wolbarg-style project truth systems

These are closer to HARIKOS’s desired direction:

- shared project truth,
- stale-fact supersession,
- evidence,
- coding-agent connectors.

Therefore HARIKOS must go deeper than basic reconciliation.

The strongest differentiation should become:

> **continuous verification of project claims against actual source state, with explicit authority, temporal validity, contradiction handling, and measurable context quality.**

---

# 11. HARIKOS Differentiation

The product should eventually combine the following:

## 11.1 Automatic claim derivation

HARIKOS derives structured claims from:

- package manifests,
- configuration,
- source code,
- Git changes,
- tests,
- project docs,
- agent decisions,
- and explicit developer input.

---

## 11.2 Source verification

A claim should be checked against relevant project evidence.

Example:

Agent memory:

> “ORM = Prisma.”

Repository:

- `drizzle.config.ts`
- `drizzle-orm` installed
- 27 imports from `drizzle-orm`
- no Prisma schema

HARIKOS:

```text
Candidate claim rejected or marked contradicted.

Current truth:
ORM = Drizzle

Evidence:
- drizzle.config.ts
- package.json
- source imports

Confidence: high
```

---

## 11.3 Source authority

Not all evidence is equal.

Possible authority model:

```text
passing tests / executable config
        >
active source implementation
        >
package manifests
        >
recent Git change
        >
approved architecture decision
        >
maintained docs
        >
agent session claim
        >
old notes / inferred memory
```

This hierarchy should not be rigid across all claim types.

For example:

- a package manifest can prove a dependency exists,
- but cannot necessarily prove it is the active implementation,
- a passing integration test may be stronger,
- an explicit developer decision may define intended architecture even before implementation is complete.

Authority therefore needs **claim-type-aware resolution**.

---

## 11.4 Temporal truth

HARIKOS understands that truth changes.

---

## 11.5 Contradiction graph

Conflicting claims should be linked rather than silently flattened.

---

## 11.6 Provenance graph

Every important claim should be traceable to evidence.

---

## 11.7 Task-specific context packs

Agents receive the context required for the current task.

---

## 11.8 Memory usefulness evaluation

Long-term, HARIKOS should record whether retrieved context helped or harmed the agent.

Example:

```text
STALE CONTEXT INCIDENT

Agent:
Codex

Retrieved claim:
Authentication = Firebase

Canonical truth:
Authentication = Clerk

Outcome:
Build failed because Firebase module no longer exists.

Resolution:
Old claim blocked from current-state retrieval.
```

This can create a powerful proprietary evaluation dataset.

---

# 12. The HARIKOS Moat

The moat cannot be:

- vector embeddings,
- an MCP server,
- a nice dashboard,
- semantic search,
- SQLite,
- or basic long-term memory.

Those are replicable.

Potential moat layers:

## 12.1 Canonical project claim graph

Over time HARIKOS builds a structured representation of:

- project entities,
- architecture,
- dependencies,
- decisions,
- constraints,
- changes,
- failures,
- and state.

---

## 12.2 Provenance

HARIKOS knows **why** it believes a claim.

---

## 12.3 Temporal history

HARIKOS knows what was true before, what is true now, and when transitions happened.

---

## 12.4 Contradiction resolution

HARIKOS learns how to resolve conflicting agent/project evidence.

---

## 12.5 Cross-agent portability

A project brain that is independent of any one model provider.

---

## 12.6 Evaluation dataset

Potentially the strongest future moat.

HARIKOS can learn from:

- which memories were retrieved,
- which context was useful,
- which context caused mistakes,
- which source types predicted correctness,
- which claims decayed quickly,
- which tasks required which context,
- which contradictions mattered,
- and which project events should have been remembered.

That data can improve:

- memory selection,
- context ranking,
- stale-fact detection,
- source authority,
- confidence calibration,
- and agent performance.

---

## 12.7 Workflow integration

Once a team’s agents depend on HARIKOS for context and project truth, the product becomes embedded in daily development workflow.

---

# 13. System Surfaces

HARIKOS AI is one product with four primary surfaces.

```text
                 HARIKOS CORE
                  Truth Engine
                       │
          ┌────────────┼────────────┐
          │            │            │
         CLI          MCP         Web App
          │            │            │
      developer     AI agents     humans
       controls      consume      inspect
          │            │            │
          └────────────┼────────────┘
                       │
                 Project State
```

## 13.1 Core program

The core engine:

- scans,
- parses,
- stores,
- extracts,
- verifies,
- reconciles,
- retrieves,
- and generates context.

---

## 13.2 CLI

The CLI is the developer control surface.

Initial commands:

```bash
harikos init
harikos scan
harikos truth
harikos contradictions
harikos remember "..."
harikos status
harikos ui
```

Possible later commands:

```bash
harikos context "<task>"
harikos explain <claim-id>
harikos history <subject>
harikos verify
harikos doctor
```

---

## 13.3 MCP server

The MCP server is the agent-facing interface.

Initial tools:

### `get_project_truth`

Return current canonical project truth.

### `search_project_memory`

Search relevant historical/project memory.

### `get_recent_changes`

Return meaningful recent project changes.

### `get_decisions`

Return relevant decisions and constraints.

### `get_context_pack`

Generate task-specific project context.

### `record_memory`

Allow an agent to propose a new memory.

Important:

Agent-proposed memories are **not automatically canonical truth**.

They should enter as candidate events/memories/claims that can be verified.

---

## 13.4 Web app

The web app is the human control center.

For the local MVP, it can run against the same local SQLite database.

Example:

```bash
harikos ui
```

opens:

```text
http://localhost:3000
```

Initial screens:

- Projects
- Project Overview
- Truth
- Evidence
- Contradictions
- Timeline
- Memory
- Context Packs
- Agent Sessions later

The web app should not initially require:

- cloud auth,
- teams,
- billing,
- subscriptions,
- or remote sync.

---

# 14. End-to-End Product Workflow

## 14.1 Initialization

Developer runs:

```bash
npx harikos init
```

HARIKOS:

1. detects repository root,
2. initializes local configuration,
3. creates local database,
4. records project metadata,
5. offers MCP configuration instructions.

Possible local folder:

```text
.hariko/
  config.json
  project.db
```

Name can be revisited; the concept matters more than exact hidden-folder naming for MVP.

---

## 14.2 Scan

Developer runs:

```bash
harikos scan
```

HARIKOS collects high-value project evidence.

Initial scan sources:

### Manifests

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `yarn.lock`
- `pyproject.toml`
- `requirements.txt`
- `Cargo.toml`
- other ecosystems later

### Configuration

- `tsconfig.json`
- `next.config.*`
- `vite.config.*`
- `drizzle.config.*`
- `prisma/schema.prisma`
- Docker files
- CI configuration
- deployment config
- selected environment examples

### Documentation

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- architecture docs
- ADRs

### Git

- branch,
- HEAD commit,
- recent commits,
- diffs,
- file changes,
- deleted files,
- rename history where useful.

### Source tree

Directory structure and selectively chosen source files.

### Tests

- test structure,
- test configuration,
- optionally test results later.

HARIKOS should **not send the entire repository blindly to an LLM**.

---

# 15. Deterministic Parsers vs AI Extraction

HARIKOS should use deterministic parsing whenever the information can be established reliably.

## Deterministic examples

From `package.json`:

```text
next dependency exists
→ Next.js is installed
```

From `drizzle.config.ts` + active imports:

```text
→ Drizzle is likely active ORM
```

From Git:

```text
file deleted
commit timestamp
branch state
```

From test runner:

```text
test passed
test failed
```

These should not depend on LLM judgment.

---

## AI extraction examples

LLMs are useful for:

- summarizing architecture implications,
- extracting decisions from commit messages,
- interpreting natural-language docs,
- classifying agent-session outcomes,
- finding candidate contradictions,
- determining whether a statement is worth remembering,
- generating context packs,
- mapping natural language to structured claims.

Architecture:

```text
Sources
   │
   ├── deterministic parsers ──► hard facts
   │
   └── LLM extractor ──────────► candidate claims
                                  │
                                  ▼
                              verification
                                  │
                                  ▼
                            canonical truth
```

---

# 16. Candidate Claim Pipeline

Example source:

```text
package.json
@clerk/nextjs present
```

Candidate:

```json
{
  "subject": "authentication",
  "predicate": "provider",
  "value": "clerk",
  "confidence": 0.88
}
```

HARIKOS should then ask:

1. Is this a claim type we recognize?
2. Does supporting evidence exist elsewhere?
3. Does it contradict current truth?
4. Is the source newer?
5. Is the source authoritative for this claim type?
6. Is this a transition or coexistence?
7. Should the old claim be superseded?
8. Is human review required?

The extractor does not own final truth.

---

# 17. Truth Resolution

Truth resolution is the core technical problem.

Pseudo-flow:

```text
candidate claim
      │
      ▼
normalize subject/predicate/value
      │
      ▼
find related current claims
      │
      ├── none
      │     └── verify evidence → accept / uncertain
      │
      └── related claim exists
              │
              ├── compatible
              │     └── strengthen/merge evidence
              │
              └── incompatible
                    │
                    ▼
               contradiction
                    │
                    ▼
             compare authority
             compare recency
             inspect scope
             inspect evidence
                    │
          ┌─────────┼─────────┐
          │         │         │
       supersede  coexist   review
```

---

# 18. Example: Firebase → Clerk

Initial truth:

```text
Authentication provider = Firebase

status: current
confidence: 0.96
evidence:
- firebase config
- auth implementation
```

Repository changes:

```text
package.json:
@clerk/nextjs

middleware.ts:
clerkMiddleware()

firebase auth files:
deleted

commit:
"migrate auth from Firebase to Clerk"
```

HARIKOS derives:

```text
Authentication provider = Clerk
```

Resolution:

```text
Firebase
status: superseded
valid_to: 2026-08-22

Clerk
status: current
valid_from: 2026-08-22
confidence: 0.99
```

Historical context remains queryable.

Current context defaults to Clerk.

This is the flagship MVP demo.

---

# 19. Core Data Model

The initial model should stay understandable.

## Project

```text
id
name
path
created_at
last_scanned_at
```

---

## Source

An observed source of information.

```text
id
project_id
type
path
content_hash
observed_at
metadata
```

Possible types:

- file
- git_commit
- test_result
- documentation
- agent_session
- manual
- config
- manifest

---

## Event

Something that happened.

```text
id
project_id
type
timestamp
source_id
payload
```

Examples:

- file changed
- commit created
- test failed
- dependency added
- agent decision recorded
- migration completed

---

## Claim

Structured proposition about the project.

```text
id
project_id
subject
predicate
value
scope
status
confidence
valid_from
valid_to
created_at
updated_at
```

Statuses:

- candidate
- current
- uncertain
- contradicted
- historical
- superseded
- rejected

---

## Evidence

```text
id
claim_id
source_id
path
line_start
line_end
excerpt
strength
created_at
```

---

## Contradiction

```text
id
project_id
claim_a
claim_b
status
reason
resolution
created_at
resolved_at
```

---

## Resolution

```text
id
contradiction_id
resolution_type
chosen_claim
reason
actor
created_at
```

Possible resolution types:

- supersede
- coexist
- reject
- merge
- human_override

---

## Memory

```text
id
project_id
type
content
importance
status
source_id
created_at
```

Memory types:

- decision
- failed_attempt
- bug
- root_cause
- constraint
- preference
- outcome
- note
- incident

---

## AgentSession

```text
id
project_id
agent
started_at
ended_at
task
summary
```

---

## Outcome

```text
id
session_id
type
result
success
related_claims
created_at
```

---

## ContextPack

```text
id
project_id
task
generated_at
claims
memories
files
decisions
changes
token_estimate
```

---

# 20. Retrieval Strategy

HARIKOS is explicitly **not semantic-memory-only**.

MVP retrieval order should prioritize structured project state.

Example:

```text
Task
 ↓
identify relevant entities/domains
 ↓
current claims
 ↓
recent related changes
 ↓
relevant decisions
 ↓
known failures/constraints
 ↓
supporting memory
 ↓
semantic fallback if necessary
```

Semantic/vector retrieval can be added later.

For v0:

- relational queries,
- SQLite full-text search,
- tags/entities,
- recency,
- claim relationships,
- source relationships

may be enough.

Later:

- embeddings,
- hybrid search,
- reranking,
- graph traversal,
- learned context selection.

---

# 21. Context Pack Strategy

A Context Pack should be optimized for the **task**, not for archival completeness.

Input:

```text
"Implement payment webhooks."
```

Output:

```text
PROJECT CONTEXT

Task:
Implement payment webhooks.

CURRENT TRUTH
- Framework: Next.js
- Database: PostgreSQL
- ORM: Drizzle
- Billing: Stripe

RELEVANT DECISIONS
- Stripe is source of truth for subscription status.
- Webhooks must be idempotent.

KNOWN ISSUES
- invoice.payment_failed is not handled.

FAILED APPROACH
- Updating subscription state directly from the checkout success page caused duplication.

RECENT CHANGES
- stripe_customer_id replaced customer_id.

RELEVANT FILES
- src/api/stripe/webhook.ts
- src/db/subscriptions.ts
```

Design goals:

- small,
- current,
- explainable,
- relevant,
- no stale facts,
- no redundant history.

---

# 22. MCP Design

Initial MCP capabilities should be minimal.

## Tools

### `get_project_truth`

Parameters:

- optional domain
- optional scope
- optional task

Returns:

- current claims,
- confidence,
- provenance summary.

---

### `search_project_memory`

Parameters:

- query
- type filters
- time filters

Returns:

- memories,
- relevance,
- source.

---

### `get_recent_changes`

Returns meaningful recent project changes.

---

### `get_decisions`

Returns architecture/product/implementation decisions.

---

### `get_context_pack`

Parameters:

- task

Returns the curated context pack.

---

### `record_memory`

Allows an agent to propose:

- decision,
- outcome,
- failed attempt,
- constraint,
- bug,
- note.

Important:

`record_memory` does not grant the agent authority to rewrite canonical truth.

---

# 23. CLI Design

## `harikos init`

Initialize project.

---

## `harikos scan`

Scan repository and update sources/events/claims.

---

## `harikos truth`

Example:

```text
HARIKOS PROJECT TRUTH

Framework       Next.js       99%
Language        TypeScript    99%
Database        PostgreSQL    98%
ORM             Drizzle       98%
Auth            Clerk         99%
Deployment      Vercel        84%
Queue           Redis         62%  UNCERTAIN
```

---

## `harikos contradictions`

Example:

```text
CONTRADICTIONS

1. ORM

Agent memory:
Prisma

Repository truth:
Drizzle

Evidence:
- drizzle.config.ts
- package.json
- 17 source imports

Status:
Prisma claim contradicted
```

---

## `harikos remember`

Example:

```bash
harikos remember "Stripe is the source of truth for subscription status."
```

Should create a memory/decision candidate with explicit manual provenance.

---

## `harikos status`

Shows:

- last scan,
- number of claims,
- contradictions,
- memories,
- MCP status.

---

## `harikos ui`

Starts local dashboard.

---

# 24. Web App

The web app is a human inspection/control surface.

It should not be mistaken for the core product.

## Project Overview

Show:

- project name,
- scan health,
- current architecture,
- recent changes,
- unresolved contradictions,
- relevant memory statistics.

---

## Truth Page

Table of current claims.

Fields:

- subject,
- value,
- status,
- confidence,
- last verified,
- evidence count.

---

## Claim Detail

Show:

```text
Authentication
Clerk

Status:
CURRENT

Confidence:
99%

Evidence:
- package.json
- middleware.ts
- commit 81ac02
- auth tests

Supersedes:
Firebase

Current since:
Aug 22, 2026
```

---

## Contradictions Page

Show unresolved disagreements.

---

## Timeline Page

Example:

```text
Aug 22
Authentication: Firebase → Clerk

Aug 21
API architecture: REST → tRPC

Aug 19
Redis queue introduced

Aug 18
Stripe subscription source-of-truth decision recorded
```

---

## Memory Page

Categories:

- Decisions
- Failed Attempts
- Bugs
- Outcomes
- Constraints
- Historical facts

---

## Context Pack Viewer

User enters a task and inspects the context HARIKOS would give an agent.

This is useful both for debugging and product trust.

---

# 25. Recommended MVP Technology Stack

## Language

**TypeScript**

Reason:

- same language across CLI, MCP, core, and web,
- good SDK ecosystem,
- strong Zod support,
- easy Codex-assisted development,
- natural fit for Next.js and MCP.

---

## Runtime

**Node.js 20+**

---

## Package Manager

**pnpm**

Use pnpm workspaces for a lightweight monorepo.

---

## Web

**Next.js**

---

## UI

- Tailwind CSS
- shadcn/ui-style accessible components
- Lucide icons if needed

The interface should feel technical, restrained, inspectable, and developer-focused.

---

## Database

**SQLite for MVP**

Benefits:

- zero infrastructure,
- local-first,
- simple distribution,
- portable project database,
- no account required.

---

## ORM

**Drizzle**

---

## Validation

**Zod**

All LLM structured outputs must be schema-validated.

---

## CLI

**Commander**

---

## Git

Start with:

- Git CLI commands

or:

- `simple-git`

Avoid building custom Git internals unless necessary.

---

## AI

### Google AI Studio

Use for prompt and structured extraction experimentation.

### Gemini API

Use where LLM interpretation is genuinely useful.

Potential MVP tasks:

- claim extraction,
- decision extraction,
- memory classification,
- contradiction explanation,
- context-pack composition.

Use structured JSON/Zod schemas.

The product should be designed so Gemini can later be swapped for another provider.

AI provider interface:

```text
packages/core/ai/provider.ts
```

or equivalent abstraction.

---

## Local Models

Optional:

- Ollama

Useful for:

- zero-cost local experimentation,
- privacy-sensitive workflows,
- future fully local mode.

Do not make local model quality a blocker for the initial demo.

---

## MCP

Official TypeScript MCP SDK.

---

## Testing

**Vitest**

---

## Deployment

**Vercel later**

The MVP should not require cloud deployment to work.

---

# 26. Monorepo Structure

Recommended:

```text
harikos-ai/
│
├── apps/
│   └── web/
│
├── packages/
│   ├── core/
│   │   ├── scanner/
│   │   ├── parsing/
│   │   ├── claims/
│   │   ├── truth/
│   │   ├── retrieval/
│   │   ├── context/
│   │   ├── evaluation/
│   │   └── ai/
│   │
│   ├── db/
│   │
│   ├── cli/
│   │
│   └── mcp/
│
├── fixtures/
│   └── demo-project/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── MVP.md
│   └── PRODUCT.md
│
├── AGENTS.md
├── package.json
└── pnpm-workspace.yaml
```

---

# 27. MVP Scope

The MVP should prove the full core loop.

## Required

### Local project initialization

```bash
harikos init
```

### Repository scanning

- project tree
- manifests
- selected config
- selected docs
- recent Git history

### Structured claims

Derive key claims such as:

- language
- framework
- database
- ORM
- auth provider
- deployment
- queue
- major architecture choices

### Evidence

Claims must show source evidence.

### Temporal state

Support:

- current
- historical
- superseded
- contradicted
- uncertain

### Contradiction detection

At minimum, detect incompatible values for known claim types.

### Basic memory

Support:

- decisions
- failed attempts
- bugs
- constraints
- outcomes

### CLI

Usable commands.

### MCP

Codex/Claude-compatible project truth access.

### Context pack

Task-specific project context.

### Web dashboard

Local UI for:

- truth,
- evidence,
- contradictions,
- memory,
- timeline.

### Demo project

Controlled repository for the Firebase → Clerk supersession demo.

---

# 28. Explicit MVP Non-Goals

Do not build these in the first MVP:

- cloud accounts,
- authentication,
- billing,
- subscriptions,
- teams,
- enterprise permissions,
- SSO,
- mobile app,
- IDE extension,
- GitHub App,
- remote sync,
- Slack,
- Linear,
- Jira,
- action gateway,
- production permissions,
- autonomous execution,
- multi-region infrastructure,
- complex knowledge-graph visualization,
- dedicated vector database,
- Elasticsearch,
- Pinecone,
- Kafka,
- Redis Cloud,
- Kubernetes,
- microservices,
- twenty agent integrations,
- generic AI chat UI.

The MVP exists to answer:

> **Can HARIKOS maintain and deliver more reliable project truth than an agent’s isolated memory?**

---

# 29. 48–72 Hour MVP Build Plan

## Phase 0 — Freeze the spec

Create:

- repository,
- pnpm workspaces,
- `AGENTS.md`,
- architecture doc,
- product doc,
- database schema.

Codex should implement scoped tasks against these documents.

---

## Phase 1 — Database + project init

Build:

- SQLite DB,
- Drizzle schema,
- project record,
- source/event/claim/evidence tables,
- migrations.

Command:

```bash
harikos init
```

Success:

Current repo can be registered locally.

---

## Phase 2 — Scanner

Build:

```bash
harikos scan
```

Initial scanner reads:

- package manifest,
- lockfile,
- common config,
- repo tree,
- README/AGENTS docs,
- recent Git commits.

Success:

HARIKOS stores observed sources with hashes/timestamps.

---

## Phase 3 — Deterministic fact extraction

Before adding AI, derive easy facts.

Examples:

```text
package.json contains next
→ framework candidate = Next.js

drizzle config + imports
→ ORM candidate = Drizzle
```

Success:

`harikos truth` can already display a few grounded facts.

---

## Phase 4 — Gemini structured extraction

Use Google AI Studio to refine extraction prompts.

Then implement schema-constrained Gemini calls.

Input:

```text
source_type
path
source excerpt
known claims
```

Output:

```json
{
  "claims": [
    {
      "subject": "authentication",
      "predicate": "provider",
      "value": "clerk",
      "confidence": 0.92
    }
  ]
}
```

Validate with Zod.

Success:

HARIKOS can extract useful claims from natural-language/ambiguous sources.

---

## Phase 5 — Truth resolution

Implement:

- candidate,
- current,
- uncertain,
- contradicted,
- superseded,
- historical.

Add contradiction logic for initial known domains:

- framework,
- ORM,
- auth,
- database,
- deployment,
- major provider choices.

Success:

Firebase can be superseded by Clerk.

---

## Phase 6 — CLI visibility

Implement:

```bash
harikos truth
harikos contradictions
harikos status
harikos remember
```

Success:

A developer can understand project state entirely from terminal.

---

## Phase 7 — MCP

Expose:

- `get_project_truth`
- `search_project_memory`
- `get_recent_changes`
- `get_decisions`
- `get_context_pack`
- `record_memory`

Connect Codex first.

Success:

A fresh Codex session can ask HARIKOS what auth system the repo uses and receive the current verified answer.

---

## Phase 8 — Controlled supersession demo

Start fixture with Firebase.

Scan.

Change fixture to Clerk.

Add commit.

Rescan.

Expected:

```text
Firebase
SUPERSEDED

Clerk
CURRENT
```

Fresh agent:

> “What auth provider is this project using?”

Expected answer:

> Clerk, with evidence; Firebase appears only as historical/superseded context.

This is the MVP’s key proof.

---

## Phase 9 — Local web dashboard

Build only:

- project page,
- truth,
- claim details,
- evidence,
- contradictions,
- timeline,
- memory.

Success:

Product is visually understandable and demoable.

---

## Phase 10 — Marketing artifact

Record a short demo:

1. show stale Firebase memory,
2. migrate repo to Clerk,
3. run HARIKOS scan,
4. show supersession,
5. open fresh Codex session,
6. ask about auth,
7. Codex receives Clerk + provenance.

Primary marketing line:

> **Coding agents do not just need memory. They need to know when their memories stop being true.**

---

# 30. Development Workflow With Codex

Codex should be treated as an implementation agent, not as the source of product strategy.

Avoid:

> “Build the entire HARIKOS AI platform.”

Prefer scoped tasks:

> Implement the SQLite schema defined in `docs/ARCHITECTURE.md`. Do not modify other packages. Add migrations and Vitest coverage.

Then:

> Implement deterministic scanning for package.json and Git metadata. Return typed SourceEvidence objects. Do not call Gemini.

Then:

> Implement Gemini claim extraction against the existing Zod schema.

Then:

> Implement contradiction detection and supersession rules for the initial claim domains.

This preserves architecture and makes debugging tractable.

---

# 31. Google AI Studio Workflow

Use Google AI Studio as the model-behavior laboratory.

## Experiment 1 — claim extraction

Input:

```text
SOURCE TYPE: package.json
SOURCE: ...
```

Expected output:

structured claims.

---

## Experiment 2 — decision extraction

Input:

Git commit + relevant diff + docs.

Output:

possible architectural decision.

---

## Experiment 3 — memory classification

Classify:

- decision
- failed attempt
- bug
- constraint
- outcome
- irrelevant

---

## Experiment 4 — contradiction reasoning

Input:

existing claim + new candidate + evidence.

Output:

- incompatible?
- possible explanation?
- human review needed?

Important:

The LLM may explain contradictions, but deterministic rules/authority should remain central.

---

## Experiment 5 — context-pack composition

Input:

task + current truth + relevant memory.

Output:

small structured context pack.

---

# 32. Cost Constraints

The MVP should be possible with **no paid infrastructure dependency**.

## Free/local components

- TypeScript
- Node
- pnpm
- Next.js
- SQLite
- Drizzle
- Zod
- Commander
- Git
- MCP SDK
- Vitest
- local development
- GitHub
- Ollama optionally

Google AI Studio / supported Gemini free-tier access can be used for experimentation where available.

Important product rule:

> A paid API must not be necessary to prove the core architecture.

Cloud hosting, paid inference, remote databases, auth, billing, and production telemetry can be added after the product proves value.

---

# 33. Privacy and Security

This matters because HARIKOS reads source code and project history.

## MVP principles

### Local-first storage

Project data stays locally in SQLite by default.

### Explicit AI boundary

If source excerpts are sent to a cloud LLM, the user must know that.

### Minimize transmitted data

Do not send entire repositories unnecessarily.

Send only selected evidence needed for extraction.

### Never automatically ingest secrets

Ignore:

- `.env`
- credentials
- tokens
- private keys
- secret stores

`.env.example` may be scanned because it normally contains key names rather than live secrets, but handling still needs care.

### `.gitignore`-style HARIKOS ignore rules

Support a future:

```text
.harikoignore
```

or equivalent configuration for files never to scan.

### Provenance and auditability

The user should know which model-derived claims came from which sources.

### No silent canonicalization of uncertain AI output

Low-confidence or conflicting claims should remain uncertain/reviewable.

---

# 34. Evaluation Strategy

HARIKOS needs its own evaluation suite early.

Do not evaluate only:

> “Did retrieval return something relevant?”

Evaluate:

## Truth accuracy

Is current project truth correct?

## Stale-fact rejection

Does HARIKOS avoid returning superseded facts as current?

## Contradiction detection

Does it identify conflicts?

## Provenance quality

Can each important claim be traced to meaningful evidence?

## Context usefulness

Does the generated context help an agent finish the task?

## Context precision

How much returned context was actually useful?

## Context size

Can HARIKOS reduce unnecessary tokens?

## Agent continuity

How much re-explanation is needed when switching agents?

## Repeated-error reduction

Do agents repeat fewer known failed approaches?

---

# 35. Initial Evaluation Fixtures

Create deterministic fixture repositories.

## Fixture A — auth migration

Firebase → Clerk.

Expected:

old claim superseded.

---

## Fixture B — ORM migration

Drizzle → Prisma.

Expected:

correct time transition.

---

## Fixture C — stale docs

README says Firebase.

Source code says Clerk.

Expected:

source implementation outranks stale README.

---

## Fixture D — installed but unused package

Prisma dependency exists but active code uses Drizzle.

Expected:

HARIKOS does not blindly infer active ORM from package presence.

---

## Fixture E — transitional coexistence

Both old and new auth systems temporarily exist during migration.

Expected:

HARIKOS marks state as migration/coexistence/uncertain instead of forcing a false single answer.

---

## Fixture F — agent hallucination

Agent records:

> “We deploy to AWS.”

Repo/deployment config indicates Vercel.

Expected:

agent claim remains contradicted/rejected.

---

# 36. Success Metrics for MVP

The MVP is successful if:

1. a repo can be initialized locally,
2. HARIKOS can scan real project evidence,
3. it can generate a useful set of structured claims,
4. claims expose provenance,
5. a controlled migration supersedes an old fact,
6. stale truth remains historical but does not appear as current,
7. Codex can query HARIKOS through MCP,
8. a fresh agent session receives current project state without manual re-explanation,
9. a task-specific context pack is meaningfully smaller than full project memory,
10. the web UI makes the system understandable.

---

# 37. Post-MVP Product Roadmap

## Stage 1 — Project Truth MVP

- local core,
- CLI,
- MCP,
- Git-aware scanning,
- claims,
- evidence,
- supersession,
- contradictions,
- context packs,
- basic web app.

---

## Stage 2 — Better memory lifecycle

Improve:

- what deserves remembering,
- importance scoring,
- memory decay,
- duplicate detection,
- memory consolidation,
- failed-attempt recording,
- session summaries.

---

## Stage 3 — Richer source verification

Add:

- test execution/results,
- static analysis,
- AST parsing,
- schema introspection,
- CI results,
- dependency graphs,
- deployment state.

---

## Stage 4 — More agent integrations

Expand from Codex/MCP to:

- Claude Code,
- Cursor,
- Hermes,
- open-source agents,
- custom agent SDK usage.

Because MCP is the portability layer, many clients can share the same core.

---

## Stage 5 — Cloud sync

Introduce optional hosted mode:

```text
local HARIKOS
      ↓
HARIKOS cloud
      ↓
shared team project truth
```

Use Postgres in cloud.

Local-first can remain supported.

---

## Stage 6 — Teams

Add:

- shared project state,
- developer identities,
- team decisions,
- permissions,
- truth review,
- project timelines,
- organization-level policy.

---

## Stage 7 — Agent Evaluation

Measure:

- stale-memory incidents,
- wrong-context incidents,
- repeated failures,
- context relevance,
- context-token savings,
- agent performance by task.

This stage can create the strongest long-term data moat.

---

## Stage 8 — Action Gateway

Future agent action flow:

```text
Agent
  ↓
HARIKOS context
  ↓
Agent decision
  ↓
HARIKOS policy
  ↓
allow / approve / reject
  ↓
tool action
  ↓
outcome
  ↓
HARIKOS memory/truth
```

Capabilities:

- action policies,
- approval requirements,
- diff previews,
- evidence,
- audit logs,
- rollback metadata,
- external-system permissions.

---

## Stage 9 — Broader Agent Runtime

Long-term HARIKOS AI can become a persistent operating layer around agents:

```text
HARIKOS AI

Truth
Memory
Context
Evaluation
Policy
Approvals
Actions
Audit
```

The initial project-truth product should be able to grow toward this architecture without pretending to build all of it now.

---

# 38. Monetization

The initial MVP should prioritize adoption and proof.

Potential long-term open-core model:

## Free / Local

- local projects,
- CLI,
- MCP,
- local SQLite,
- basic truth engine,
- open-source/community-friendly functionality.

Goal:

developer adoption.

---

## Pro

Possible future range:

- hosted sync,
- multiple machines,
- larger project history,
- richer context generation,
- hosted inference,
- advanced evaluation.

Indicative target:

**$15–25/month** depending on actual value.

---

## Team

Potential:

- shared project truth,
- team memory,
- permissions,
- project timelines,
- team agent context,
- audit,
- cloud sync.

Potential pricing:

**per developer** or base workspace + seats.

---

## Enterprise

Later:

- SSO,
- self-hosting,
- data controls,
- retention rules,
- policy engine,
- Action Gateway,
- audit logs,
- compliance,
- private deployments.

This is where HARIKOS can move from developer utility to infrastructure.

---

# 39. Distribution

HARIKOS AI should be developer-led.

Primary channels:

- GitHub
- Reddit
- Discord
- X
- TikTok
- Reels/Shorts
- Hacker News when mature enough
- developer communities
- open-source communities
- founder/builder content

The product lends itself to visual demos.

Examples:

> “I made Claude know what Codex changed yesterday.”

> “Claude says Prisma. The repo says Drizzle. HARIKOS decides which is actually true.”

> “Coding agents do not just need memory. They need to know when their memories stop being true.”

> “I switched from Claude Code to Codex without explaining the project again.”

Marketing should show technical behavior rather than vague AI-company claims.

Avoid generic language like:

> “Revolutionizing intelligent context orchestration.”

Show the failure and the fix.

---

# 40. Brand and Marketing Roles

## HARIKOS

Company/master brand.

## HARIKOS AI

Software product.

Content:

- technical demos,
- releases,
- docs,
- benchmarks,
- architecture,
- open-source work,
- agent infrastructure.

## H Agency

Separate service motion.

Content:

- client outcomes,
- AI automation,
- direct outreach,
- implementation work.

The audiences should not be confused.

HARIKOS AI earns developer trust.

H Agency sells services.

---

# 41. Website Direction

Eventually:

## Marketing site

```text
harikos.ai
```

Purpose:

- explain product,
- show demo,
- docs,
- GitHub,
- signup/download.

Possible hero:

> **The project-truth layer for AI coding agents.**

Subhead:

> HARIKOS keeps Codex, Claude Code, Cursor, Hermes, and other agents aligned on what is actually true about your project—using evidence, temporal history, contradiction detection, and task-specific context.

---

## Web app

Eventually:

```text
app.harikos.ai
```

But for MVP:

```text
localhost
```

is enough.

The web app becomes the human control center.

---

# 42. Prerequisites and Skills Required

The product is buildable as an MVP, but the durable version requires real systems work.

## Highest priority

### TypeScript / backend architecture

Need to become comfortable with:

- packages,
- typed APIs,
- async flows,
- testing,
- error handling,
- service boundaries.

### MCP

Understand:

- servers,
- tools,
- resources,
- local transports,
- client configuration.

### Git

Understand:

- commits,
- branches,
- diffs,
- history,
- renames,
- working tree,
- repository root.

### Relational data modeling

Especially:

- claims,
- evidence,
- events,
- time validity,
- relationships.

### Temporal modeling

Understand:

- current state,
- historical state,
- valid_from,
- valid_to,
- supersession.

### Retrieval

Understand:

- full-text search,
- structured retrieval,
- embeddings later,
- hybrid ranking,
- context selection.

### LLM structured extraction

Need:

- schema-constrained outputs,
- validation,
- retries,
- confidence,
- hallucination handling.

### Evaluation

Critical.

Need to learn how to measure:

- truth correctness,
- retrieval quality,
- stale context,
- agent outcomes.

---

## Later

- AST parsing
- static analysis
- Postgres
- vector search
- graph modeling
- cloud architecture
- observability
- security
- team RBAC
- policy engines

---

# 43. Complexity

## Visual demo

**5/10**

A basic scan + claims + dashboard is straightforward.

---

## Real MVP

**7/10**

The difficulty comes from:

- evidence,
- contradiction handling,
- supersession,
- context selection,
- agent integration.

---

## Reliable production product

**9/10**

The hard problems are not frontend.

They are:

- determining what is authoritative,
- avoiding false canonical truth,
- modeling migration states,
- keeping retrieval current,
- correctly interpreting project changes,
- handling ambiguous scope,
- evaluating whether context helped,
- and maintaining trust over months of project evolution.

That difficulty is strategically useful because it creates room for technical differentiation.

---

# 44. Risks

## Platform risk

Codex, Claude Code, Cursor, etc. may improve native memory.

Response:

HARIKOS should own **cross-agent, vendor-neutral project truth**, not a single-agent feature.

---

## Competition

Agent memory is already crowded.

Response:

Do not build generic memory.

Own:

- verification,
- provenance,
- canonical truth,
- temporal state,
- contradiction resolution,
- evaluation.

---

## False truth

HARIKOS may confidently canonicalize a wrong claim.

Response:

- evidence,
- confidence,
- uncertainty,
- human review,
- claim-type-aware authority,
- deterministic verification.

---

## Too much scope

The long-term runtime vision is huge.

Response:

MVP ends at:

```text
scan → claims → verify → supersede → MCP → context
```

---

## Expensive inference

Future repo analysis could cost money.

Response:

- deterministic parsing first,
- selective AI calls,
- local models,
- caching,
- source hashing,
- only rescan changed material.

---

## Privacy

Developers may not want proprietary code uploaded.

Response:

local-first design and minimal/optional cloud inference.

---

# 45. Performance and Cost Design

HARIKOS should not repeatedly analyze unchanged sources.

Each source gets a content hash.

Flow:

```text
scan file
  ↓
hash
  ↓
same as previous?
  ├── yes → skip
  └── no  → process
```

This reduces:

- latency,
- inference calls,
- cost,
- duplicate claims.

Git can further narrow changed files.

---

# 46. Source Authority: Initial Heuristic

This should be treated as an evolving policy.

Possible initial score components:

```text
authority_score =
  source_type_weight
+ recency_weight
+ corroboration_weight
+ execution_evidence_weight
+ explicit_human_weight
- contradiction_penalty
- stale_penalty
```

Do not treat confidence as pure LLM self-reported confidence.

Confidence should be based on observable evidence.

Example:

```text
Clerk installed only:
medium

Clerk installed + middleware active:
high

Clerk installed + middleware + tests + migration commit:
very high
```

---

# 47. Human Overrides

Developers need the ability to say:

```text
This is the intended truth.
```

But human truth should still preserve source/history.

Example:

```text
Developer decision:
"We are migrating to Prisma, but Drizzle remains active until migration finishes."
```

HARIKOS can represent:

```text
Active ORM:
Drizzle

Target ORM:
Prisma

Migration:
in progress
```

This is better than falsely choosing one value.

---

# 48. Scope-Aware Truth

Some “contradictions” are actually scope differences.

Example:

```text
Frontend framework = Next.js
Docs site framework = Astro
```

Both are true.

Claims need optional scope.

Example:

```text
subject: framework
value: Next.js
scope: apps/web
```

This becomes important quickly in monorepos.

MVP can support a simple scope field even if the first UI barely uses it.

---

# 49. Truth vs Intent

HARIKOS should distinguish:

## Current implementation

What the code actually does.

## Intended architecture

What the developer/team has decided should happen.

Example:

```text
Current auth:
Firebase

Target auth:
Clerk

Migration status:
planned
```

If HARIKOS collapses intention and implementation into one value, it creates dangerous false truth.

This distinction should be part of the data model or claim metadata.

---

# 50. Truth vs Observation vs Inference

Every claim should eventually have an epistemic type.

Possible:

### Observed

Directly established.

> `drizzle.config.ts` exists.

### Derived

Deterministically inferred.

> Project uses Drizzle tooling.

### Inferred

LLM or heuristic interpretation.

> Drizzle is the primary ORM.

### Declared

Explicit developer/team statement.

> Team intends to migrate to Prisma.

This makes the system more trustworthy.

---

# 51. Memory Write Policy

Not every agent message deserves storage.

Candidate memory should answer:

> Is this likely to reduce future repeated work or preserve important project context?

Strong memories:

- architecture decision,
- failed approach,
- root cause,
- important constraint,
- project preference,
- migration outcome,
- known incident.

Weak memories:

- routine code edit,
- generic explanation,
- temporary thought,
- obvious fact already in source.

HARIKOS should avoid becoming a heap.

---

# 52. Memory Lifecycle

Long-term memory states could include:

- active,
- historical,
- superseded,
- duplicate,
- invalidated,
- archived.

Memory and truth may interact, but remain separate concepts.

---

# 53. Agent Session Capture

Future agent session capture should not store everything verbatim by default.

Potential pipeline:

```text
agent session
    ↓
important events
    ↓
candidate memories
    ↓
decisions / failures / outcomes
    ↓
verification if factual
    ↓
store
```

This keeps the system useful.

---

# 54. Agent Handoff

One powerful workflow:

```text
Claude Code works for 2 hours
        ↓
HARIKOS records:
- decisions
- changes
- failed attempts
- unresolved issue
        ↓
Codex starts fresh
        ↓
get_context_pack(task)
        ↓
Codex continues
```

The developer should not manually write a huge handoff prompt.

---

# 55. Long-Term Action Gateway

This is not MVP scope but informs architecture.

Example:

```text
Codex:
"I need to run a production migration."

HARIKOS:
High-risk action.

Action:
database migration

Evidence:
migration generated from commit abc123

Potential impact:
18,392 rows

Policy:
Production DB changes require approval.

[Approve]
[Modify]
[Reject]
```

If HARIKOS already owns project truth, it becomes a natural place to reason about action context.

---

# 56. Long-Term Runtime Thesis

The eventual company-level technical thesis is larger than memory.

An autonomous agent needs to:

1. know,
2. understand,
3. decide,
4. act,
5. observe the outcome,
6. remember,
7. update truth.

HARIKOS can eventually participate in this loop:

```text
Truth
  ↓
Context
  ↓
Agent
  ↓
Policy
  ↓
Action
  ↓
Outcome
  ↓
Memory
  ↓
Truth update
```

The project-truth MVP is the first practical wedge into that runtime.

---

# 57. Why Open Source Matters

HARIKOS AI’s natural audience lives around:

- GitHub,
- Discord,
- Reddit,
- developer forums,
- AI coding-agent communities.

A local/open-core component can:

- reduce adoption friction,
- build trust around source-code privacy,
- encourage integrations,
- create community contributors,
- make the product easy to demo,
- and create an ecosystem around HARIKOS.

The open-source boundary does not need to be decided permanently in the MVP.

But local-first architecture should preserve the option.

---

# 58. Initial Marketing Strategy

Do not begin with broad paid marketing.

Use technical proof.

## Demo content

### Demo A

> Claude says Firebase. Repo says Clerk. Who is right?

### Demo B

> I made Codex know what Claude Code changed yesterday.

### Demo C

> AI memory is useless if it remembers things that stopped being true.

### Demo D

> Switching between Codex and Claude Code without a handoff prompt.

### Demo E

> Why vector memory is not enough for coding agents.

---

# 59. Early Community Validation

After the MVP works:

1. share demo with coding-agent communities,
2. recruit 5–20 technical users,
3. observe installation friction,
4. watch actual context failures,
5. ask users to show HARIKOS where it is wrong,
6. use those failures to build the evaluation suite.

Signals that matter more than likes:

- users install it,
- users keep it enabled,
- users connect multiple agents,
- users submit issues,
- users ask for team/cloud sync,
- users rely on context packs,
- users report reduced repeated explanations,
- users contribute integrations.

---

# 60. Product Quality Bar

HARIKOS should feel like developer infrastructure.

Properties:

- fast,
- inspectable,
- deterministic where possible,
- boring when it should be boring,
- explicit about uncertainty,
- easy to uninstall,
- easy to reset,
- local by default,
- no fake AI theatrics.

If HARIKOS does not know, it should say:

> **Uncertain.**

That is better than inventing certainty.

---

# 61. Final MVP Definition

The MVP is complete when this exact story works:

1. Developer initializes a repository with HARIKOS.
2. HARIKOS scans the repository.
3. HARIKOS establishes:
   - framework,
   - database,
   - ORM,
   - authentication,
   - selected architectural facts.
4. Each claim exposes evidence.
5. HARIKOS remembers a few explicit decisions/failures.
6. An old fact exists:
   - authentication = Firebase.
7. The repository is migrated to Clerk.
8. HARIKOS detects new evidence.
9. HARIKOS marks:
   - Firebase = superseded,
   - Clerk = current.
10. Historical Firebase information remains available.
11. Fresh Codex connects through MCP.
12. Codex asks for project authentication context.
13. HARIKOS returns Clerk as current, with provenance.
14. Codex can also ask what changed and learn Firebase was previously used.
15. The web app visually shows the transition.
16. A developer watching the demo immediately understands why HARIKOS is different from generic memory.

---

# 62. Final Product Definition

HARIKOS AI is **not**:

- a notes app,
- a Notion clone,
- a generic RAG wrapper,
- a vector database,
- an AI chatbot,
- a Claude-only memory plugin,
- a Codex-only memory plugin,
- or a giant life OS.

HARIKOS AI is:

> **A persistent, evidence-backed project-truth and context layer for AI coding agents across the developer workflow.**

It continuously turns project activity into structured knowledge about:

- what is true,
- what was true,
- what changed,
- why HARIKOS believes it,
- what failed,
- what was decided,
- what is uncertain,
- and what the next agent needs to know.

The long-term ambition is for HARIKOS AI to become the infrastructure layer that lets autonomous software agents maintain reliable state, share context, act under policy, and improve through persistent verified history.

The first product promise remains simple:

> **Give every coding agent the same verified understanding of your project.**
