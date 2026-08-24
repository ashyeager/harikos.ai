# HARIKOS AI — Product Requirements Document

**Canonical path:** `docs/harikos_ai_prd.md`  
**Version:** V3 — Full-Stack MVP Lock  
**Date:** August 24, 2026  
**Company:** HARIKOS  
**Product:** HARIKOS AI  
**Model:** Cloud-first subscription SaaS  
**Architecture:** See `docs/ARCHITECTURE.md`

---

# 1. Product Definition

HARIKOS AI is a **shared, continuously verified project brain for AI coding agents and AI-native builders**.

It gives a software project persistent memory across coding agents and sessions, while continuously separating:

- what happened before,
- what is true now,
- why HARIKOS believes it,
- what changed,
- and what an agent needs to know for the current task.

The product exists because AI-native builders can ship software quickly without understanding every file, subsystem, decision, failed attempt, or architectural transition. Their agents also forget these things between sessions and tools.

HARIKOS makes that complexity simple.

## Primary product promise

> **Build fast with AI. HARIKOS keeps the project straight.**

## Primary supporting line

> **One shared, continuously verified project brain for Codex, Claude, Cursor, and you.**

## Strong secondary line

> **Vibe code without losing the plot.**

Use “AI-native builders” as the default formal market category. “Vibe code without losing the plot” may be used as punchier marketing language without insulting or talking down to users.

---

# 2. Product Truth Is the Verification Layer, Not the Whole Product

The previous direction over-emphasized Project Truth as the complete product.

Project Truth remains essential, but HARIKOS is now understood as four connected systems:

```text
HARIKOS PROJECT BRAIN

TRUTH
What is true now?

MEMORY
What happened before?

CONTEXT
What matters for this task?

AGENT BRIDGE
How agents read from and write to HARIKOS.
```

Evidence, contradiction handling, temporal history, and drift keep the brain trustworthy.

The full loop is:

```text
Repository + agent activity
        ↓
Evidence + events
        ↓
Truth + Memory
        ↓
Task Context
        ↓
Coding Agent
        ↓
Decision / attempt / outcome
        ↓
Memory
        ↓
Repository changes
        ↓
Reverification
```

That loop is the product.

---

# 3. Core Problem

AI coding agents and AI-native builders repeatedly suffer from:

- context loss across sessions;
- different agents holding different project assumptions;
- repeated failed approaches;
- stale instructions;
- outdated architecture knowledge;
- duplicate implementation;
- forgotten decisions and constraints;
- lack of understanding of AI-generated code;
- unnecessary repo exploration;
- human users repeatedly explaining the project;
- agent memories being treated as truth even after the code changes.

HARIKOS solves this by maintaining a persistent project brain whose current-state claims are verified against real project evidence.

---

# 4. Core Concepts

## 4.1 Truth

A structured claim about the project that HARIKOS currently believes is supported by evidence.

Example:

```text
Authentication
Supabase Auth

VERIFIED
confidence: 0.98

Evidence:
middleware.ts
lib/supabase/server.ts
package.json

Verified against:
commit c2137fb
```

Truth supports:

- provenance;
- confidence;
- scope;
- temporal validity;
- supersession;
- contradiction;
- uncertainty.

---

## 4.2 Memory

Historical project knowledge that remains useful across sessions and agents.

MVP memory types:

- decision;
- attempt;
- failed_attempt;
- fix;
- bug;
- root_cause;
- constraint;
- discovery;
- outcome;
- incident;
- note.

Example:

```text
FAILED ATTEMPT

Task:
Add Stripe subscriptions

Attempt:
Create subscription directly from the browser.

Outcome:
Failed.

Reason:
Required privileged Stripe credentials.

Decision:
Keep subscription creation server-side.
```

Memory is persistent.

Memory is not automatically current Truth.

---

## 4.3 Evidence

Evidence explains why HARIKOS believes a claim.

Possible evidence:

- source code;
- configuration;
- package manifests;
- database schema;
- tests;
- Git commits/diffs;
- deployment configuration;
- maintained project docs;
- explicit approved decisions;
- agent session events.

Verified claims should be inspectable and traceable.

---

## 4.4 Context

Context is the smallest useful package of current Truth + relevant Memory + recent Changes + relevant files/constraints needed for a task.

Example:

