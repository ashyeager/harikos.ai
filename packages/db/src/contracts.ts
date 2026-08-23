import { z } from "zod";

import {
  CLAIM_KINDS,
  CLAIM_STATUSES,
  CONTRADICTION_STATUSES,
  EPISTEMIC_TYPES,
  MEMORY_STATUSES,
  MEMORY_TYPES,
  RESOLUTION_TYPES,
  SOURCE_TYPES,
  type AgentSession,
  type Claim,
  type ContextPack,
  type Contradiction,
  type Event,
  type Evidence,
  type Memory,
  type Outcome,
  type Project,
  type Resolution,
  type Source,
} from "./schema.js";

const idSchema = z.string().min(1);
const nonEmptyStringSchema = z.string().trim().min(1);
const timestampSchema = z.string().datetime({ offset: true });
const nullableTimestampSchema = timestampSchema.nullable().optional();
const jsonSchema = z.json();

export const createProjectSchema = z.object({
  id: idSchema.optional(),
  name: nonEmptyStringSchema,
  path: nonEmptyStringSchema,
  createdAt: timestampSchema.optional(),
  lastScannedAt: nullableTimestampSchema,
});

export const createSourceSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  type: z.enum(SOURCE_TYPES),
  path: z.string().min(1).nullable().optional(),
  contentHash: nonEmptyStringSchema,
  observedAt: timestampSchema.optional(),
  metadata: jsonSchema.default({}),
});

export const createEventSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  type: nonEmptyStringSchema,
  timestamp: timestampSchema.optional(),
  sourceId: idSchema.nullable().optional(),
  payload: jsonSchema.default({}),
});

export const createClaimSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  subject: nonEmptyStringSchema,
  predicate: nonEmptyStringSchema,
  value: jsonSchema,
  scope: z.string().min(1).nullable().optional(),
  status: z.enum(CLAIM_STATUSES),
  epistemicType: z.enum(EPISTEMIC_TYPES),
  claimKind: z.enum(CLAIM_KINDS).default("implementation"),
  confidence: z.number().min(0).max(1),
  validFrom: timestampSchema.optional(),
  validTo: nullableTimestampSchema,
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),
});

export const updateClaimSchema = z.object({
  status: z.enum(CLAIM_STATUSES).optional(),
  confidence: z.number().min(0).max(1).optional(),
  validTo: nullableTimestampSchema,
  updatedAt: timestampSchema.optional(),
});

export const createEvidenceSchema = z.object({
  id: idSchema.optional(),
  claimId: idSchema,
  sourceId: idSchema,
  path: z.string().min(1).nullable().optional(),
  lineStart: z.number().int().positive().nullable().optional(),
  lineEnd: z.number().int().positive().nullable().optional(),
  excerpt: z.string().nullable().optional(),
  strength: z.number().min(0).max(1),
  createdAt: timestampSchema.optional(),
});

export const createContradictionSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  claimAId: idSchema,
  claimBId: idSchema,
  status: z.enum(CONTRADICTION_STATUSES).default("open"),
  reason: nonEmptyStringSchema,
  resolution: z.string().nullable().optional(),
  createdAt: timestampSchema.optional(),
  resolvedAt: nullableTimestampSchema,
});

export const createResolutionSchema = z.object({
  id: idSchema.optional(),
  contradictionId: idSchema,
  resolutionType: z.enum(RESOLUTION_TYPES),
  chosenClaimId: idSchema.nullable().optional(),
  reason: nonEmptyStringSchema,
  actor: nonEmptyStringSchema,
  createdAt: timestampSchema.optional(),
});

export const createMemorySchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  type: z.enum(MEMORY_TYPES),
  content: nonEmptyStringSchema,
  importance: z.number().min(0).max(1).default(0.5),
  status: z.enum(MEMORY_STATUSES).default("active"),
  sourceId: idSchema.nullable().optional(),
  createdAt: timestampSchema.optional(),
});

export const createAgentSessionSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  agent: nonEmptyStringSchema,
  startedAt: timestampSchema.optional(),
  endedAt: nullableTimestampSchema,
  task: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
});

