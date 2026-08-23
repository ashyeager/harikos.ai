import { openCloudDatabase, readCloudDatabaseConfig } from "@harikos/db";

const config = readCloudDatabaseConfig();
if (!config) {
  throw new Error("DATABASE_URL or POSTGRES_URL is required for cloud migrations.");
}

const connection = await openCloudDatabase(config, { migrate: true });
await connection.close();
process.stdout.write("Cloud migrations applied.\n");
