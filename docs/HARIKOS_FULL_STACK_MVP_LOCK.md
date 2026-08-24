# HARIKOS AI — FINAL FULL-STACK SAAS MVP + OSS INTELLIGENCE MISSION

## READ THIS ENTIRE DIRECTIVE BEFORE MODIFYING ANYTHING

You are working inside the existing HARIKOS AI repository.

This is NOT a greenfield rebuild.

This is NOT a frontend redesign task.

This is NOT a demo-generation task.

This is NOT permission to replace working code with a generic SaaS template.

Your mission is to turn the existing HARIKOS AI repository into the cleanest, most complete, production-minded **full-stack SaaS MVP** possible while preserving working functionality, keeping the codebase Vercel-deployable, and then strengthening the intelligence layer with carefully audited open-source systems.

The target product is:

> **HARIKOS is a shared, continuously verified project brain for AI coding agents and AI-native builders.**

Primary product promise:

> **Build fast with AI. HARIKOS keeps the project straight.**

Supporting line:

> **One shared, continuously verified project brain for Codex, Claude, Cursor, and you.**

Optional punchier line:

> **Vibe code without losing the plot.**

The product has four core systems:

```text
TRUTH
What is true now?

MEMORY
What happened before?

CONTEXT
What matters for this task?

AGENT BRIDGE
How coding agents read from and write to HARIKOS.
```

Everything in this mission exists to make those four systems work as a real subscription SaaS.

---

# 0. ATTACHED FILES ARE CANONICAL — REPLACE THE OLD VERSIONS

I am attaching four current HARIKOS V3 files with this task.

Read ALL FOUR before coding.

They supersede older conflicting product/architecture instructions.

You must replace/update the corresponding repository documentation with the attached versions.

Expected mapping:

```text
ATTACHED HARIKOS_PRD_V3_FULL_MVP.md
→ docs/harikos_ai_prd.md

ATTACHED HARIKOS_ARCHITECTURE_V3_FULL_MVP.md
→ docs/ARCHITECTURE.md

ATTACHED HARIKOS_AGENTS_V3_FULL_MVP.md
→ AGENTS.md

ATTACHED HARIKOS_FULL_STACK_MVP_LOCK_PROMPT.md
→ preserve as docs/HARIKOS_FULL_STACK_MVP_LOCK.md
  or replace the existing equivalent mission/build directive if one already exists.
```

If the fourth attached file has a slightly different name, identify it by content rather than guessing.

Do not keep old canonical docs that materially contradict V3.

Do not delete historical docs merely for cleanup if they may be useful; clearly mark them superseded or move them under an appropriate historical/archive location if necessary.

The instruction priority is:

```text
THIS MISSION
>
ATTACHED V3 PRD
>
ATTACHED V3 ARCHITECTURE
>
ATTACHED V3 AGENTS.md
>
current working repository
>
older docs
>
assumptions
```

---

# 1. CORE GOAL

At the end of this mission HARIKOS should be a real full-stack SaaS MVP where a genuine user can:

```text
open HARIKOS
→ sign in with Google OR GitHub
→ receive a persistent Supabase-backed account
→ use Free entitlement
→ optionally upgrade to Pro
→ connect GitHub repository access
→ select a real repository
→ run a real scan
→ inspect real Project Truth
→ inspect real Evidence
→ create/store persistent Memory
→ connect a coding agent to HARIKOS
→ agent reads current Truth + Memory + Changes
→ agent records decisions / failed attempts / outcomes
→ HARIKOS stores them
→ another agent/session retrieves relevant prior context
→ repository changes are re-scanned/reverified
→ old assumptions can become stale/superseded
→ user returns later and all project state still exists
```

No important step in that story may secretly be hard-coded demo state.

---

# 2. REALITY FIRST — AUDIT BEFORE WRITING CODE

Before substantial edits inspect the repository thoroughly.

Run/inspect:

```text
git status
git branch
git log --oneline -n 20
git remote -v

root package.json
pnpm-workspace.yaml
apps/*
packages/*
docs/*
AGENTS.md

current routes
current frontend
current backend/server routes/actions
current Supabase code
current DB schema
current migrations
current GitHub integration
current scanner
current claims/evidence/truth resolver
current memory implementation
current context generation
current MCP package/server
current tests
current environment variable declarations
Vercel configuration
current mock/demo/sample data
```

Do not assume the previous agent completed a feature merely because code exists.

Verify actual behavior.

Create/update:

```text
docs/BUILD_STATE.md
```

with a reality matrix:

```text
REAL
PARTIAL
MOCKED
BROKEN
MISSING
CONFIG_REQUIRED
```

Classify at minimum:

```text
Google login
GitHub login
Supabase sessions
profiles
Postgres
RLS/authorization
GitHub App
repo listing
repo connection
real scan
claims
evidence
Truth Resolver
Truth persistence
contradictions
supersession
Memory
Memory persistence
Context
Before You Build
Agents page
agent tokens
remote MCP
agent write-back
AgentSession
Outcome
Stripe billing
Free/Pro entitlement
webhooks
Vercel compatibility
tests
```

DO NOT begin the OSS augmentation until the base SaaS pipeline passes its quality gate later in this mission.

---

# 3. GIT SAFETY

Before modification:

```bash
git status
git branch
git diff
```

Preserve existing uncommitted work.

Never without explicit permission:

