# HARIKOS AI — Architecture

**Canonical path:** `docs/ARCHITECTURE.md`  
**Version:** V3 — Full-Stack MVP Lock  
**Date:** August 24, 2026  
**Product source of truth:** `docs/harikos_ai_prd.md`

---

# 1. Architecture Goal

HARIKOS AI is a cloud-first subscription SaaS providing a **persistent, continuously verified project brain** for AI coding agents and builders.

The MVP must connect:

```text
User Identity
Billing Entitlement
GitHub Repository
Project Truth
Persistent Memory
Agent Bridge
Context Engine
```

into one real system.

---

# 2. High-Level System

```text
                         USER
                          │
                     Supabase Auth
                          │
                          ▼
                      HARIKOS WEB
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
      Stripe          GitHub App       Agent Bridge
      Billing             │             Remote MCP
          │               │                │
          │               ▼                ▼
          │         RepositorySource    Agent Tokens
          │               │                │
          │               ▼                │
          │       Repository Analysis      │
          │               │                │
          │         Candidate Claims       │
          │               │                │
          │            Evidence            │
          │               │                │
          │         Truth Resolver         │
          │               │                │
          │               ▼                │
          │          Project Truth         │
          │               │                │
          └───────────────┼────────────────┘
                          ▼
                   Supabase PostgreSQL
                          │
       ┌──────────────────┼────────────────────┐
       ▼                  ▼                    ▼
     Truth              Memory             Agent Sessions
       │                  │                    │
       └──────────────────┼────────────────────┘
                          ▼
                    Context Engine
                          │
                          ▼
                     Context Pack
                          │
                     Agent / Human
```

---

# 3. Architectural Invariants

1. Truth != Memory.
2. Memory is persistent and first-class.
3. Agent output never becomes Truth merely because an agent said it.
4. Evidence supports verified current claims.
5. Truth is temporal.
6. Contradictions are explicit.
7. Repository access is abstracted behind `RepositorySource`.
8. GitHub App is the main production repository source.
9. Supabase PostgreSQL is the main SaaS database.
10. Supabase Auth identifies users.
11. Stripe webhook state drives paid entitlement.
12. Remote MCP is the MVP agent-neutral integration.
13. Agent tokens are revocable and scoped.
14. Raw source retention is minimized.
15. Real functionality beats demo surfaces.
16. UI must not claim state that the backend cannot prove.

---

# 4. Stack

| Layer | MVP Direction |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Package manager | pnpm |
| Web | Next.js App Router |
| UI | Tailwind / existing component system |
| User Auth | Supabase Auth |
| Main DB | Supabase PostgreSQL |
| ORM | Reuse/adapt Drizzle |
| GitHub | GitHub App + Octokit |
| Billing | Stripe Billing / Checkout / Customer Portal |
| Agent Bridge | Remote MCP over HTTP |
| Agent Auth | Revocable HARIKOS bearer token, scoped to user/project |
| Validation | Zod |
| AI | Provider abstraction |
| Tests | Vitest |
| Browser QA | Playwright |
| Hosting | Vercel |
| Legacy local support | SQLite / local scanner / CLI if useful |

---

# 5. Canonical Data Flow

## User/account

```text
browser
→ Supabase Auth
→ session
→ HARIKOS user/profile
→ entitlement
```

## Repository

```text
user
→ GitHub App installation
→ repository selected
→ Project created
→ GitHubRepositorySource
→ scan
```

## Truth

```text
repository
→ deterministic analyzer
→ AI interpretation where useful
→ candidate claim
→ evidence
→ Truth Resolver
→ current/historical Truth
→ PostgreSQL
```

## Memory

```text
user / agent / system event
→ structured Memory
→ PostgreSQL
→ relevance/context retrieval
```

## Agent

```text
coding agent
→ remote MCP endpoint
→ bearer agent token
→ token hash lookup + authorization
→ project tools
→ Truth / Memory / Context
```

## Billing

```text
user
→ Stripe Checkout
→ Stripe subscription
→ signed webhook
→ HARIKOS billing record
→ entitlement
```

---

# 6. Supabase Auth

Use current Supabase SSR/cookie patterns for Next.js App Router.

Required:

- browser client;
- server client;
- callback exchange;
- session refresh;
- protected routes;
- server-side user lookup;
- logout;
- profile relationship.

Preferred social login:

> GitHub.

Authentication is separate from repository authorization.

---

# 7. Authorization

Every sensitive server action/API must resolve the current user and verify resource ownership.

Never trust:

```text
projectId
repositoryId
memoryId
agentConnectionId
```

from the browser without authorization.

For exposed Supabase tables, use RLS/privilege configuration as appropriate.

A user must never access another user's private project through guessed IDs.

---

# 8. Billing Architecture

Stripe is the billing authority.

Core concepts:

```text
BillingCustomer
Subscription
Entitlement
```

Suggested persisted fields:

```text
user_id
stripe_customer_id
stripe_subscription_id
stripe_price_id
subscription_status
current_period_end
cancel_at_period_end
updated_at
```

