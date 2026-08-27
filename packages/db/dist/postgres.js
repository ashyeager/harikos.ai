import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
const databaseUrlSchema = z
    .string()
    .url()
    .refine((value) => value.startsWith("postgres://") || value.startsWith("postgresql://"), {
    message: "DATABASE_URL must use postgres:// or postgresql://.",
});
export const cloudDatabaseConfigSchema = z.object({
    databaseUrl: databaseUrlSchema,
    maxConnections: z.number().int().min(1).max(20).default(5),
});
function defaultMigrationsFolder() {
    const moduleDirectory = dirname(fileURLToPath(import.meta.url));
    const candidates = [
        resolve(moduleDirectory, "../drizzle-cloud"),
        resolve(process.cwd(), "packages/db/drizzle-cloud"),
        resolve(process.cwd(), "../../packages/db/drizzle-cloud"),
    ];
    return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}
export function readCloudDatabaseConfig(environment = process.env) {
    const databaseUrl = environment.DATABASE_URL?.trim() || environment.POSTGRES_URL?.trim();
    if (!databaseUrl) {
        return undefined;
    }
    return cloudDatabaseConfigSchema.parse({ databaseUrl });
}
export async function openCloudDatabase(config, options = {}) {
    console.warn('[AI Studio] Database not connected — using mock');
    const noOp = { findMany: async () => [], findFirst: async () => null,
        findUnique: async () => null, create: async (d) => d?.data ?? {},
        update: async (d) => d?.data ?? {}, delete: async () => ({}) };
    const db = new Proxy({}, {
        get: (_, prop) => prop === 'query'
            ? new Proxy({}, { get: () => noOp }) : async () => [],
    });
    const client = { end: async () => { } };
    return {
        db,
        close: async () => { },
    };
}
//# sourceMappingURL=postgres.js.map