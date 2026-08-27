import { z } from "zod";
import { type AgentSession, type Claim, type ContextPack, type Contradiction, type Event, type Evidence, type Memory, type Outcome, type Project, type Resolution, type Source } from "./schema.js";
export declare const createProjectSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    path: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    lastScannedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createSourceSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    type: z.ZodEnum<{
        github: "github";
        mcp: "mcp";
        manual: "manual";
    }>;
    path: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contentHash: z.ZodString;
    observedAt: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodAny>;
}, z.core.$strip>;
export declare const createEventSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    type: z.ZodString;
    timestamp: z.ZodOptional<z.ZodString>;
    sourceId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    payload: z.ZodDefault<z.ZodAny>;
}, z.core.$strip>;
export declare const createClaimSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    subject: z.ZodString;
    predicate: z.ZodString;
    value: z.ZodAny;
    scope: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodEnum<{
        active: "active";
        superseded: "superseded";
        contradicted: "contradicted";
    }>;
    epistemicType: z.ZodEnum<{
        fact: "fact";
        inference: "inference";
        assumption: "assumption";
    }>;
    claimKind: z.ZodDefault<z.ZodEnum<{
        implementation: "implementation";
        intention: "intention";
        constraint: "constraint";
        architecture: "architecture";
    }>>;
    confidence: z.ZodNumber;
    validFrom: z.ZodOptional<z.ZodString>;
    validTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateClaimSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        superseded: "superseded";
        contradicted: "contradicted";
    }>>;
    confidence: z.ZodOptional<z.ZodNumber>;
    validTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createEvidenceSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    claimId: z.ZodString;
    sourceId: z.ZodString;
    path: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lineStart: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    lineEnd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    excerpt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    strength: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createContradictionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    claimAId: z.ZodString;
    claimBId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<{
        open: "open";
        resolved: "resolved";
    }>>;
    reason: z.ZodString;
    resolution: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodString>;
    resolvedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createResolutionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    contradictionId: z.ZodString;
    resolutionType: z.ZodEnum<{
        override: "override";
        merge: "merge";
        discard: "discard";
    }>;
    chosenClaimId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reason: z.ZodString;
    actor: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createMemorySchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    type: z.ZodEnum<{
        constraint: "constraint";
        decision: "decision";
        attempt: "attempt";
        failed_attempt: "failed_attempt";
        fix: "fix";
        bug: "bug";
        root_cause: "root_cause";
        discovery: "discovery";
        outcome: "outcome";
        incident: "incident";
        note: "note";
    }>;
    content: z.ZodString;
    importance: z.ZodDefault<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<{
        active: "active";
        superseded: "superseded";
        archived: "archived";
    }>>;
    sourceId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createAgentSessionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    agent: z.ZodString;
    startedAt: z.ZodOptional<z.ZodString>;
    endedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    task: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createOutcomeSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodString;
    type: z.ZodString;
    result: z.ZodAny;
    success: z.ZodBoolean;
    relatedClaimIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createContextPackSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    projectId: z.ZodString;
    task: z.ZodString;
    generatedAt: z.ZodOptional<z.ZodString>;
    claims: z.ZodDefault<z.ZodArray<z.ZodAny>>;
    memories: z.ZodDefault<z.ZodArray<z.ZodAny>>;
    files: z.ZodDefault<z.ZodArray<z.ZodString>>;
    decisions: z.ZodDefault<z.ZodArray<z.ZodAny>>;
    changes: z.ZodDefault<z.ZodArray<z.ZodAny>>;
    tokenEstimate: z.ZodNumber;
}, z.core.$strip>;
export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type CreateSourceInput = z.input<typeof createSourceSchema>;
export type CreateEventInput = z.input<typeof createEventSchema>;
export type CreateClaimInput = z.input<typeof createClaimSchema>;
export type UpdateClaimInput = z.input<typeof updateClaimSchema>;
export type CreateEvidenceInput = z.input<typeof createEvidenceSchema>;
export type CreateContradictionInput = z.input<typeof createContradictionSchema>;
export type CreateResolutionInput = z.input<typeof createResolutionSchema>;
export type CreateMemoryInput = z.input<typeof createMemorySchema>;
export type CreateAgentSessionInput = z.input<typeof createAgentSessionSchema>;
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
    findByIdentity(projectId: string, type: Source["type"], path: string | null, contentHash: string): Source | undefined;
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
//# sourceMappingURL=contracts.d.ts.map