```bash
git reset --hard
git clean -fd
git push --force
```

Do not overwrite unrelated changes.

Prefer incremental, reviewable commits.

---

# 4. NO REWRITE RULE

The repository already contains significant HARIKOS work.

Preserve/adapt working code including where useful:

```text
RepositorySource
LocalRepositorySource
GitHubRepositorySource
scanner
claims
evidence
Truth Resolver
contradiction handling
supersession
memory primitives
context generation
MCP tools
database abstractions
tests
fixtures
frontend routes
design system
```

For every major subsystem choose:

```text
KEEP
ADAPT
MIGRATE
REPLACE
DEPRECATE
```

Do not delete a subsystem because you can regenerate something prettier.

---

# 5. FRONTEND FREEZE FOR THIS MISSION

This task is about functionality and clean integration.

Do NOT perform the large visual redesign now.

Preserve the current app shell and styling as much as possible.

Only add minimal functional UI required for:

```text
Login
Google login button
GitHub login button
GitHub repo connection
Memory
Agents
Billing
Settings
real empty/loading/error states
```

Do not spend significant effort on:

```text
3D
hero animations
landing redesign
marketing video
motion experiments
new visual identity
```

A dedicated frontend pass comes after this mission.

---

# 6. AUTH — SUPABASE IS AUTHORITATIVE

Authentication must use the existing Supabase project.

Use the current recommended Supabase approach for Next.js App Router and SSR/cookie-based authentication.

Do NOT create a parallel auth system.

Supported MVP login methods:

```text
Continue with Google
Continue with GitHub
```

Both should resolve to the same HARIKOS account model through Supabase Auth.

Do not require email/password unless the existing product already supports it cleanly and keeping it costs almost nothing.

---

# 7. GOOGLE LOGIN

Implement real Supabase Google OAuth login.

Flow:

```text
User
→ Continue with Google
→ Supabase Auth
→ Google OAuth
→ HARIKOS auth callback
→ PKCE code exchange/session
→ authenticated app
```

Use the current official Supabase pattern.

Use:

```text
provider: "google"
```

Correctly implement:

```text
redirectTo
/auth/callback
server-side code exchange
allowed redirect handling
localhost
production app URL
```

Do not request unnecessary Google scopes.

HARIKOS does NOT need Google API access merely because Google is used to sign in.

Do not store Google provider access/refresh tokens unless the product later genuinely needs Google APIs.

---

# 8. GITHUB LOGIN

Implement real Supabase GitHub social login as another account login option.

Flow:

```text
User
→ Continue with GitHub
→ Supabase Auth
→ GitHub OAuth
→ callback
→ HARIKOS session
```

This answers:

> WHO IS THE USER?

It must NOT be confused with GitHub repository authorization.

---

# 9. GITHUB APP != GITHUB LOGIN

Repository access must remain a separate GitHub App integration.

GitHub login:

```text
identity
```

GitHub App installation:

```text
repository permission
```

A Google-authenticated user must be able to connect their GitHub repositories too.

Therefore the product cannot assume:

```text
Supabase auth provider == github
```

before allowing repo access.

Correct flow:

```text
Google OR GitHub login
↓
HARIKOS user
↓
Install/connect HARIKOS GitHub App
↓
select repository
```

---

# 10. SUPABASE DATABASE — CREATE THE REAL SAAS SCHEMA

The Supabase project already exists.

The real HARIKOS SaaS database must now exist inside Supabase PostgreSQL.

Use the existing ORM if sensible.

If Drizzle already exists:

> KEEP DRIZZLE.

Do not migrate to another ORM because of preference.

Create clean migrations.

Do not only create TypeScript types and call that a database.

Actually ensure schema/migrations target PostgreSQL.

---

# 11. REQUIRED DATABASE DOMAINS

Audit existing names and reuse equivalents rather than blindly duplicating.

The data model must support at minimum:

```text
profiles
subscriptions / billing state

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

usage counters / usage periods
```

Optional relation tables may include:

```text
memory_files
memory_claims
claim_relationships
```

only if justified.

---

# 12. PROFILE MODEL

Supabase `auth.users` owns authentication identity.

HARIKOS application data should use a profile/application user record tied to:

```text
auth.users.id
```

Store only product-relevant profile information.

Do not copy passwords/provider credentials.

Support a user who initially logs in with Google and later links/uses GitHub where Supabase/account identity behavior permits.

Avoid duplicate HARIKOS accounts where reasonable.

---

# 13. ROW LEVEL SECURITY / AUTHORIZATION

Private project data must not be public.

Evaluate the actual data access architecture.

Use Supabase RLS where appropriate, especially if browser clients access Data API tables.

Also enforce server-side ownership checks.

Never make private HARIKOS tables accessible with broad:

```sql
USING (true)
```

policies simply to make development easier.

Test:

```text
User A cannot access User B project
User A cannot query User B memories
User A cannot use User B agent token
User A cannot open User B context pack
```

---

# 14. DATABASE MIGRATIONS

Create proper migrations.

Do not manually mutate production schema without migration history.

Expected repo commands should be documented, such as:

```text
pnpm db:generate
pnpm db:migrate
```

or the existing equivalents.

If migration tooling differs, preserve current conventions.

Do not destructive-reset a database that already contains meaningful state.

---

# 15. SUPABASE ENVIRONMENT CONFIG

