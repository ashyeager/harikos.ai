import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { z } from "zod";

import { cloudSchema } from "./cloud-schema.js";

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

export type CloudDatabaseConfig = z.infer<typeof cloudDatabaseConfigSchema>;

export interface CloudDatabase {
  db: PostgresJsDatabase<typeof cloudSchema>;
  close(): Promise<void>;
}

function defaultMigrationsFolder(): string {
  const moduleDirectory = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(moduleDirectory, "../drizzle-cloud"),
    resolve(process.cwd(), "packages/db/drizzle-cloud"),
    resolve(process.cwd(), "../../packages/db/drizzle-cloud"),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]!;
}

export function readCloudDatabaseConfig(
  environment: NodeJS.ProcessEnv = process.env,
): CloudDatabaseConfig | undefined {
  const databaseUrl =
    environment.DATABASE_URL?.trim() ||
    environment.POSTGRES_URL?.trim() ||
    environment.POSTGRES_URL_NON_POOLING?.trim();
  if (!databaseUrl) {
    return undefined;
  }

  return cloudDatabaseConfigSchema.parse({ databaseUrl });
}

export async function openCloudDatabase(
  config: CloudDatabaseConfig,
  options: { migrate?: boolean; migrationsFolder?: string } = {},
): Promise<CloudDatabase> {
  const client = postgres(config.databaseUrl, {
    max: config.maxConnections,
    prepare: false,
  });
  const db = drizzle(client, { schema: cloudSchema });

  if (options.migrate) {
    await migrate(db, {
      migrationsFolder: options.migrationsFolder ?? defaultMigrationsFolder(),
    });
  }

  return {
    db,
    close: async () => {
      await client.end({ timeout: 5 });
    },
  };
}