Do not grant Pro from the Checkout success URL alone.

Signed Stripe webhooks update trusted subscription state.

Required relevant events should be chosen from current Stripe guidance and implementation needs, typically including subscription creation/update/deletion and successful Checkout/payment events where appropriate.

Use Stripe Customer Portal for subscription management rather than rebuilding billing UI.

---

# 9. Entitlements

Create a centralized entitlement module.

Example:

```ts
type Plan = "free" | "pro";

interface Entitlements {
  maxProjects: number;
  maxAgentConnections: number;
  maxMemoriesPerProject: number;
  maxContextPacksPerMonth: number;
}
```

Initial configuration:

```text
FREE
projects: 1
agent connections: 1
memories/project: 250
context packs/month: 25

PRO
projects: 5
agent connections: 5
higher practical memory/context limits
```

Do not scatter `if (plan === "pro")` logic throughout arbitrary components.

---

# 10. GitHub App

Use minimum initial permissions:

```text
Contents: Read
Metadata: Read
```

Persist:

```text
installation_id
github_account_id
github_repository_id
owner
name
full_name
default_branch
private
```

Do not persist installation access tokens.

Generate short-lived installation tokens server-side when repository access is needed.

---

# 11. RepositorySource

Core truth logic must remain repository-provider neutral.

Conceptual:

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

Preserve working Phase 1 code where compatible.

---

# 12. Scan Architecture

Conceptual:

```text
Create Scan
→ determine target commit
→ load tree
→ ignore/filter
→ rank high-signal files
→ fetch bounded files
→ deterministic analysis
→ AI interpretation when needed
→ candidate claims
→ evidence
→ resolve Truth
→ persist changes
→ complete Scan
```

Scan statuses:

```text
queued
running
completed
failed
```

Persist errors honestly.

---

# 13. GitHub Push Updates

Preferred connected-repo behavior:

```text
GitHub push webhook
→ verify signature
→ repository/project lookup
→ compare base/head
→ changed files
→ identify affected claims
→ selective reverification
→ ProjectChange
```

If full selective reverification is not ready, a webhook-triggered bounded rescan is acceptable for MVP.

If webhook configuration is absent, manual rescans remain valid but the UI must not claim continuous monitoring.

---

# 14. Claim / Truth Model

Conceptual:

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
created_at
updated_at
```

Statuses:

```text
verified
likely
uncertain
contradicted
stale
superseded
rejected
```

---

# 15. Evidence Model

Conceptual:

```text
id
claim_id
project_id
source_type
file_path
commit_sha
blob_hash
content_hash
line_start
line_end
authority
observed_at
metadata
```

Store pointers/metadata rather than arbitrary permanent full source whenever possible.

---

# 16. Memory Model

Memory is first-class MVP data.

Conceptual:

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
created_by_user_id
created_at
updated_at
metadata
```

Related tables/relations can support:

```text
memory_files
memory_claims
```

or equivalent relation storage.

Types:

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

States:

```text
active
superseded
archived
```

Do not overbuild memory decay/consolidation in MVP.

---

# 17. Agent Connection Model

Conceptual:

```text
AgentConnection
id
project_id
user_id
name
client_type
token_prefix
token_hash
last_used_at
created_at
revoked_at
```

Generate a high-entropy token.

Show the plaintext exactly once.

Persist only hash/prefix where practical.

All MCP requests:

```text
Authorization: Bearer <HARIKOS_AGENT_TOKEN>
```

Server:

```text
parse token
→ hash
→ lookup active AgentConnection
→ project/user authorization
→ update last_used_at
→ run tool
```

Revoked tokens fail immediately.

---

# 18. Remote MCP

Expose a production-safe remote MCP endpoint using the existing/current MCP SDK where compatible.

Suggested route/endpoint:

```text
/mcp
```

or a framework-appropriate server route.

The implementation must work in the actual deployment model.

Do not leave MCP as local stdio-only if the production product claims agent connection.

Initial tools:

```text
get_project_truth
search_project_memory
get_recent_changes
get_context_pack
record_memory
record_outcome
check_assumption
```

Optional if useful:

```text
begin_agent_session
end_agent_session
```

---

# 19. Agent Session Model

Conceptual:

```text
id
project_id
agent_connection_id
task
status
started_at
ended_at
metadata
```

Statuses can be simple:

```text
active
completed
failed
abandoned
```

Do not ingest entire private conversation transcripts by default.

Store structured project-useful outcomes.

---

# 20. Context Engine

Input:

```text
project
task
optional token/context budget
```

Retrieval order:

```text
current verified Truth
→ relevant files/evidence
→ recent project changes
→ active constraints
→ decisions
→ failed attempts
→ fixes/outcomes
→ useful historical memory
```

Exclude obviously superseded Truth unless history is relevant.

Context must include provenance labels so agent consumers can distinguish:

```text
CURRENT TRUTH
MEMORY
RECENT CHANGE
CONSTRAINT
```

---

# 21. Database

Primary SaaS concepts:

