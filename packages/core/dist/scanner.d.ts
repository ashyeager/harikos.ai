import { type ScannedSource } from "./domain.js";
import type { RepositorySource } from "./repository-source.js";
export interface ScanRepositoryOptions {
    maxFiles?: number;
    clock?: () => Date;
}
export declare function scanRepository(source: RepositorySource, options?: ScanRepositoryOptions): Promise<ScannedSource[]>;
//# sourceMappingURL=scanner.d.ts.map