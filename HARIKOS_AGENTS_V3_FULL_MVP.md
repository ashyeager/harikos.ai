# AGENTS.md — HARIKOS AI Repository Instructions

**Version:** V3 — Full-Stack MVP Lock  
**Date:** August 24, 2026

These instructions apply to Codex, Claude Code, Cursor, Hermes, Copilot agents, and any other coding agent working inside the HARIKOS repository.

---

# 1. Read First

Before meaningful product/architecture work, read:

1. `docs/harikos_ai_prd.md`
2. `docs/ARCHITECTURE.md`
3. `docs/BUILD_STATE.md` if present
4. relevant `docs/adr/*`

These documents define the current product.

Older documents describing:

- local-first as the main product;
- SQLite as the SaaS database;
- no auth;
- no billing;
- memory later;
- agent integration later;
- CLI/MCP as the primary UX;
- Project Truth dashboard as the entire product;

are superseded.

---

# 2. Product Definition

HARIKOS is:

> **A shared, continuously verified project brain for AI coding agents and AI-native builders.**

Marketing core:

> **Build fast with AI. HARIKOS keeps the project straight.**

Supporting:

> **One shared, continuously verified project brain for Codex, Claude, Cursor, and you.**

Optional punch line:

> **Vibe code without losing the plot.**

HARIKOS combines:

```text
TRUTH
MEMORY
CONTEXT
AGENT BRIDGE
```

Project Truth is the verification layer, not the entire product.

---

# 3. MVP Means a Real SaaS

The MVP is not complete until the real loop works:

```text
login
→ entitlement
→ GitHub
→ repo
→ scan
→ Truth/Evidence
→ persistent Memory
→ agent connection
→ Context
→ agent write-back
→ persisted history
→ billing
```

No demo-only dashboard counts as completion.

---

# 4. Reality-Only Rule

Never fabricate or hard-code production state.

Do not ship:

- fake repositories;
- fake scans;
- fake connected agents;
- fake memories;
- fake customers;
- fake metrics;
- fake billing;
- dead CTA buttons;
- pretend integrations;
- success states without backend success.

Production UI must render:

```text
REAL DATA
or
HONEST EMPTY / LOADING / ERROR STATE
```

Fixtures belong in tests/dev isolation only.

---

# 5. Core Domain Invariants

## Truth != Memory

Memory records what happened.

Truth represents what is currently supported by project evidence.

## Evidence

Important verified claims must be inspectable.

## Temporal Truth

Preserve current and historical state.

## Contradictions

Do not flatten conflicting evidence.

## Agent claims are not authority

`record_memory("we use X")` does not mean Truth becomes X.

## Deterministic first

Use source/config/Git/tests for deterministic facts before LLM inference.

## Agent-neutral

Do not bind HARIKOS to one coding agent.

## Minimal useful context

Do not dump the entire project brain into every task.

---

# 6. Memory Is MVP

Memory is no longer a later roadmap feature.

MVP memory types:

```text
decision
attempt
failed_attempt
fix
bug
root_cause
constraint
discovery
outcome
incident
note
```

Memory must persist across browser sessions and agent sessions.

Agent memory can be:

```text
active
superseded
archived
```

Do not build sophisticated decay/consolidation yet.

---

# 7. Agent Bridge Is MVP

Remote agent connection is no longer “later.”

Implement/use one agent-neutral Remote MCP bridge.

Users must be able to:

```text
create token
→ configure coding agent
→ agent calls HARIKOS
→ retrieve Truth/Memory/Context
→ record Memory/Outcome
→ revoke token
```

Never display a created secret token again after initial creation.

Store secure token hash/prefix where practical.

---

# 8. MVP MCP Tools

Maintain real tools equivalent to:

```text
get_project_truth
search_project_memory
get_recent_changes
get_context_pack
record_memory
record_outcome
check_assumption
```

If existing Phase 1 tools already cover these semantics, adapt/reuse rather than duplicate.

---

# 9. Authentication Is MVP

Preferred:

> Supabase Auth.

Required:

- GitHub social login;
- persistent session;
- protected routes;
- logout;
- server authorization;
- user/profile row.

Do not confuse GitHub social login with GitHub App repository access.

---

# 10. PostgreSQL Is MVP

Main SaaS state:

> Supabase PostgreSQL.

Persist:

```text
users/profile
billing
projects
repositories
installations
scans
claims
evidence
contradictions
memories
changes
contexts
agent connections
agent sessions
outcomes
usage
```

SQLite may remain for tests/legacy tools only.

---

# 11. GitHub Is MVP

Preferred repository integration:

> GitHub App.

Use minimum permissions.

Never require ordinary users to paste PATs.

Use `RepositorySource`.

Truth Engine must not directly depend on Octokit/GitHub internals.

---

# 12. Billing Is MVP

Billing is no longer a non-goal.

Implement:

```text
Free
Pro ($15/month initial hypothesis)
```

Use:

- Stripe Checkout;
- signed Stripe webhooks;
- Customer Portal;
- centralized entitlements.

Do not grant paid features from client redirect state.

Stripe billing state is authoritative.

---

# 13. Centralized Entitlements

Keep plan/limits in one domain module.

Do not scatter plan checks.

Initial recommended Free limits:

```text
1 repo
1 agent connection
250 memories/project
25 context packs/month
```

Initial Pro:

```text
up to 5 repos
up to 5 agents
higher memory/context limits
```

