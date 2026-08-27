import { z } from "zod";
export declare const cloudDatabaseConfigSchema: z.ZodObject<{
    databaseUrl: z.ZodString;
    maxConnections: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type CloudDatabaseConfig = z.infer<typeof cloudDatabaseConfigSchema>;
export interface CloudDatabase {
    db: any;
    close(): Promise<void>;
}
export declare function readCloudDatabaseConfig(environment?: NodeJS.ProcessEnv): CloudDatabaseConfig | undefined;
export declare function openCloudDatabase(config: CloudDatabaseConfig, options?: {
    migrate?: boolean;
    migrationsFolder?: string;
}): Promise<CloudDatabase>;
//# sourceMappingURL=postgres.d.ts.map