Audit environment variables without printing secret values.

Expected category:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Only require `SUPABASE_SERVICE_ROLE_KEY` where privileged server operations genuinely need it.

Never expose service-role credentials to the client.

Never prefix them with `NEXT_PUBLIC_`.

Maintain `.env.example`.

Never commit `.env.local`.

---

# 16. AUTH ROUTE PROTECTION

Protect real authenticated application routes.

At minimum:

```text
/app/*
```

Unauthenticated visitor:

```text
→ login
```

Authenticated visitor:

```text
→ dashboard/onboarding
```

Prevent redirect loops.

Sensitive APIs/server actions must independently validate the user.

Frontend route guards alone are insufficient.

---

# 17. LOGOUT

Implement real Supabase logout.

After logout:

```text
protected app routes fail/redirect
private server data cannot be retrieved
```

Logging out does not automatically uninstall the GitHub App.

---

# 18. GITHUB APP — REPOSITORY ACCESS

Audit the current implementation.

Use GitHub App repository installation for production.

Initial permissions should be the minimum required.

Expected:

```text
Contents: Read
Metadata: Read
```

Only request more permissions if an actual implemented capability requires them.

GitHub recommends minimum permissions.

---

# 19. GITHUB APP DATA

Persist durable identifiers, not temporary access tokens.

Conceptually:

```text
installation_id
github_account_id
github_repository_id
owner
name
full_name
default_branch
private
installation status
```

Installation tokens:

```text
generate server-side when needed
temporary
never persist long-term
```

---

# 20. REPOSITORY SELECTION

After a valid GitHub App installation:

```text
list only repositories available to installation
→ user selects one
→ create/reuse HARIKOS project
→ persist repository metadata
```

Free/Pro limits apply here.

Do not show fake repositories.

---

# 21. RepositorySource ABSTRACTION

Preserve the provider-neutral domain boundary.

Conceptually:

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

Implement/adapt:

```text
GitHubRepositorySource
LocalRepositorySource
```

Do not spread Octokit calls throughout Truth Engine code.

---

# 22. REAL SCAN PIPELINE

Connected repository:

```text
create Scan
→ resolve target commit
→ repository metadata/tree
→ ignore dangerous/irrelevant paths
→ prioritize files
→ deterministic analysis
→ AI interpretation only where useful
→ candidate claims
→ evidence
→ Truth Resolver
→ contradiction/supersession
→ persist
→ complete Scan
```

Statuses:

```text
queued
running
completed
failed
```

Persist errors honestly.

No fake progress delays.

---

# 23. SECRET / SOURCE SAFETY

Never ingest:

```text
.env
credentials
private keys
API tokens
secret files
```

as normal repository context.

Do not execute arbitrary repository code.

Prefer structural/static analysis.

Minimize raw source retention.

---

# 24. PROJECT TRUTH — CORE MVP

Truth remains one of the four foundational systems.

Make sure the real DB-backed product supports:

```text
VERIFIED
LIKELY
UNCERTAIN
CONTRADICTED
STALE
SUPERSEDED
REJECTED
```

Truth data includes enough information to answer:

```text
What is believed?
Why?
How confident?
What evidence?
Which commit?
When verified?
What did this supersede?
```

---

# 25. FLAGSHIP TRUTH TEST

Controlled fixture:

State A:

```text
Clerk active
README: Clerk
```

HARIKOS:

```text
Clerk VERIFIED
```

State B:

```text
implementation migrated to Supabase
README still says Clerk
```

HARIKOS:

```text
Supabase VERIFIED
Clerk SUPERSEDED
README CONTRADICTED/STALE
```

No generated context may describe Clerk as current after State B.

This is mandatory regression coverage.

---

# 26. MEMORY — CORE MVP, NOT ROADMAP

Persistent project memory is required now.

Memory types:

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

Minimum state:

```text
active
superseded
archived
```

Persist:

```text
project
type
title/content
source
source_agent
agent_session
importance
related files
related Truth where useful
timestamps
metadata
```

Memory survives refresh/new browser session/new agent session.

---

# 27. MEMORY != TRUTH

This invariant cannot be broken.

Agent says:

```text
"We use Redis."
```

That may become:

```text
Memory / candidate information
```

It does NOT automatically become:

```text
Redis VERIFIED
```

Truth authority still requires verification/evidence.

This distinction is HARIKOS's central differentiation.

---

# 28. MEMORY UI — FUNCTIONAL ONLY

Ensure a real:

```text
/app/project/[id]/memory
```

or equivalent exists.

Functional minimum:

```text
list
filter by type
view detail
manual create if implemented
archive where appropriate
show source
show agent/session
show created time
```

No fake timeline.

Visual overhaul comes later.

---

# 29. AGENT CONNECTION — REAL REMOTE MCP

HARIKOS needs a real agent-neutral connection.

Production mechanism:

> **Remote MCP over Streamable HTTP.**

Do NOT use deprecated HTTP+SSE as the new primary transport.

Existing stdio MCP may remain for local compatibility/testing.

The production web SaaS must expose a Vercel-compatible remote HTTP MCP endpoint.

Prefer current official Model Context Protocol TypeScript SDK patterns.

Inspect the current installed SDK/version before coding.

Do not blindly pin a version from memory.

---

# 30. AGENT AUTH

For MVP use HARIKOS-issued revocable high-entropy agent tokens scoped to project/user.

