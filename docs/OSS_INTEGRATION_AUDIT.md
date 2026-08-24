# OSS Intelligence Audit

Audit status: reference-level review before adding third-party intelligence dependencies.

| System | Decision | Current HARIKOS equivalent | Reason |
|---|---|---|---|
| Tree-sitter | DEFER | Deterministic TypeScript/JavaScript analyzers | Structural parsing could improve symbols, but adding native parser packages needs a measured language/latency benefit first. |
| Aider repo-map | ADAPT LATER | Scanner priority ranking and bounded Context Packs | Token-budgeted symbol ranking is useful; adapt the algorithm behind HARIKOS interfaces rather than importing the coding assistant. |
| CodeGraph | REJECT FOR MVP | RepositorySource plus bounded rescans | A persistent graph/worker does not fit the Vercel MVP boundary yet. Revisit for selective reverification after baseline benchmarks. |
| projectmem | ADAPT | Structured Memory, AgentSession, Outcome model | Its event/history concepts match the product, but HARIKOS Truth remains independently evidence-authoritative. |
| Qarinah | REFERENCE ONLY | Context Pack and evidence provenance | Useful conceptual overlap; no dependency is justified before measuring retrieval quality and license/maintenance fit. |
| Mem0 | REJECT FOR MVP | PostgreSQL structured Memory and text filtering | A vector or extra service would add infrastructure without evidence of better project handoff for the current MVP. |

## Required verification before integration

For any future dependency, inspect the exact upstream commit/tag, current license, install scripts, network behavior, filesystem behavior, native runtime requirements, Vercel compatibility, and maintenance status. Record the result here and in `THIRD_PARTY_NOTICES.md` before shipping imported code.

## Current conclusion

No OSS package is added by this pass. The existing deterministic analyzer, Truth Resolver, structured Memory model, and Context engine remain the authoritative baseline. Benchmark first; augment only where a measurable reduction in stale claims, context size, analysis latency, or agent rediscovery is demonstrated.
