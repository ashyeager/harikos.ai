import { createRequire } from "node:module";
import { resolve } from "node:path";

const requireFromDatabasePackage = createRequire(
  resolve(process.cwd(), "packages/db/package.json"),
);
type SqlClient = {
  (strings: TemplateStringsArray, ...parameters: unknown[]): Promise<unknown[]>;
  begin<T>(callback: (transaction: SqlClient) => Promise<T>): Promise<T>;
  end(options: { timeout: number }): Promise<void>;
};
const postgres = requireFromDatabasePackage("postgres") as (
  url: string,
  options: Record<string, unknown>,
) => SqlClient;

const databaseUrl = process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL is required.");
}

const expectedTables = [
  "agent_connections",
  "agent_sessions",
  "claims",
  "context_packs",
  "contradictions",
  "evidence",
  "memories",
  "outcomes",
  "project_changes",
  "projects",
  "repositories",
  "repository_installations",
  "scans",
  "subscriptions",
  "users",
];

const sql = postgres(databaseUrl, { max: 1, prepare: false });
try {
  const tables = (await sql`
    select tablename, rowsecurity
    from pg_tables
    where schemaname = 'harikos'
    order by tablename
  `) as Array<{ tablename: string; rowsecurity: boolean }>;
  const tableNames = tables.map((table) => table.tablename);
  const missingTables = expectedTables.filter((table) => !tableNames.includes(table));

  const grants = (await sql`
    select grantee, table_name, privilege_type
    from information_schema.role_table_grants
    where table_schema = 'harikos'
      and grantee in ('anon', 'authenticated')
  `) as Array<{ grantee: string; table_name: string; privilege_type: string }>;

  const requiredColumns = (await sql`
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'harikos'
      and (
        (table_name = 'memories' and column_name in ('source_id', 'agent', 'session_id'))
        or (table_name = 'agent_connections' and column_name in ('token_hash', 'token_prefix', 'revoked_at'))
        or (table_name = 'agent_sessions' and column_name in ('project_id', 'agent_connection_id', 'status'))
        or (table_name = 'outcomes' and column_name in ('project_id', 'session_id', 'status'))
      )
  `) as Array<{ table_name: string; column_name: string }>;

  const drizzleMigrations = (await sql`
    select count(*)::int as count from drizzle.__drizzle_migrations
  `) as Array<{ count: number }>;

  let authenticatedRoleBlocked = false;
  try {
    await sql.begin(async (transaction) => {
      await transaction`set local role authenticated`;
      await transaction`select id from harikos.projects limit 1`;
    });
  } catch (error) {
    authenticatedRoleBlocked =
      typeof error === "object" && error !== null && "code" in error && error.code === "42501";
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        expectedTableCount: expectedTables.length,
        actualTableCount: tables.length,
        missingTables,
        rlsEnabledOnEveryTable: tables.every((table) => table.rowsecurity),
        anonOrAuthenticatedTableGrants: grants.length,
        requiredMetadataColumns: requiredColumns.length,
        drizzleMigrationCount: drizzleMigrations[0]?.count ?? 0,
        authenticatedRoleBlocked,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await sql.end({ timeout: 5 });
}