Pricing/limits must be changeable without rewriting the product.

---

# 14. Preserve Existing Working Code

Before replacing code, inspect it.

Prefer:

```text
reuse
adapt
wrap
migrate incrementally
```

over:

```text
delete and regenerate
```

Preserve good Phase 1 work:

- scanner;
- parsers;
- claims/evidence;
- Truth Resolver;
- contradictions;
- supersession;
- memory;
- context;
- MCP;
- fixtures;
- tests.

---

# 15. Product Routes

Public:

```text
/
pricing
auth
```

Authenticated:

```text
/app/dashboard
/app/projects
/app/project/[id]
/app/project/[id]/truth
/app/project/[id]/memory
/app/project/[id]/changes
/app/project/[id]/agents
/app/project/[id]/understand
/app/project/[id]/context
/app/settings/profile
/app/settings/billing
/app/settings/security
```

Routes may follow current repository conventions while preserving product semantics.

---

# 16. Frontend During Functional Lock

Do not burn engineering time on visual spectacle while the core flow is incomplete.

Frontend in this phase must be:

- usable;
- honest;
- wired to real data;
- accessible;
- not broken.

Do not do a massive visual redesign unless explicitly requested after the functional MVP lock.

---

# 17. GitHub Repository Rules

Production repo access:

- GitHub App;
- server-side installation tokens;
- selected repositories;
- no permanent installation token storage;
- minimum permissions;
- authorization to current user.

GitHub webhook updates should be verified by signature.

If automatic updates are not actually configured, the UI says “Last scanned,” not “continuously monitored.”

---

# 18. Repository Data Policy

Default:

```text
GitHub
→ fetch relevant files
→ analyze
→ derive structured knowledge
→ discard unnecessary raw source
```

Never ingest live:

```text
.env
private keys
tokens
credentials
```

Do not make privacy claims beyond reality.

---

# 19. Billing Security

Never:

- trust Checkout success query params as entitlement;
- expose Stripe secret key;
- skip webhook signature verification;
- directly trust client-selected plan state.

Billing webhook handling should be idempotent.

---

# 20. Agent Token Security

Agent tokens:

- high entropy;
- scoped;
- revocable;
- stored hashed where practical;
- only plaintext once;
- never committed/logged.

MCP tools verify project authorization before returning data.

---

# 21. Supabase Security

Use current SSR patterns.

Use RLS/permissions where appropriate.

Never expose service-role key client-side.

Never create permissive policies for private user/project data just to make development easier.

---

# 22. No Overengineering

Do not add:

- Kubernetes;
- Kafka;
- Neo4j;
- Elasticsearch;
- giant vector DB;
- microservices;
- complex queues;
- full enterprise RBAC;
- multi-region architecture;

for the MVP.

One coherent full-stack application is preferred.

---

# 23. Open Source Augmentation Comes After Functional Lock

Do not start the larger Tree-sitter/Aider/CodeGraph/projectmem/Qarinah/Mem0 augmentation until the base SaaS loop works and is committed.

First establish a real baseline.

Then measure OSS improvements against it.

---

# 24. Required Functional Tests

At minimum test:

## Auth
- login;
- logout;
- route protection;
- ownership.

## Billing
- webhook-derived entitlement;
- Free/Pro gating;
- portal boundary.

## GitHub
- installation/repo listing;
- real repository analysis.

## Truth
- claim/evidence persistence;
- Clerk → Supabase supersession.

## Memory
- create/persist/retrieve;
- relevant memory in Context.

## Agents
- create token;
- MCP request works;
- record memory;
- revoke token rejects.

## Handoff
- Agent A writes decision/failure/outcome;
- Agent B receives relevant context.

---

# 25. Git Safety

Before meaningful changes:

```text
git status
git branch
git diff
```

Never without explicit approval:

```bash
git reset --hard
git clean -fd
git push --force
```

Preserve uncommitted work.

---

# 26. Secret Safety

Never commit:

```text
.env
.env.local
Supabase secrets
Stripe secrets
GitHub private key
webhook secrets
agent tokens
AI API keys
```

Maintain `.env.example` with names only.

---

# 27. Documentation

Keep aligned:

```text
AGENTS.md
docs/harikos_ai_prd.md
docs/ARCHITECTURE.md
docs/BUILD_STATE.md
docs/adr/*
```

Do not leave old docs claiming Billing/Memory/Agents are “later.”

---

# 28. Builder-With-Intent

For major architecture changes report briefly:

```text
what changed
why
files
data flow
trade-off
```

Do not hide important architectural decisions behind generated code.

---

# 29. Current Execution Priority

```text
1. inspect what is actually real
2. fix auth
3. fix Postgres persistence
4. verify GitHub real repo flow
5. verify Project Truth
6. implement/persist Memory
7. implement remote MCP agent connection
8. implement Truth+Memory Context
9. implement agent write-back/session/outcome
10. implement Stripe subscription
11. remove fake/dead production states
12. browser/integration/security tests
13. clean build
14. push validated state
15. frontend overhaul afterward
```

Do not rebuild working steps.

---

# 30. North Star

A real user should be able to:

```text
Sign in.

Connect GitHub.

HARIKOS understands the project.

Connect Codex/Claude/Cursor.

The agent remembers previous decisions and failures.

HARIKOS checks current project facts against the code.

The next agent receives current, relevant context.

The user can inspect and control that memory.

The user can pay for the product.
```

That is the MVP.