Conceptual record:

```text
id
user_id
project_id
name
client_type
token_prefix
token_hash
created_at
last_used_at
revoked_at
```

Generate token server-side.

Show plaintext once.

Persist secure hash + safe prefix, not plaintext where practical.

Request:

```http
Authorization: Bearer <HARIKOS_AGENT_TOKEN>
```

Server:

```text
hash token
→ lookup
→ verify active
→ verify project
→ update last_used
→ execute MCP request
```

Revocation must work immediately.

---

# 31. AGENTS PAGE

Functional route:

```text
/app/project/[id]/agents
```

Allow:

```text
Create connection
Name connection
Select/display client label
Copy token once
Copy MCP endpoint/config
See creation date
See last used
Revoke
```

Do not label connection “active” merely because it was created.

Use a state such as:

```text
Never used
Last used 8m ago
Revoked
```

based on real requests.

---

# 32. MVP MCP TOOLS

Provide working tools equivalent to:

```text
get_project_truth
search_project_memory
get_recent_changes
get_context_pack
record_memory
record_outcome
check_assumption
```

Reuse/adapt existing Phase 1 MCP tools where they already implement equivalent semantics.

Do not create duplicate tools just to match exact names.

---

# 33. TOOL: get_project_truth

Return current project Truth.

Optional filtering:

```text
category
scope
query/task
```

Do not return superseded facts as current.

Include evidence summaries where appropriate.

---

# 34. TOOL: search_project_memory

Search/retrieve relevant:

```text
decisions
attempts
failed attempts
fixes
constraints
discoveries
outcomes
incidents
notes
```

Start with simple structured/filter/text retrieval if sufficient.

Do not force embeddings merely because this is called memory.

---

# 35. TOOL: get_recent_changes

Return real persisted project changes.

Include:

```text
time
affected domain
old/new state where known
related claims
attention/contradiction
```

---

# 36. TOOL: get_context_pack

Input:

```text
task
```

Output organizes:

```text
CURRENT TRUTH

RELEVANT FILES / EVIDENCE

RECENT CHANGES

CONSTRAINTS

DECISIONS

FAILED ATTEMPTS

FIXES / OUTCOMES

USEFUL HISTORY
```

Optimize for smallest context that prevents mistakes.

---

# 37. TOOL: record_memory

Agents can persist:

```text
decision
attempt
failed_attempt
fix
constraint
discovery
outcome
note
etc.
```

Validate input.

Associate with project/agent/session.

This tool can NEVER directly mark a candidate claim as VERIFIED.

---

# 38. TOOL: record_outcome

Persist structured task/session outcome.

Avoid entire chat transcript capture.

Store project-useful structured information.

---

# 39. TOOL: check_assumption

Input:

```text
statement
```

Return conceptually:

```text
SUPPORTED
CONTRADICTED
UNVERIFIED
```

plus relevant:

```text
Truth
Evidence
Memory/history
```

Do not present LLM confidence alone as proof.

---

# 40. AGENT SESSION

Persist lightweight AgentSession.

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

Statuses:

```text
active
completed
failed
abandoned
```

Avoid storing complete private transcripts by default.

---

# 41. SECOND FLAGSHIP TEST — AGENT HANDOFF

Agent A works on:

```text
Add subscriptions
```

It records:

```text
FAILED ATTEMPT:
Client-side subscription creation failed because privileged Stripe credentials were required.

DECISION:
Subscription creation must remain server-side.

OUTCOME:
Server-side implementation succeeded.
```

Later Agent B asks:

```text
get_context_pack("Modify subscription flow")
```

Expected:

```text
current relevant Truth
server-side constraint
failed attempt warning
decision
successful outcome
relevant files/evidence
```

No repeated rediscovery.

This is mandatory MVP value.

---

# 42. CONTEXT ENGINE — TRUTH + MEMORY

Context is not generic RAG.

Selection:

```text
task
→ current verified Truth
→ relevant evidence/files
→ recent changes
→ active constraints
→ decisions
→ failed attempts
→ fixes/outcomes
→ useful history
```

Never automatically prioritize old memory over current Truth.

---

# 43. BEFORE YOU BUILD

Existing human preflight should be backed by the same real Context Engine.

No parallel hard-coded demo logic.

Input:

```text
Add subscriptions
```

Possible real output:

```text
✓ Stripe installed
✓ webhook exists
✓ Supabase authentication
⚠ subscription_status missing
⚠ previous browser-side attempt failed
✓ privileged billing logic stays server-side
```

---

# 44. CHANGES / DRIFT

Persist meaningful ProjectChange records.

If GitHub push webhooks can be completed cleanly:

```text
signed GitHub push
→ project lookup
→ changed files
→ bounded rescan / selective reverify
→ updated Truth
→ ProjectChange
```

Selective impact analysis can be improved later by OSS code-graph systems.

For base MVP a safe bounded rescan is acceptable.

If webhook isn't configured:

manual rescan remains real.

Do not display “continuous monitoring” if only manual scanning works.

---

# 45. UNDERSTAND

Human Q&A should query HARIKOS's project brain.

Ground it using:

```text
Truth
Evidence
Memory
Changes
```

Do not implement generic “chat with repo” that ignores the structured domain.

---

# 46. SUBSCRIPTION SAAS

HARIKOS is a subscription product.

