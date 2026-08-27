import { type ContextPack, type ProjectSnapshot } from "./domain.js";
export declare function composeContextPack(snapshot: ProjectSnapshot, task: string, clock?: () => Date, memories?: Array<{
    type: string;
    content: string;
    status?: string;
}>): ContextPack;
export declare function explainProjectTruth(snapshot: ProjectSnapshot, question: string, mode?: "simple" | "technical" | "evidence"): string;
//# sourceMappingURL=context-pack.d.ts.map