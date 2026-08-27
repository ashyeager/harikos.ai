export type ProjectRootErrorCode = "GIT_UNAVAILABLE" | "INVALID_START_PATH" | "NOT_GIT_REPOSITORY" | "INVALID_GIT_ROOT";
export declare class ProjectRootError extends Error {
    readonly code: ProjectRootErrorCode;
    constructor(code: ProjectRootErrorCode, message: string, options?: ErrorOptions);
}
export declare function findProjectRoot(startPath?: string): string;
//# sourceMappingURL=project-root.d.ts.map