import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";

import {
  openHarikosDatabase,
  type OpenHarikosDatabaseOptions,
  type Project,
} from "@harikos/db";
import { z } from "zod";

import { findProjectRoot } from "./project-root.js";

export const HARIKOS_STATE_DIRECTORY = ".harikos";
export const HARIKOS_CONFIG_FILE = "config.json";
export const HARIKOS_DATABASE_FILE = "project.db";
export const HARIKOS_GITIGNORE_ENTRY = ".harikos/";

export const harikosConfigSchema = z.object({
  version: z.literal(1),
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  projectRoot: z.string().min(1),
  databasePath: z.literal(".harikos/project.db"),
  createdAt: z.string().datetime({ offset: true }),
});

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

export type InitializationErrorCode =
  | "INVALID_CONFIG"
  | "STATE_PROJECT_MISMATCH";

export class InitializationError extends Error {
  constructor(
    readonly code: InitializationErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "InitializationError";
  }
}

function readExistingConfig(configPath: string): HarikosConfig | undefined {
  if (!existsSync(configPath)) {
    return undefined;
  }

  try {
    const value: unknown = JSON.parse(readFileSync(configPath, "utf8"));
    return harikosConfigSchema.parse(value);
  } catch (error) {
    throw new InitializationError(
      "INVALID_CONFIG",
      `HARIKOS config '${configPath}' is invalid. Fix or remove it before retrying initialization.`,
      { cause: error },
    );
  }
}

function writeConfigAtomically(
  configPath: string,
  config: HarikosConfig,
): void {
  const temporaryPath = `${configPath}.tmp`;
  const contents = `${JSON.stringify(config, null, 2)}\n`;

  try {
    writeFileSync(temporaryPath, contents, {
      encoding: "utf8",
      flag: "wx",
    });
    renameSync(temporaryPath, configPath);
  } catch (error) {
    if (existsSync(temporaryPath)) {
      unlinkSync(temporaryPath);
    }
    throw error;
  }
}

function ensureGitIgnore(projectRoot: string): boolean {
  const gitIgnorePath = join(projectRoot, ".gitignore");
  const existing = existsSync(gitIgnorePath)
    ? readFileSync(gitIgnorePath, "utf8")
    : "";
  const entries = existing.split(/\r?\n/u).map((line) => line.trim());

  if (entries.includes(HARIKOS_GITIGNORE_ENTRY)) {
    return false;
  }

  const separator = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
  writeFileSync(
    gitIgnorePath,
    `${existing}${separator}${HARIKOS_GITIGNORE_ENTRY}\n`,
    "utf8",
  );
  return true;
}

export function initializeProject(
  options: InitializeProjectOptions = {},
): InitializeProjectResult {
  const projectRoot = findProjectRoot(options.cwd);
  const stateDirectory = join(projectRoot, HARIKOS_STATE_DIRECTORY);
  const configPath = join(stateDirectory, HARIKOS_CONFIG_FILE);
  const databasePath = join(stateDirectory, HARIKOS_DATABASE_FILE);

  mkdirSync(stateDirectory, { recursive: true });
  const gitIgnoreUpdated = ensureGitIgnore(projectRoot);
  const existingConfig = readExistingConfig(configPath);

  if (existingConfig && existingConfig.projectRoot !== projectRoot) {
    throw new InitializationError(
      "STATE_PROJECT_MISMATCH",
      `HARIKOS state belongs to '${existingConfig.projectRoot}', not '${projectRoot}'.`,
    );
  }

  const databaseOptions: OpenHarikosDatabaseOptions = {
    databasePath,
    ...(options.clock ? { clock: options.clock } : {}),
    ...(options.idFactory ? { idFactory: options.idFactory } : {}),
    ...(options.migrationsFolder
      ? { migrationsFolder: options.migrationsFolder }
      : {}),
  };
  const store = openHarikosDatabase(databaseOptions);

  try {
    const project = store.projects.register({
      ...(existingConfig ? { id: existingConfig.projectId } : {}),
      name: existingConfig?.projectName ?? basename(projectRoot),
      path: projectRoot,
      ...(existingConfig ? { createdAt: existingConfig.createdAt } : {}),
    });

    if (existingConfig && existingConfig.projectId !== project.id) {
      throw new InitializationError(
        "STATE_PROJECT_MISMATCH",
        `HARIKOS config references project '${existingConfig.projectId}', but the database registered '${project.id}'.`,
      );
    }

    const config =
      existingConfig ??
      harikosConfigSchema.parse({
        version: 1,
        projectId: project.id,
        projectName: project.name,
        projectRoot,
        databasePath: ".harikos/project.db",
        createdAt: project.createdAt,
      });

    if (!existingConfig) {
      writeConfigAtomically(configPath, config);
    }

    return {
      project,
      config,
      projectRoot,
      stateDirectory,
      configPath,
      databasePath,
      created: existingConfig === undefined,
      gitIgnoreUpdated,
    };
  } finally {
    store.close();
  }
}
