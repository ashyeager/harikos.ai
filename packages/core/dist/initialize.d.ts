import { type Project } from "@harikos/db";
import { z } from "zod";
export declare const HARIKOS_STATE_DIRECTORY = ".harikos";
export declare const HARIKOS_CONFIG_FILE = "config.json";
export declare const HARIKOS_DATABASE_FILE = "project.db";
export declare const HARIKOS_GITIGNORE_ENTRY = ".harikos/";
export declare const harikosConfigSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    projectId: z.ZodString;
    projectName: z.ZodString;
    projectRoot: z.ZodString;
    databasePath: z.ZodLiteral<".harikos/project.db">;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt?: string;
    projectId?: string;
    projectName?: string;
    version?: 1;
    projectRoot?: string;
    databasePath?: ".harikos/project.db";
}, {
    createdAt?: string;
    projectId?: string;
    projectName?: string;
    version?: 1;
    projectRoot?: string;
    databasePath?: ".harikos/project.db";
}>;
export type HarikosConfig = z.infer<typeof harikosConfigSchema>;
export interface InitializeProjectOptions {
    cwd?: string;
    clock?: () => Date;
    idFactory?: () => string;
    migrationsFolder?: string;
}
export interface InitializeProjectResult {
    project: Project;
    config: HarikosConfig;
    projectRoot: string;
    stateDirectory: string;
    configPath: string;
    databasePath: string;
    created: boolean;
    gitIgnoreUpdated: boolean;
}
export type InitializationErrorCode = "INVALID_CONFIG" | "STATE_PROJECT_MISMATCH";
export declare class InitializationError extends Error {
    readonly code: InitializationErrorCode;
    constructor(code: InitializationErrorCode, message: string, options?: ErrorOptions);
}
export declare function initializeProject(options?: InitializeProjectOptions): InitializeProjectResult;
//# sourceMappingURL=initialize.d.ts.map