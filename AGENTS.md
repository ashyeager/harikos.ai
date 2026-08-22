# HARIKOS AI Repository Instructions

These instructions apply to Codex, Claude Code, Cursor agents, Hermes, and any human or automated contributor working in this repository.

## 1. Read Before Changing Code

Read these files in order before implementation:

1. `docs/harikos_ai_prd.md`
2. `docs/ARCHITECTURE.md`
3. `docs/MVP.md`
4. the nearest package-level README or instructions for the files being changed

The PRD defines the product. `ARCHITECTURE.md` defines system boundaries and invariants. `MVP.md` defines the current build scope. This file defines how work is performed.

If the documents conflict, stop and identify the conflict. Do not quietly choose a new product direction.

## 2. Product Boundary

HARIKOS AI is a local-first, persistent, evidence-backed project-truth and context layer for AI coding agents.

It is not a generic memory database, RAG wrapper, chatbot, notes app, IDE clone, or cloud SaaS shell.

The required loop is:

```text
observe repository evidence
  -> derive typed candidates
  -> verify and reconcile
  -> preserve temporal truth
  -> deliver relevant context through CLI, MCP, and web
```

Protect this loop over surface area or visual polish.

## 3. Architecture Rules

- Preserve the pnpm monorepo and package boundaries in `ARCHITECTURE.md`.
- Keep truth, retrieval, and context behavior in `packages/core`.
- Keep Drizzle schema, migrations, and persistence adapters in `packages/db`.
- Keep CLI, MCP, and web as adapters over shared core services.
- Never copy truth-resolution logic into an interface.
- Keep all MVP data local in SQLite under the registered project state directory.
- Keep persistence behind interfaces that can support a future cloud adapter without adding cloud code now.
- Avoid circular dependencies and deep imports across package internals.
- Do not change architecture, package layout, status semantics, or public contracts merely to make one implementation easier.

## 4. Scope Discipline

Implement only the active task and the required supporting work in `MVP.md`.

Do not add:

- speculative cloud infrastructure,
- auth, billing, teams, or remote sync,
- vector databases or graph databases,
- extra MCP tools,
- unrelated integrations,
- generic chat features,
- broad abstractions with no current caller,
- UI redesigns unrelated to the proof,
- compatibility layers for hypothetical users.

Do not leave fake buttons, mocked production paths, invented metrics, or unsupported product claims. If a capability is a demo or fixture, label it honestly.

## 5. Dependency Policy

- Use the locked stack: TypeScript, Node, pnpm, Next.js, SQLite, Drizzle, Zod, Commander, Git, MCP, Vitest, and Gemini structured outputs where justified.
- Prefer platform APIs and existing workspace dependencies.
- Add a dependency only when it removes meaningful complexity and has a current, tested use.
- Before adding one, check whether the capability already exists in the repo.
- Record the reason in the change summary.
- Do not add overlapping libraries, monorepo frameworks, infrastructure services, or convenience packages for trivial code.
- Remove unused dependencies before declaring completion.

## 6. Deterministic First, AI Second

Use deterministic parsing whenever a fact can be established from manifests, configuration, active imports, source code, Git, or tests.

Never ask Gemini to determine a fact already available reliably from code.

Use AI only for interpretation such as natural-language decisions, ambiguous architecture implications, memory classification, contradiction explanation, or Context Pack composition.

Every AI integration must:

1. use the provider abstraction,
2. send only the minimum necessary, non-secret excerpt,
3. request structured output,
4. validate the response with Zod,
5. label the result as inferred,
6. preserve provenance and provider metadata,
7. submit it to normal truth resolution as a candidate,
8. handle missing keys, malformed output, refusal, timeout, and provider failure without corrupting state.

Schema-valid does not mean semantically true. The model never owns canonical truth.

## 7. Truth and Memory Must Stay Separate

Truth is a structured, evidence-backed proposition that HARIKOS currently accepts for a scope and validity interval.

Memory is useful historical context: a decision, failed attempt, bug, cause, constraint, preference, outcome, incident, or note.

Therefore:

- `record_memory` and `harikos remember` create memories or candidate information only.
- An agent assertion is not authoritative because an agent wrote it.
- A human declaration may define intent but must not be mislabeled as current implementation.
- Never overwrite or delete old truth to create a cleaner current answer; close its validity interval and preserve history.
- Never hide a real disagreement; create a contradiction and resolve it explicitly.
- Treat scope differences as possible coexistence, not automatic conflict.
- Distinguish observed, derived, inferred, and declared claims.
- Confidence must come from evidence, corroboration, recency, authority, and execution signals—not model confidence alone.

## 8. Scanner and Security Rules