Implement:

```text
FREE
PRO
```

Initial hypothesis:

```text
PRO = $15/month
```

Keep price/config centralized and environment-driven.

Do not spread literal price IDs across the app.

---

# 47. FREE ENTITLEMENT

Initial:

```text
1 repository/project
1 active agent connection
250 memories/project
25 generated context packs/month
```

These are launch defaults, not immutable architecture.

Centralize configuration.

---

# 48. PRO ENTITLEMENT

Initial:

```text
up to 5 repositories
up to 5 active agent connections
higher practical memory limit
higher context limit
usable project history
```

Do not invent enterprise tiers.

---

# 49. STRIPE

Use Stripe Billing with hosted subscription Checkout.

Implement:

```text
create/reuse Stripe Customer
create Checkout Session
subscription mode
success/cancel redirect
signed webhook
subscription state persistence
Customer Portal
```

The Checkout return page does NOT grant Pro access.

Trusted webhook/billing state does.

---

# 50. BILLING TABLE / DOMAIN

Persist billing state conceptually:

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

Adapt to current Stripe API fields/types.

Do not store unnecessary payment data.

Stripe handles payment methods.

---

# 51. STRIPE WEBHOOK

Implement idempotent signed webhook handling.

Use current Stripe guidance and actual required event types.

Do not blindly paste old API event handling from memory.

On trusted subscription changes:

```text
update billing record
→ recompute entitlement
```

---

# 52. CUSTOMER PORTAL

Settings Billing:

```text
current plan
status
usage summary
Upgrade
Manage Billing
```

Manage Billing creates a real Stripe Customer Portal session.

Do not rebuild payment-method management yourself.

---

# 53. CENTRAL ENTITLEMENTS

Create a single server/domain entitlement module.

Conceptually:

```ts
type Plan = "free" | "pro";

interface Entitlements {
  maxProjects: number;
  maxAgentConnections: number;
  maxMemoriesPerProject: number;
  maxContextPacksPerPeriod: number;
}
```

Enforce limits server-side.

A disabled button alone is not enforcement.

---

# 54. USAGE

Implement only what is needed for limits.

Do not build a metering company.

Track:

```text
project count
active agent connection count
memory count
context count/current period
```

---

# 55. PRICING

Create/retain functional:

```text
/pricing
```

It may be visually plain for now.

Claims must match implemented capabilities.

No:

```text
fake "most popular"
fake annual savings
fake customer counts
fake enterprise features
```

---

# 56. REALITY-ONLY FRONTEND

Search production application paths for:

```text
mock
fake
demo
sample
hardcoded
placeholder
fixture
```

Do not delete legitimate tests.

Production views must resolve to:

```text
REAL DATA
or
HONEST EMPTY STATE
or
HONEST LOADING
or
HONEST ERROR
```

Never silently fall back to fake success data.

---

# 57. DASHBOARD

Do not redesign.

Wire real DB values:

```text
projects
Truth count
Memory count
recent changes
agent connections
last scan
attention items
plan
```

If value is unavailable:

do not invent it.

---

# 58. SOURCE RETENTION

Preferred:

```text
GitHub
→ temporary authorized source retrieval
→ deterministic/AI analysis
→ structured knowledge
→ discard unnecessary raw source
```

Persist:

```text
paths
hashes
commit SHAs
line ranges
claims
evidence metadata
memory
history
```

Do not permanently mirror every repository by default.

---

# 59. BASE SAAS QUALITY GATE

Before OSS augmentation, ALL achievable core checks must be tested.

At minimum:

```text
Supabase auth architecture works
Google login code path correct
GitHub login code path correct
protected session logic works
Postgres migrations/schema work
project ownership works
GitHub repo flow works
real scan works
Truth persists
Memory persists
Context uses Memory + Truth
MCP endpoint works
agent token works
record_memory works
token revoke works
build passes
```

Billing may be `CONFIG_REQUIRED` if Stripe credentials genuinely aren't available, but code/tests/config boundaries must still be complete.

Commit this baseline before OSS integration if Git state is healthy.

Suggested checkpoint:

```text
feat: complete HARIKOS full-stack SaaS baseline
```

Do not push yet if the full mission still has OSS work pending unless necessary for safety.

---

# 60. NOW BEGIN OSS INTELLIGENCE AUGMENTATION

Only after the base SaaS quality gate.

The objective is:

> Replace commodity intelligence work with proven open-source building blocks where they materially improve HARIKOS while keeping HARIKOS's domain model and product identity authoritative.

Audit:

```text
Tree-sitter
Aider repo-map
CodeGraph
projectmem
Qarinah
Mem0
```

Use current upstream repository, docs, tests and exact license.

Never assume an old license/version is still current.

Clone/read OSS projects OUTSIDE the HARIKOS repo first where possible.

---

# 61. OSS RULE

You are REQUIRED TO AUDIT all listed systems.

You are NOT required to ship every one.

For each classify:

```text
DIRECT DEPENDENCY
EMBEDDED MODULE
ADAPTER
ISOLATED WORKER
PORTED/ADAPTED ALGORITHM
REFERENCE ONLY
REJECT
```

Use the smallest integration that delivers real measurable value.

---

# 62. OSS AUDIT DOCUMENT

Create:

```text
docs/OSS_INTEGRATION_AUDIT.md
```

For each project:

