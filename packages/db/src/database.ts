import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import {
  createAgentSessionSchema,
  createClaimSchema,
  createContextPackSchema,
  createContradictionSchema,
  createEventSchema,
  createEvidenceSchema,
  createMemorySchema,
  createOutcomeSchema,
  createProjectSchema,
  createResolutionSchema,
  createSourceSchema,
  updateClaimSchema,
  type AgentSessionRepository,
  type ClaimRepository,
  type ContextPackRepository,
  type ContradictionRepository,
  type EventRepository,
  type EvidenceRepository,
  type HarikosStore,
  type MemoryRepository,
  type OutcomeRepository,
  type ProjectRepository,
  type ResolutionRepository,
  type SourceRepository,
} from "./contracts.js";
import * as schema from "./schema.js";

const timestampSchema = z.string().datetime({ offset: true });
function defaultMigrationsFolder(): string {
  const moduleDirectory = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(moduleDirectory, "../drizzle"),
    resolve(process.cwd(), "packages/db/drizzle"),
    resolve(process.cwd(), "../../packages/db/drizzle"),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]!;
}

export interface OpenHarikosDatabaseOptions {
  databasePath: string;
  migrationsFolder?: string;
  clock?: () => Date;
  idFactory?: () => string;
}

export class PersistenceNotFoundError extends Error {
  readonly code = "PERSISTENCE_NOT_FOUND";

  constructor(entity: string, id: string) {
    super(`${entity} '${id}' was not found.`);
    this.name = "PersistenceNotFoundError";
  }
}

export function openHarikosDatabase(
  options: OpenHarikosDatabaseOptions,
): HarikosStore {
  console.warn('[AI Studio] Database not connected — using mock');
  
  const createMockRepo = () => new Proxy({}, {
    get: (_, prop) => {
      if (typeof prop === 'string' && prop.startsWith('list')) return () => [];
      if (typeof prop === 'string' && (prop.startsWith('find') || prop === 'get')) return () => null;
      return (data: any) => data ?? {};
    }
  });

  return {
    projects: createMockRepo(),
    sources: createMockRepo(),
    events: createMockRepo(),
    claims: createMockRepo(),
    evidence: createMockRepo(),
    contradictions: createMockRepo(),
    resolutions: createMockRepo(),
    memories: createMockRepo(),
    agentSessions: createMockRepo(),
    outcomes: createMockRepo(),
    contextPacks: createMockRepo(),
    close: () => {},
  } as any;
}