```text
profiles/users
billing_customers/subscriptions
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
agent_connections
agent_sessions
outcomes
usage_counters
```

Exact table names may follow existing conventions.

Use foreign keys and indexes for ownership/project queries.

---

# 22. Usage / Limits

Track only metrics required to enforce product limits.

MVP examples:

```text
project count
active agent connection count
memory count
context packs generated in billing period
```

Do not build an elaborate metering platform.

---

# 23. API / Server Boundary

Frontend must not directly couple to internal DB/truth implementation.

Conceptual operations:

```text
auth/session

projects:
list/create/read/delete

repositories:
install/list/connect

scans:
create/status

truth:
list/detail

memory:
list/create/update/archive

changes:
list

context:
create/read

agents:
list/create/revoke

billing:
checkout/portal/status

webhooks:
stripe
github

mcp:
authenticated remote tools
```

Next.js route handlers/server actions can implement these boundaries.

---

# 24. Product Routes

Public:

```text
/
pricing
/auth/*
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

---

# 25. No-Fake-State Architecture

Production components must receive real data or an explicit empty/error/loading state.

Avoid data access patterns like:

```ts
const project = MOCK_PROJECT;
```

inside production flows.

Fixtures must be isolated under test/dev boundaries.

Buttons that cannot perform their advertised action must be removed, disabled with an honest reason, or implemented.

---

# 26. Security

Required:

- server-only secrets;
- Supabase session verification;
- project ownership checks;
- RLS/DB permissions where appropriate;
- Stripe webhook signature verification;
- GitHub webhook signature verification;
- GitHub installation authorization;
- no permanent installation token storage;
- agent token hashing;
- agent token revocation;
- safe repository content rendering;
- Zod/input validation;
- no live `.env` ingestion;
- no arbitrary repo code execution;
- rate-limit public/auth-sensitive endpoints as appropriate.

---

# 27. Environment Configuration

Expected categories:

```text
Supabase/Auth
Database
GitHub App
Stripe
AI provider
App URL
```

Example names may include:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL

GITHUB_APP_ID
GITHUB_APP_SLUG
GITHUB_APP_PRIVATE_KEY
GITHUB_WEBHOOK_SECRET

STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID

NEXT_PUBLIC_APP_URL

OPENAI_API_KEY
```

Only use variables actually needed.

`.env.local` is never committed.

`.env.example` documents required keys without values.

---

# 28. Billing Webhook

Webhook is required for trustworthy entitlement.

Conceptual:

```text
Stripe event
→ verify signature
→ locate customer/user
→ update subscription
→ recompute entitlement
```

Handle idempotently.

Do not depend on client redirects for billing state.

---

# 29. Source Retention

Default:

```text
authorized GitHub fetch
→ analyze bounded relevant source
→ derive structured knowledge
→ discard unnecessary source
```

Persist:

- metadata;
- hashes;
- paths;
- line ranges;
- current/historical claims;
- memory/events.

---

# 30. Tests

## Unit

- truth resolution;
- contradiction;
- supersession;
- context selection;
- memory filtering;
- entitlement calculation;
- token hashing/auth.

## Integration

- Supabase/auth server boundaries;
- Postgres persistence;
- GitHubRepositorySource;
- scan lifecycle;
- memory persistence;
- Stripe webhook;
- GitHub webhook;
- remote MCP auth/tools;
- authorization.

## E2E

- signup/login;
- GitHub connect;
- repo create;
- scan;
- Project Truth;
- Memory;
- Agent token;
- agent tool call;
- context generation;
- billing checkout boundary;
- billing portal boundary;
- logout.

Use mocks only for external services where real secrets are unavailable during automated tests.

---

# 31. Flagship Tests

## Truth migration

```text
Clerk active
→ Supabase migration
```

Expected:

```text
Supabase VERIFIED
Clerk SUPERSEDED
stale README CONTRADICTED
```

## Agent handoff

Agent A:

```text
records failed attempt
records decision
records successful outcome
```

Agent B later:

```text
get_context_pack(related task)
```

Expected:

- current Truth;
- relevant decision;
- failed attempt warning;
- useful outcome;
- no stale superseded Truth presented as current.

## Token revocation

```text
valid token → MCP works
revoke token
same token → unauthorized
```

## Billing entitlement

```text
free → free limits
signed Stripe subscription webhook → Pro
cancellation/status change → entitlement updates
```

---

# 32. Deployment

One Vercel deployment initially.

All production-sensitive services must be compatible with the deployment model.

Do not introduce a long-running local daemon into serverless runtime without a separate deployment architecture.

Remote MCP must be implemented using a production-compatible HTTP transport.

---

# 33. Architecture Success Condition

The architecture succeeds when a real user can:

```text
authenticate
→ connect GitHub
→ analyze real repo
→ persist Project Truth
→ persist Memory
→ connect real MCP agent
→ retrieve Context
→ record agent Memory/Outcome
→ revisit data later
→ upgrade/manage subscription
```

and HARIKOS still distinguishes:

```text
what happened
from
what is currently true.
```