```text
repository
version/tag/commit inspected
license
capability
current HARIKOS equivalent
what OSS does better
integration approach
runtime impact
Vercel/deployment impact
security impact
maintenance risk
license obligations
decision
measurable expected benefit
```

Do this BEFORE integrating.

---

# 63. TREE-SITTER

Evaluate for deterministic source structure.

Use where valuable for:

```text
symbols
imports
functions
classes
language structures
incremental parsing
```

Prioritize JS/TS MVP.

Do not add 50 languages merely because parsers exist.

Target:

```text
source
→ structural parse
→ deterministic observations
→ candidate evidence/claims
```

---

# 64. AIDER REPO-MAP

Study specifically:

```text
repository map
symbol ranking
important definitions
reference ranking
token budgeting
compact repository context
```

Use/adapt relevant concepts to improve:

```text
file prioritization
repo understanding
Context Packs
Before You Build
```

Do not embed the whole Aider coding assistant.

---

# 65. CODEGRAPH

Evaluate semantic relationships:

```text
file → file
symbol → symbol
import relationships
call chains
architecture relationships
impact analysis
```

Potential benefit:

```text
changed file
→ affected symbols
→ claims/evidence
→ selective reverification
```

Do NOT jam a persistent Rust/local daemon inside a Vercel serverless request.

Choose:

```text
adapter
worker
portable subsystem
algorithm extraction
post-MVP deferral
```

based on deployment reality.

---

# 66. PROJECTMEM

Study:

```text
issues
attempts
fixes
decisions
failures
outcomes
event history
pre-check
staleness
```

Use strong patterns to improve HARIKOS Memory and agent handoff.

But:

```text
projectmem-style memory
!=
HARIKOS Truth
```

Preserve verification authority.

---

# 67. QARINAH

Study:

```text
cross-agent context
provenance
evidence-linked retrieval
supersession
context compression
token-aware retrieval
```

Use/adapt where it improves:

```text
Context Packs
agent handoff
provenance
history-aware retrieval
```

HARIKOS must not become a Qarinah wrapper.

---

# 68. MEM0

Evaluate for generic long-term-memory primitives:

```text
extraction
update
retrieval
ranking
```

Only integrate if it meaningfully improves HARIKOS beyond the structured Memory system.

Do not introduce:

```text
vector DB
embeddings
extra service
complex infra
```

without evidence that it improves actual retrieval.

It is valid to reject Mem0 after audit.

---

# 69. OSS BOUNDARIES

Third-party code sits BELOW HARIKOS interfaces.

Do not leak foreign domain objects everywhere.

Target conceptual boundaries:

```text
CodeIntelligenceProvider
SymbolIndex
ProjectMemoryProvider
ContextRetriever
```

Only create abstractions where they prevent real coupling.

Avoid abstraction theatre.

---

# 70. TARGET INTELLIGENCE PIPELINE

Preferred eventual structure:

```text
GitHubRepositorySource
        │
        ▼
Repository Tree
        │
  ┌─────┴───────────┐
  ▼                 ▼
Tree-sitter      Repo Map
  │                 │
  └───────┬─────────┘
          ▼
 Important files/symbols
          │
          ▼
 Code relationship analysis
          │
          ▼
 deterministic observations
          │
          ▼
 candidate claims + evidence
          │
          ▼
 HARIKOS Verification
          │
          ▼
 HARIKOS Truth Resolver
          │
          ▼
 Temporal Project Truth
```

Memory remains a separate lane feeding Context.

---

# 71. TARGET MEMORY/CONTEXT PIPELINE

```text
Agent session / user / system
          ↓
structured events
          ↓
HARIKOS Memory
          ↓
relevance/history
          │
          ├───────────────┐
          │               │
Current Truth         Recent Changes
          │               │
          └───────┬───────┘
                  ▼
             Context Engine
                  ▼
             Context Pack
                  ▼
               Agent
```

---

# 72. OSS LICENSE COMPLIANCE

Before incorporating code:

inspect exact current license.

Maintain required:

```text
copyright
LICENSE
NOTICE
attribution
third-party notices
```

Create/update:

```text
THIRD_PARTY_NOTICES.md
```

Do not strip attribution.

Do not imply HARIKOS authored third-party code.

---

# 73. OSS SECURITY

Review imported dependencies/repositories for:

```text
install scripts
postinstall hooks
telemetry
network calls
filesystem writes
Git hooks
shell execution
environment access
background daemons
native binaries
```

Do not blindly install global hooks/watchers from local-first projects.

---

# 74. OSS PERFORMANCE

Benchmark before/after where feasible:

```text
file selection precision
context size/tokens
truth correctness
stale fact detection
analysis latency
affected-claim detection
agent rediscovery
```

Do not replace working HARIKOS code because another repo has more stars.

---

# 75. OSS FLAGSHIP TESTS

After augmentation rerun:

```text
Clerk → Supabase Truth test
Agent A → Agent B handoff test
token revocation
context correctness
```

Add:

```text
changed auth file
→ relevant auth claims identified/reverified
```

if code graph/impact analysis was implemented.

---

# 76. VERCEL ARCHITECTURE

Everything committed to the main SaaS path must remain compatible with clean Vercel deployment.

Avoid:

```text
persistent local daemon assumptions
background process that serverless cannot host
filesystem-persistent local DB
native service that must always run beside Next.js
```