- Resolve the Git root before scanning and keep all paths inside it.
- Deny `.env`, credentials, tokens, private keys, secret stores, `.git`, dependency directories, caches, and generated output by default.
- Treat `.env.example` cautiously; it may reveal names and structure but must not be assumed harmless.
- Honor Git ignores and HARIKOS-specific ignore rules.
- Hash sources and skip unchanged content.
- Do not send a whole repository or whole large file to a cloud model.
- Redact sensitive values from logs, errors, fixtures, snapshots, and model requests.
- Keep local databases and runtime state out of Git.
- Do not let MVP MCP tools execute project code or mutate repository files.
- Never commit secrets, local database contents, or real private project material as fixtures.

## 9. TypeScript and Interface Quality

- Use strict TypeScript; do not use `any` to bypass design problems.
- Define Zod schemas at trust boundaries and infer TypeScript types from them where practical.
- Use explicit domain names: `SourceEvidence`, `CandidateClaim`, `ResolutionResult`, `ContextPack`.
- Prefer small pure functions in parsing, normalization, scoring, and resolution logic.
- Make time, scope, status, and provenance explicit rather than hiding them in JSON blobs.
- Use stable IDs and UTC timestamps.
- Make writes idempotent where rescans or retries can repeat.
- Use database transactions for multi-record truth changes.
- Return typed errors with actionable messages; do not swallow failures.
- Keep terminal and MCP JSON output stable enough for tests.

## 10. Test Requirements

Every behavior change requires tests at the lowest useful level plus integration coverage for affected boundaries.

Required coverage includes:

- source discovery, exclusions, hashing, and unchanged-source skipping,
- deterministic parsers,
- claim normalization and scoped identity,
- authority/confidence scoring,
- compatible evidence merging,
- contradiction creation and resolution,
- temporal supersession,
- current implementation vs intended state,
- stale documentation vs active source,
- installed-but-unused dependency,
- transitional coexistence,
- agent hallucination rejection,
- memory/truth separation,
- Gemini malformed-output and no-key behavior,
- CLI command behavior,
- MCP input/output schemas,
- Firebase-to-Clerk end-to-end fixture.

Before completion, run from the repository root:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Also run the actual CLI/MCP/web flow affected by the change. Passing mocked tests alone is insufficient for an integration task.

## 11. Working Method

1. Inspect the current worktree and relevant code before editing.
2. Restate the requested outcome and identify the smallest affected packages.
3. Check the canonical documents and existing tests.
4. Implement the smallest complete vertical behavior.
5. Add or update tests with the implementation.
6. Run focused checks, then the full required checks.
7. Verify CLI, MCP, and web agree whenever shared truth state changes.
8. Remove dead code, debugging output, temporary files, and unused dependencies.
9. Report what changed, what was verified, and any remaining limitation truthfully.

Do not stop at a plan when implementation was requested. Do not claim completion from code inspection alone.

## 12. Deviations and Decisions

Do not casually deviate from the PRD, architecture, or MVP.

If a deviation is genuinely necessary:

1. explain the blocking evidence,
2. state the proposed change and affected invariant,
3. compare the smallest viable alternatives,
4. obtain human approval when product scope or architecture materially changes,
5. add `docs/decisions/YYYY-MM-DD-<slug>.md`,
6. record context, decision, rationale, alternatives, consequences, and rollback path,
7. update the canonical document in the same change,
8. add tests that lock the new behavior.

Minor implementation details that preserve all contracts do not require an ADR, but they still belong in the change summary.

## 13. Completion Checklist

Before saying a task is complete, confirm:

- [ ] PRD, architecture, MVP, and relevant package instructions were read.
- [ ] The change stays inside the requested scope.
- [ ] Core rules remain in core; adapters contain no duplicate truth logic.
- [ ] Deterministic extraction is used before AI.
- [ ] All untrusted and AI outputs are Zod-validated.
- [ ] New claims include status, scope, epistemic type, evidence, and validity where applicable.
- [ ] Memory has not been promoted directly to truth.
- [ ] Contradictions and historical state are preserved.
- [ ] Secrets and ignored sources are not scanned, logged, or transmitted.
- [ ] Rescans and retries are idempotent.
- [ ] Focused tests and the required full checks pass.
- [ ] The affected real flow was exercised, not only mocked.
- [ ] CLI, MCP, and web show consistent state.
- [ ] No unused dependencies, dead code, debug output, or temporary artifacts remain.
- [ ] Any approved deviation is documented and canonical docs are updated.
- [ ] The final report distinguishes verified behavior from assumptions or deferred work.

The quality bar is simple: every coding agent should receive the same current, evidence-backed project truth, and a developer should be able to inspect why HARIKOS believes it.