```text
TASK
Add Google OAuth

CURRENT TRUTH
Authentication: Supabase Auth
Framework: Next.js App Router

RELEVANT FILES
middleware.ts
app/auth/callback/route.ts
lib/supabase/server.ts

CONSTRAINT
Service-role credentials stay server-side.

RECENT CHANGE
Authentication migrated from Clerk.

RELEVANT MEMORY
Previous OAuth callback failure was caused by an invalid redirect URI.
```

HARIKOS optimizes for **minimum useful context** rather than maximum context.

---

## 4.5 Agent Session

A record of an agent working on a project.

Examples:

- Codex — “Add subscription billing”
- Claude Code — “Fix OAuth callback”
- Cursor — “Refactor database access”

An AgentSession may produce:

- memories;
- decisions;
- attempts;
- outcomes;
- related file references;
- task context requests.

---

# 5. The HARIKOS Rule

Generic memory asks:

> What did we remember?

HARIKOS asks:

> **Is what we remember still true?**

Example:

```text
Memory:
"We use Clerk."

Current repository:
Supabase middleware + Supabase server client.
```

HARIKOS:

```text
Supabase Auth
VERIFIED
CURRENT

Clerk
SUPERSEDED
HISTORICAL
```

If README still claims Clerk:

```text
README.md
CONTRADICTED / STALE
```

Agent memory may inform candidate claims.

Agent memory never grants itself authority over Project Truth.

---

# 6. Target User

Primary category:

> **AI-native builders**

Including:

- founder-builders;
- indie hackers;
- junior developers;
- technical creators;
- designers building with AI;
- small startup teams;
- users of Codex, Claude Code, Cursor and similar tools;
- builders who can ship software with AI faster than they can manually understand every subsystem.

HARIKOS should make technically complex project state understandable without requiring senior-engineer-level familiarity with the repository.

---

# 7. Jobs To Be Done

1. Remember important project decisions across AI sessions.
2. Remember failed attempts so agents do not repeat them.
3. Keep important architecture facts current.
4. Explain why HARIKOS believes an important fact.
5. Let different coding agents inherit the same project memory.
6. Warn agents when old memory conflicts with current code.
7. Tell an agent what already exists before it builds.
8. Give builders a clear view of their AI-built software.
9. Track meaningful project changes over time.
10. Let users own and inspect all stored project knowledge.

---

# 8. MVP Product Loop

The MVP must support this real end-to-end loop:

```text
Create account / sign in
        ↓
Free or Pro entitlement
        ↓
Connect GitHub
        ↓
Select repository
        ↓
Analyze repository
        ↓
Build Project Truth
        ↓
Persist Truth + Evidence + Memory + Changes
        ↓
Connect coding agent
        ↓
Agent requests task context
        ↓
Agent reads Truth + relevant Memory
        ↓
Agent records decisions / attempts / outcomes
        ↓
HARIKOS stores memory
        ↓
Repository changes
        ↓
HARIKOS scans/reverifies
        ↓
Old Truth can become superseded/stale
        ↓
Next agent receives current context
```

If this loop does not work, the MVP is not complete.

---

# 9. No-Fluff Product Rule

HARIKOS must never pretend functionality exists.

The production app must not contain:

- fake repository data when a real repo is connected;
- fake agent connections;
- fake scan results;
- fake memories;
- fake usage metrics;
- fake customers;
- fake testimonials;
- fake security certifications;
- dead buttons that imply functionality;
- “live” indicators backed only by hard-coded data;
- marketing claims for features not implemented.

Development fixtures are allowed only in isolated development/test/demo modes that are clearly separate from real user state.

The real app defaults to real data or honest empty states.

---

# 10. Account and Authentication

Authentication is part of the MVP.

Preferred MVP stack:

> Supabase Auth.

Required user capabilities:

- sign up / sign in;
- GitHub social login;
- authenticated session;
- logout;
- protected application routes;
- persistent user/profile row;
- secure user/project authorization.

GitHub social login identifies the user.

GitHub App installation authorizes repository access.

These are separate concepts.

---

# 11. SaaS Data Persistence

Supabase PostgreSQL is the main SaaS persistence layer.

The MVP stores:

- user/profile;
- subscription entitlement;
- projects;
- GitHub repositories/installations;
- scans;
- claims;
- evidence;
- contradictions;
- memories;
- project changes;
- context packs;
- agent connections/tokens;
- agent sessions;
- outcomes.

Refreshing the browser or returning tomorrow must not destroy project state.

---

# 12. Subscription Model

HARIKOS is subscription software.

Use Stripe Billing.

## Free

