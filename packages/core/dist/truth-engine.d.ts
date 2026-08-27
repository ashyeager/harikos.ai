import { type CandidateClaim, type ProjectChange, type ProjectTruthClaim, type TruthContradiction } from "./domain.js";
export interface TruthResolution {
    truths: ProjectTruthClaim[];
    contradictions: TruthContradiction[];
    changes: ProjectChange[];
}
export declare function resolveTruth(previousTruths: ProjectTruthClaim[], candidates: CandidateClaim[], at?: string, commitSha?: string): TruthResolution;
//# sourceMappingURL=truth-engine.d.ts.map