If OSS requires separate worker infrastructure:

do not secretly bolt it into Vercel.

Either:

```text
use a serverless-compatible subset
isolate behind optional worker interface
document as PARTIAL / future deployment
```

Core SaaS must continue working without broken infrastructure.

---

# 77. REMOTE MCP + VERCEL

Use production-compatible Streamable HTTP.

Prefer stateless or shared-database-backed request handling where appropriate.

Do not rely on in-memory MCP session state across arbitrary serverless instances unless the architecture explicitly guarantees affinity/persistence.

If current MCP SDK provides stateless request handling, prefer that for simple tool calls.

---

# 78. RATE / ABUSE PROTECTION

Add reasonable MVP protection to sensitive endpoints where practical:

```text
auth callbacks
agent token endpoint
MCP
scan trigger
context generation
billing session creation
webhooks
```

Do not build a giant rate-limit platform.

Use clean deployable approach.

---

# 79. INPUT VALIDATION

Use Zod or existing equivalent on server boundaries.

Validate:

```text
project IDs
task text
memory types
memory payload
agent connection creation
scan inputs
billing actions
webhook payload boundary
```

Do not trust browser TypeScript types.

---

# 80. ERROR HANDLING

No raw secret/stack traces in user UI.

Use typed/loggable server errors.

Functional UI should handle:

```text
not authenticated
not authorized
repo unavailable
GitHub rate limited
scan failed
Supabase unavailable
agent token invalid
subscription config missing
Stripe failure
MCP request invalid
```

---

# 81. CLEAN CODE

Before completion:

```text
remove dead imports
remove debug logs
remove duplicate adapters
remove obsolete mocks in production
centralize env parsing
centralize entitlements
centralize auth helpers
centralize provider boundaries
keep domain code separated from UI
```

Do not perform unrelated cosmetic refactors.

---

# 82. ENV VALIDATION

Create or use one typed server-side environment validation module.

Separate:

```text
public env
server-only env
optional integrations
```

Never allow a missing optional Stripe key to crash unrelated local Project Truth development unless billing route is invoked.

But production readiness report must clearly flag missing config.

---

# 83. EXPECTED ENV CATEGORIES

Exact names may adapt to existing conventions:

```text
# App
NEXT_PUBLIC_APP_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# GitHub App
GITHUB_APP_ID=
GITHUB_APP_SLUG=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=

# AI
OPENAI_API_KEY=
```

Google and GitHub social OAuth provider client secrets should normally live in Supabase provider configuration rather than being unnecessarily duplicated in frontend env.

If local Supabase CLI configuration requires provider variables, document them separately.

---

# 84. HUMAN CONFIGURATION CHECKLIST

If external dashboard actions are needed, create:

```text
docs/SETUP.md
```

with exact steps for:

## Supabase

```text
Project URL
Publishable key
DB connection
Google provider
GitHub provider
Site URL
redirect allow list
RLS/migration commands
```

## Google Auth

```text
Google Cloud/Auth Platform
OAuth web client
authorized origin
Supabase callback URL
Client ID/secret into Supabase
minimal scopes only
```

## GitHub Login

```text
GitHub OAuth App
Supabase callback
Client ID/secret into Supabase
```

## GitHub App

```text
App ID
slug
private key
permissions
install URL
webhook URL/secret
```

## Stripe

```text
HARIKOS Pro Product
$15 monthly Price
Price ID
webhook endpoint
webhook secret
Customer Portal
```

## Vercel

```text
environment variables
production URL
OAuth redirect allow list
webhook URLs
```

Do not merely say “configure Google.”

Give the exact value format/path where possible.

---

# 85. TEST STRATEGY

Run:

```text
typecheck
lint if configured
unit tests
integration tests
production build
browser/E2E
```

Tests must cover meaningful domain behavior.

---

# 86. AUTH TESTS

At minimum:

```text
unauthenticated protected route blocked
authenticated profile resolved
logout invalidates session
User A cannot access User B project
```

OAuth provider end-to-end may require real dashboard credentials; if unavailable, test callback logic/unit boundaries and mark external verification `CONFIG_REQUIRED`.

---

# 87. BILLING TESTS

At minimum:

```text
free entitlement
signed webhook changes subscription state
invalid signature rejected
server plan checks
Customer Portal requires authenticated customer
```

Never fake a successful live card payment test without Stripe configuration.

---

# 88. AGENT TESTS

At minimum:

```text
create token
plaintext returned once
hash stored
valid token can call MCP
wrong token rejected
revoked token rejected
project scope enforced
record_memory persists
get_context_pack returns it when relevant
```

---

# 89. TRUTH/MEMORY TESTS

```text
Truth persists
Evidence persists
Memory persists
Memory does not automatically become Truth
Supersession works
Contradiction works
```

---

# 90. REAL BROWSER QA

Actually inspect the running app.

Functional routes:

```text
/
login
pricing
/app/dashboard
/app/projects
project overview
truth
memory
changes
agents
understand
context
settings/profile
settings/billing
```

Test console/network errors.

Do not claim browser QA if only build succeeded.

---

# 91. NO FRONTEND POLISH LOOP

Once functionality is usable:

STOP redesigning.

Do not consume remaining effort making shadows nicer.

The next separate mission will transform UI/UX.

This mission creates the solid backend/full-stack truth underneath that frontend.

---

