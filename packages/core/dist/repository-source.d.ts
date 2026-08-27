import { type ChangedFile, type RepositoryCommit, type RepositoryEntry, type RepositoryFile, type RepositoryMetadata } from "./domain.js";
export declare function normalizeRepositoryPath(path: string): string;
export declare function isSafeRepositoryPath(path: string): boolean;
export interface RepositorySource {
    getMetadata(): Promise<RepositoryMetadata>;
    getTree(ref?: string): Promise<RepositoryEntry[]>;
    getFile(path: string, ref?: string): Promise<RepositoryFile>;
    getFiles(paths: string[], ref?: string): Promise<RepositoryFile[]>;
    getChangedFiles(base: string, head: string): Promise<ChangedFile[]>;
    getCommit(ref?: string): Promise<RepositoryCommit>;
}
export declare class LocalRepositorySource implements RepositorySource {
    readonly root: string;
    constructor(startPath: string);
    getMetadata(): Promise<RepositoryMetadata>;
    getTree(): Promise<RepositoryEntry[]>;
    getFile(path: string, ref?: string): Promise<RepositoryFile>;
    getFiles(paths: string[], ref?: string): Promise<RepositoryFile[]>;
    getChangedFiles(base: string, head: string): Promise<ChangedFile[]>;
    getCommit(ref?: string): Promise<RepositoryCommit>;
    private resolveFile;
}
export interface GitHubRepositorySourceOptions {
    owner: string;
    repository: string;
    tokenProvider: () => Promise<string>;
    fetcher?: typeof fetch;
    apiBaseUrl?: string;
}
export declare class GitHubRepositorySource implements RepositorySource {
    private readonly options;
    private readonly fetcher;
    private readonly apiBaseUrl;
    constructor(options: GitHubRepositorySourceOptions);
    getMetadata(): Promise<RepositoryMetadata>;
    getTree(ref?: string): Promise<RepositoryEntry[]>;
    getFile(path: string, ref?: string): Promise<RepositoryFile>;
    getFiles(paths: string[], ref?: string): Promise<RepositoryFile[]>;
    getChangedFiles(base: string, head: string): Promise<ChangedFile[]>;
    getCommit(ref?: string): Promise<RepositoryCommit>;
    private get slug();
    private request;
}
//# sourceMappingURL=repository-source.d.ts.map