import { type ProjectSnapshot, type ProjectTruthClaim } from "./domain.js";
import { type RepositorySource } from "./repository-source.js";
export declare function analyzeRepository(source: RepositorySource, previous?: ProjectTruthClaim[], options?: {
    clock?: () => Date;
    mode?: ProjectSnapshot["mode"];
}): Promise<ProjectSnapshot>;
export declare function scanAndPersistLocalProject(projectRoot: string, options?: {
    clock?: () => Date;
}): Promise<ProjectSnapshot>;
//# sourceMappingURL=project-service.d.ts.map