# 92. CLEAN GIT CHECKPOINT

Before final commit:

```text
git status
git diff
git diff --cached
```

Check:

```text
no .env
no private keys
no agent plaintext token
no DB password
no Stripe secret
no GitHub secret
no accidental OSS clone directories
no temporary downloads
no debug fixtures in production
```

---

# 93. DOCUMENTATION UPDATE

Final repo must align:

```text
docs/harikos_ai_prd.md
docs/ARCHITECTURE.md
AGENTS.md
docs/BUILD_STATE.md
docs/SETUP.md
docs/OSS_INTEGRATION_AUDIT.md
THIRD_PARTY_NOTICES.md
```

Only create ADRs for meaningful architectural decisions.

---

# 94. COMMIT / PUSH

Once quality gates pass:

create clean meaningful commit(s).

Suggested grouping if practical:

```text
docs: lock HARIKOS full-stack SaaS MVP

feat: complete Supabase auth and persistence

feat: add persistent project memory and remote agent bridge

feat: add subscription entitlements

feat: augment repository intelligence with audited OSS
```

Do not force push.

Push the canonical working branch if repo policy permits.

---

# 95. VERCEL DEPLOYMENT

The repository is intended for Vercel.

Keep deployment clean.

If GitHub push automatically triggers Vercel deployment, that is fine.

Do not manually change Vercel organization/domain/project unless required.

If tooling allows, verify:

```text
deployment built
site loads
no server route crash
OAuth URL configuration matches production
MCP endpoint responds
```

Do not claim production success without verifying it.

---

# 96. SUCCESS CRITERIA — USER

A real user should be able to:

```text
Continue with Google
OR
Continue with GitHub

→ dashboard
→ Connect GitHub repositories
→ select repo
→ analyze
→ inspect Truth + Evidence
→ inspect/create Memory
→ Add Agent
→ copy real MCP connection details
→ agent reads context
→ agent records outcome
→ memory visible in browser
→ new agent/session inherits it
→ upgrade to Pro
→ manage subscription
```

---

# 97. SUCCESS CRITERIA — HARIKOS DIFFERENTIATOR

HARIKOS must visibly and technically preserve:

```text
MEMORY:
what happened

TRUTH:
what current evidence supports
```

The product fails its differentiation if agent-written memory is treated as canonical project truth without verification.

---

# 98. SUCCESS CRITERIA — NO FLUFF

Before marking done, ask:

```text
Does every production number come from data?

Does every button do what it claims?

Does every integration marked connected have a real backend state?

Does every Truth come from the engine/database?

Does Memory persist?

Can a real remote agent use HARIKOS?

Can the user log in with Google AND GitHub?

Does data survive refresh?

Is billing trustworthy?

Can this code deploy cleanly to Vercel?
```

If not, mark the exact item PARTIAL/BLOCKED.

Do not disguise it.

---

# 99. FINAL REPORT FORMAT

Return a concise but factual engineering report:

```text
HARIKOS FULL-STACK MVP REPORT

CANONICAL DOCS
- replaced:
- remaining legacy conflicts:

AUTH
- Google:
- GitHub:
- session:
- logout:
- protected routes:

SUPABASE
- Postgres:
- migrations:
- RLS:
- profile model:

GITHUB APP
- installation:
- repo listing:
- real repo read:
- webhooks:

TRUTH
- scan:
- claims:
- evidence:
- supersession:
- contradiction:
- flagship test:

MEMORY
- persistence:
- types:
- retrieval:
- Truth separation:

AGENTS / MCP
- endpoint:
- transport:
- token auth:
- tools:
- write-back:
- revoke:
- handoff test:

CONTEXT
- Truth:
- Memory:
- Changes:
- provenance:

BILLING
- Free:
- Pro:
- Checkout:
- webhook:
- portal:
- entitlement enforcement:

OSS
- audited:
- integrated:
- adapted:
- rejected:
- license status:

SECURITY
- ownership:
- secrets:
- token hashing:
- webhook validation:
- source safety:

TESTS
- typecheck:
- lint:
- unit:
- integration:
- E2E:
- browser:

VERCEL
- production build:
- compatibility:
- deployment status if verified:

GIT
- branch:
- commits:
- push:

REAL
PARTIAL
BLOCKED
CONFIG_REQUIRED

REMAINING PRODUCTION MOCKS

MISSING EXTERNAL CONFIG

NEXT 3 HIGHEST-VALUE STEPS
```

Never report “WORKING” if it was not tested.

---

# 100. THE FINAL NORTH STAR

The product you are building is this:

```text
I build software with AI.

HARIKOS remembers what my agents learned.

HARIKOS knows what my code currently proves.

HARIKOS notices when the two stop matching.

Every new agent gets the useful parts of that knowledge before working.

I can see, control and inspect all of it.

My account, repos, memory, history and subscription persist like a real SaaS.

Nothing important is pretend.
```

Do not optimize for impressive code volume.

Optimize for this real user loop.

BEGIN NOW.

FIRST:
1. read all four attached V3 files;
2. replace/update the canonical repository docs;
3. perform the reality audit;
4. update BUILD_STATE;
5. finish the base full-stack SaaS;
6. pass the base quality gate;
7. then audit/integrate OSS intelligence;
8. rerun flagship tests;
9. perform security/build/browser checks;
10. clean commit/push;
11. stop before the large frontend redesign.