Initial MVP entitlement:

- 1 connected repository;
- 1 active agent connection;
- Project Truth;
- evidence;
- manual scans;
- memory up to a defined product limit;
- Context Packs up to a defined product limit.

Recommended initial implementation limits:

```text
repos: 1
agent connections: 1
memories: 250 per project
context packs: 25 per month
```

Limits can be changed centrally later.

## Pro

Initial launch hypothesis:

> **$15/month**

Recommended entitlement:

```text
repos: up to 5
agent connections: up to 5
memories: substantially higher practical limit
context packs: substantially higher practical limit
full project history
```

Do not hard-code business logic throughout the app.

Use a centralized entitlement/config model.

Stripe price IDs come from environment configuration.

## Required billing functionality

- pricing page/section;
- upgrade button;
- Stripe-hosted subscription Checkout;
- Stripe Customer record;
- webhook-driven subscription state;
- current plan stored/derived safely;
- Customer Portal;
- cancel/manage subscription;
- feature limits based on real entitlement;
- billing page in Settings.

The client must not grant Pro access simply because Checkout redirected successfully.

Stripe/webhook state is authoritative for paid entitlement.

---

# 13. GitHub Repository Connection

GitHub repository connection is a core MVP feature.

Preferred production mechanism:

> GitHub App.

Initial minimum permissions:

```text
Contents: Read
Metadata: Read
```

Required flow:

```text
authenticated user
→ install/authorize HARIKOS GitHub App
→ select allowed repository
→ save installation/repository metadata
→ create HARIKOS Project
→ analyze repository
```

Never require normal users to paste Personal Access Tokens.

Installation tokens remain server-side and temporary.

---

# 14. Repository Analysis

The first-class MVP target is modern JavaScript/TypeScript web repositories.

Pipeline:

```text
RepositorySource
→ tree
→ ignore/filter
→ prioritize high-signal files
→ deterministic analysis
→ AI interpretation where useful
→ candidate claims
→ evidence
→ Truth Resolver
```

Never blindly send the entire repository to an LLM.

Never ingest live secrets from:

- `.env`;
- credentials;
- private keys;
- tokens;
- secret stores.

---

# 15. Project Truth

Project Truth remains the verification layer of HARIKOS.

Initial categories:

- Stack;
- Architecture;
- Authentication;
- Database;
- ORM;
- API;
- Deployment;
- Payments;
- Testing;
- Infrastructure;
- Conventions.

Truth states:

- VERIFIED;
- LIKELY;
- UNCERTAIN;
- CONTRADICTED;
- STALE;
- SUPERSEDED;
- REJECTED.

Truth should expose evidence and last verification state.

---

# 16. Memory

Memory is now an MVP pillar, not a later roadmap item.

Memory can enter HARIKOS through:

- agent `record_memory`;
- agent session outcome;
- explicit user entry;
- system-derived project events;
- selected Git/project changes.

Memory record should support conceptually:

```text
id
project_id
type
title
content
source
source_agent
agent_session_id
status
importance
created_at
updated_at
related_files
related_claims
metadata
```

MVP lifecycle states can remain simple:

```text
active
superseded
archived
```

Do not build complex decay/consolidation yet.

---

# 17. Agent Connection

Agent connection is part of the MVP.

HARIKOS must provide one real agent-neutral bridge.

Preferred MVP mechanism:

> **Remote MCP over HTTP using revocable project/user-scoped HARIKOS agent tokens.**

The app should allow a user to:

1. open Agents;
2. create an agent connection/token;
3. name it, e.g. “Codex laptop”;
4. copy configuration instructions;
5. connect a supported MCP client;
6. see last-used/connected activity where measurable;
7. revoke the token.

Store only a secure hash of agent tokens where practical.

Never display an existing secret token again after creation.

## Initial MCP tools

At minimum:

### `get_project_truth`

Returns current relevant truth and evidence summary.

### `search_project_memory`

Searches decisions, attempts, failures, fixes, constraints and outcomes.

### `get_recent_changes`

Returns meaningful recent semantic changes.

### `get_context_pack`

Input: task.

Returns current task-specific context.

### `record_memory`

Allows an agent to record a decision, attempt, failed attempt, fix, constraint, discovery, outcome or note.

Does not grant authority to alter Truth.

### `record_outcome`

Records an AgentSession/task outcome.

### `check_assumption`

Input: statement/assumption.

HARIKOS returns whether current Truth/evidence supports, contradicts or cannot verify it.

