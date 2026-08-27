import { z } from "zod";
export declare const githubAppConfigSchema: z.ZodObject<{
    appId: z.ZodString;
    privateKey: z.ZodEffects<z.ZodString, string, string>;
    slug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    appId?: string;
    privateKey?: string;
    slug?: string;
}, {
    appId?: string;
    privateKey?: string;
    slug?: string;
}>;
export type GitHubAppConfig = z.infer<typeof githubAppConfigSchema>;
export declare const githubInstallationSchema: z.ZodObject<{
    id: z.ZodNumber;
    account: z.ZodObject<{
        id: z.ZodNumber;
        login: z.ZodString;
        type: z.ZodEnum<["User", "Organization"]>;
    }, "strip", z.ZodTypeAny, {
        type?: "User" | "Organization";
        id?: number;
        login?: string;
    }, {
        type?: "User" | "Organization";
        id?: number;
        login?: string;
    }>;
    repository_selection: z.ZodEnum<["all", "selected"]>;
    suspended_at: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id?: number;
    account?: {
        type?: "User" | "Organization";
        id?: number;
        login?: string;
    };
    repository_selection?: "all" | "selected";
    suspended_at?: string;
}, {
    id?: number;
    account?: {
        type?: "User" | "Organization";
        id?: number;
        login?: string;
    };
    repository_selection?: "all" | "selected";
    suspended_at?: string;
}>;
export type GitHubInstallation = z.infer<typeof githubInstallationSchema>;
declare const installationRepositoriesSchema: z.ZodObject<{
    repositories: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        private: z.ZodBoolean;
        default_branch: z.ZodString;
        owner: z.ZodObject<{
            login: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            login?: string;
        }, {
            login?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        id?: number;
        name?: string;
        private?: boolean;
        default_branch?: string;
        owner?: {
            login?: string;
        };
    }, {
        id?: number;
        name?: string;
        private?: boolean;
        default_branch?: string;
        owner?: {
            login?: string;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    repositories?: {
        id?: number;
        name?: string;
        private?: boolean;
        default_branch?: string;
        owner?: {
            login?: string;
        };
    }[];
}, {
    repositories?: {
        id?: number;
        name?: string;
        private?: boolean;
        default_branch?: string;
        owner?: {
            login?: string;
        };
    }[];
}>;
export type GitHubInstallationRepository = z.infer<typeof installationRepositoriesSchema>["repositories"][number];
export declare function readGitHubAppConfig(environment?: NodeJS.ProcessEnv): GitHubAppConfig | undefined;
export declare function createGitHubAppJwt(config: GitHubAppConfig, now?: number): string;
export declare function createGitHubInstallationToken(config: GitHubAppConfig, installationId: string, options?: {
    repositoryId?: string;
    fetcher?: typeof fetch;
}): Promise<{
    token: string;
    expiresAt: string;
}>;
export declare function getGitHubInstallation(config: GitHubAppConfig, installationId: string, fetcher?: typeof fetch): Promise<GitHubInstallation>;
export declare function listGitHubInstallationRepositories(config: GitHubAppConfig, installationId: string, fetcher?: typeof fetch): Promise<GitHubInstallationRepository[]>;
export {};
//# sourceMappingURL=github-app.d.ts.map