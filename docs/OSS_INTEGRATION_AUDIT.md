# OSS Intelligence Audit

Audit status: baseline integrations completed without importing third-party source.

| System | Decision | Current HARIKOS equivalent | Reason |
|---|---|---|---|
| Tree-sitter | REFERENCE | Deterministic TypeScript/JavaScript analyzers | Structural parsing remains a candidate for a later measured improvement; no native parser dependency is required for the current Vercel baseline. |
| Aider repo-map | ADAPTED | Scanner priority ranking and bounded Context Packs | HARIKOS adapts the useful principles of high-signal file ranking, relevance scoring, and bounded context selection without importing the coding assistant. |
| CodeGraph | REJECT FOR MVP | RepositorySource plus bounded rescans | A persistent graph/worker does not fit the Vercel MVP boundary yet. Revisit for selective reverification after baseline benchmarks. |
| projectmem | ADAPTED | Structured Memory, AgentSession, Outcome model | HARIKOS uses the event/history pattern for attempts, failures, decisions, and outcomes; Truth remains independently evidence-authoritative. |
| Qarinah | ADAPTED | Context Pack, provenance, supersession-aware retrieval | HARIKOS applies the useful cross-agent context and provenance concepts while retaining its own domain model. |
| Mem0 | REJECT FOR MVP | PostgreSQL structured Memory and text filtering | A vector or extra service would add infrastructure without evidence of better project handoff for the current MVP. |

## Required verification before integration

For any future dependency, inspect the exact upstream commit/tag, current license, install scripts, network behavior, filesystem behavior, native runtime requirements, Vercel compatibility, and maintenance status. Record the result here and in `THIRD_PARTY_NOTICES.md` before shipping imported code.

## Current conclusion

No third-party source is copied into this repository. Aider-style bounded ranking, projectmem-style structured history, and Qarinah-style provenance/context separation are adapted as internal implementations. Tree-sitter and CodeGraph remain references because a native parser or persistent graph would add deployment/runtime cost without a measured MVP benefit; Mem0 is rejected because it would duplicate structured Memory and add unnecessary infrastructure.