These tools may be refined if existing Phase 1 MCP already has strong equivalents.

---

# 18. Agent Connection UX

Product route:

```text
/app/project/[id]/agents
```

Show:

- active connections;
- token name;
- client type if supplied;
- created date;
- last used;
- revoke;
- Add Agent.

“Add Agent” should provide practical connection instructions for supported clients where known.

Do not claim a client is connected until HARIKOS receives a real authenticated request from that token.

---

# 19. Agent Session / Outcome

MVP needs basic agent activity persistence.

Conceptually:

```text
AgentSession
id
project_id
agent_connection_id
task
started_at
ended_at
status
metadata
```

Outcome:

```text
Outcome
id
agent_session_id
summary
status
created_at
metadata
```

HARIKOS does not need to record every token or full private transcript.

It needs structured useful project history.

---

# 20. Context Engine

Context generation combines:

```text
Task
↓
Current verified Truth
↓
Relevant files/evidence
↓
Recent project changes
↓
Constraints
↓
Decisions
↓
Failed attempts
↓
Fixes/outcomes
↓
Token/relevance budget
↓
Context Pack
```

The result must be:

- current;
- compact;
- explainable;
- relevant;
- traceable;
- free of obvious superseded facts.

---

# 21. Before You Build

This becomes the human-facing form of context preflight.

Example:

```text
TASK
Add subscriptions

BEFORE YOU BUILD

✓ Stripe is already installed.
✓ A webhook route already exists.
✓ Authentication uses Supabase.
✓ Users are stored in profiles.
⚠ No subscription_status field exists.
⚠ A previous client-side subscription attempt failed.
✓ Billing should remain server-side.
```

Action:

> Prepare Agent Context

The data must come from real project state/memory.

---

# 22. Project Changes / Drift

Meaningful changes are persisted.

Example:

```text
Authentication changed

Clerk
→
Supabase Auth

Related Truth:
3 updated

Memory:
Migration decision recorded

Attention:
README.md still references Clerk
```

If automatic GitHub push processing is configured, HARIKOS should use it.

If only manual scan is available, the UI must say “Last scanned” and must not claim continuous monitoring.

---

# 23. Product Information Architecture

Public:

```text
/
pricing
login / auth
```

Authenticated global:

```text
/app/dashboard
/app/projects
/app/settings
```

Project:

```text
/app/project/[id]
/app/project/[id]/truth
/app/project/[id]/memory
/app/project/[id]/changes
/app/project/[id]/agents
/app/project/[id]/understand
/app/project/[id]/context
```

Settings:

```text
/app/settings/profile
/app/settings/billing
/app/settings/security
```

---

# 24. Dashboard

Dashboard is not a fake analytics surface.

It should summarize real project brain state:

- current projects;
- verified truths;
- memories;
- recent changes;
- connected agents;
- last scans;
- attention items;
- plan/entitlement.

Counts come from the database.

If there is no data, show an honest empty state.

---

# 25. Understand

Understand is a grounded human interface over the Project Brain.

Questions may include:

- How does authentication work?
- What changed recently?
- What database are we using?
- Why does HARIKOS believe that?
- What did we try before?
- What should I know before changing billing?

Answers are grounded in Truth + Memory + Evidence.

This is not generic repo chat.

---

# 26. Security / Privacy

MVP baseline:

- authenticated user ownership;
- project authorization;
- RLS/defense-in-depth where appropriate;
- Stripe webhook signature verification;
- GitHub webhook signature verification;
- project-scoped agent tokens;
- tokens stored hashed where possible;
- token revocation;
- secrets server-side;
- no service-role secret in browser;
- no permanent GitHub installation token storage;
- no raw `.env` secret ingestion;
- validated API inputs;
- safe rendering of repository content;
- no arbitrary repository code execution;
- minimum GitHub permissions.

Do not claim stronger privacy/retention guarantees than the implementation provides.

---

# 27. Source Retention

Desired default:

```text
GitHub
→ authorized temporary fetch
→ analyze relevant source
→ derive knowledge
→ discard unnecessary source
→ persist structured Truth/Memory/Evidence metadata
```

Prefer persisted:

- paths;
- hashes;
- commit SHAs;
- line ranges;
- claim/memory records.

Do not turn HARIKOS into a permanent full-code mirror by default.

---

# 28. MVP Technical Direction