export const createOutcomeSchema = z.object({
  id: idSchema.optional(),
  sessionId: idSchema,
  type: nonEmptyStringSchema,
  result: jsonSchema,
  success: z.boolean(),
  relatedClaimIds: z.array(idSchema).default([]),
  createdAt: timestampSchema.optional(),
});

export const createContextPackSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  task: nonEmptyStringSchema,
  generatedAt: timestampSchema.optional(),
  claims: z.array(jsonSchema).default([]),
  memories: z.array(jsonSchema).default([]),
  files: z.array(z.string()).default([]),
  decisions: z.array(jsonSchema).default([]),
  changes: z.array(jsonSchema).default([]),
  tokenEstimate: z.number().int().nonnegative(),
});

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type CreateSourceInput = z.input<typeof createSourceSchema>;
export type CreateEventInput = z.input<typeof createEventSchema>;
export type CreateClaimInput = z.input<typeof createClaimSchema>;
export type UpdateClaimInput = z.input<typeof updateClaimSchema>;
export type CreateEvidenceInput = z.input<typeof createEvidenceSchema>;
export type CreateContradictionInput = z.input<
  typeof createContradictionSchema
>;
export type CreateResolutionInput = z.input<typeof createResolutionSchema>;
export type CreateMemoryInput = z.input<typeof createMemorySchema>;
export type CreateAgentSessionInput = z.input<
  typeof createAgentSessionSchema
>;
export type CreateOutcomeInput = z.input<typeof createOutcomeSchema>;
export type CreateContextPackInput = z.input<typeof createContextPackSchema>;

export interface ProjectRepository {
  register(input: CreateProjectInput): Project;
  findById(id: string): Project | undefined;
  findByPath(path: string): Project | undefined;
  list(): Project[];
  setLastScannedAt(id: string, timestamp: string | null): Project;
}

export interface SourceRepository {
  create(input: CreateSourceInput): Source;
  findById(id: string): Source | undefined;
  findByIdentity(
    projectId: string,
    type: Source["type"],
    path: string | null,
    contentHash: string,
  ): Source | undefined;
  listByProject(projectId: string): Source[];
}

export interface EventRepository {
  create(input: CreateEventInput): Event;
  listByProject(projectId: string): Event[];
}

export interface ClaimRepository {
  create(input: CreateClaimInput): Claim;
  findById(id: string): Claim | undefined;
  listByProject(projectId: string): Claim[];
  update(id: string, input: UpdateClaimInput): Claim;
}

export interface EvidenceRepository {
  create(input: CreateEvidenceInput): Evidence;
  listByClaim(claimId: string): Evidence[];
}

export interface ContradictionRepository {
  create(input: CreateContradictionInput): Contradiction;
  listByProject(projectId: string): Contradiction[];
}

export interface ResolutionRepository {
  create(input: CreateResolutionInput): Resolution;
  listByContradiction(contradictionId: string): Resolution[];
}

export interface MemoryRepository {
  create(input: CreateMemoryInput): Memory;
  listByProject(projectId: string): Memory[];
}

export interface AgentSessionRepository {
  create(input: CreateAgentSessionInput): AgentSession;
  listByProject(projectId: string): AgentSession[];
}

export interface OutcomeRepository {
  create(input: CreateOutcomeInput): Outcome;
  listBySession(sessionId: string): Outcome[];
}

export interface ContextPackRepository {
  create(input: CreateContextPackInput): ContextPack;
  listByProject(projectId: string): ContextPack[];
}

export interface HarikosStore {
  readonly projects: ProjectRepository;
  readonly sources: SourceRepository;
  readonly events: EventRepository;
  readonly claims: ClaimRepository;
  readonly evidence: EvidenceRepository;
  readonly contradictions: ContradictionRepository;
  readonly resolutions: ResolutionRepository;
  readonly memories: MemoryRepository;
  readonly agentSessions: AgentSessionRepository;
  readonly outcomes: OutcomeRepository;
  readonly contextPacks: ContextPackRepository;
  close(): void;
}