- Next.js App Router;
- TypeScript;
- Node.js;
- pnpm;
- Tailwind/reusable UI system;
- Supabase Auth;
- Supabase PostgreSQL;
- Drizzle where compatible;
- GitHub App + Octokit;
- Stripe Billing;
- remote HTTP MCP;
- provider-agnostic AI interface;
- Zod;
- Vitest;
- Playwright;
- Vercel.

Legacy Phase 1 SQLite/CLI/local MCP may remain for tests/tools if useful.

---

# 29. Real MVP Acceptance Tests

## Account

- user can sign in;
- protected route requires session;
- logout works;
- project ownership is enforced.

## Billing

- free entitlement works;
- Checkout creates subscription;
- webhook updates subscription state;
- Pro entitlement is granted only from trusted billing state;
- Customer Portal works;
- cancellation/status change is reflected.

## GitHub

- user can authorize/install HARIKOS;
- real accessible repositories list;
- selected repo becomes a Project;
- repo content is fetched server-side.

## Project Truth

- real repo produces real claims/evidence;
- Truth persists;
- Truth Detail shows evidence.

## Temporal verification

Controlled Clerk → Supabase migration:

```text
Supabase VERIFIED
Clerk SUPERSEDED
stale README CONTRADICTED
```

## Memory

- user/agent can record a decision;
- failed attempt persists;
- memory survives refresh/session;
- memory appears in relevant Context Pack.

## Agent Bridge

- user creates agent token;
- MCP client successfully authenticates;
- `get_context_pack` returns project data;
- `record_memory` persists;
- revoked token fails.

## Agent handoff

Session A records:

```text
failed attempt
decision
outcome
```

Session B requests related context and receives the useful prior information.

That is the second flagship MVP test.

---

# 30. Pricing / Product Honesty

Initial launch hypothesis:

```text
FREE
1 repo
1 agent
limited memory/context

PRO
$15/month
up to 5 repos
up to 5 agent connections
higher memory/context limits
full usable project history
```

This is an initial commercial configuration and should be centrally configurable.

Do not invent enterprise pricing or features.

---

# 31. Marketing Rules

The marketing site sells only implemented capability.

Primary:

> **Build fast with AI. HARIKOS keeps the project straight.**

Supporting:

> **One shared, continuously verified project brain for Codex, Claude, Cursor, and you.**

Optional punch line:

> **Vibe code without losing the plot.**

Core narrative:

```text
REMEMBER
Decisions, failures, fixes and outcomes survive across agents.

VERIFY
HARIKOS checks current project facts against the code.

UNDERSTAND
See how your AI-built software actually works.

HAND OFF
Every coding agent can start with relevant project context.
```

No fake demonstrations on the production app.

Interactive UI may visualize real product concepts, but must not imply a live customer state that does not exist.

---

# 32. Explicit Non-Goals

Do not build in this MVP:

- enterprise SSO;
- organization/team RBAC;
- GitLab/Bitbucket;
- mobile app;
- desktop app;
- self-hosting;
- Kubernetes;
- Kafka;
- Neo4j;
- Elasticsearch;
- giant vector infrastructure;
- autonomous action gateway;
- autonomous code execution;
- full transcript surveillance;
- complex memory decay/consolidation;
- multi-repo reasoning;
- twenty agent-specific integrations.

One excellent GitHub integration + one agent-neutral MCP bridge is enough.

---

# 33. Current Build Priority

```text
1. Audit reality of current implementation
2. Authentication
3. PostgreSQL persistence
4. Real GitHub connection
5. Real repo scan
6. Project Truth + Evidence persistence
7. Memory persistence
8. Agent connection / remote MCP
9. Context from Truth + Memory
10. Agent write-back
11. Stripe subscription / entitlement
12. Honest dashboard/settings
13. End-to-end tests
14. Vercel-compatible production build
15. Push validated state
16. Frontend polish after functional lock
```

If some of these already work, verify rather than rewrite.

---

# 34. Definition of Done

HARIKOS MVP is done when a real new user can:

```text
sign in
→ connect GitHub
→ choose repo
→ analyze repo
→ inspect real Project Truth
→ inspect evidence
→ create persistent memory
→ connect a real MCP coding agent
→ ask that agent to retrieve project context
→ have the agent record a decision/outcome
→ see that memory in HARIKOS
→ return in another session and retrieve it
→ upgrade to Pro
→ manage subscription
```

And the system honestly distinguishes:

```text
what the agent remembered
from
what the repository currently proves.
```

That is HARIKOS.
