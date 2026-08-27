import { z } from "zod";
import { CLAIM_KINDS, CLAIM_STATUSES, CONTRADICTION_STATUSES, EPISTEMIC_TYPES, MEMORY_STATUSES, MEMORY_TYPES, RESOLUTION_TYPES, SOURCE_TYPES, } from "./schema.js";
const idSchema = z.string().min(1);
const nonEmptyStringSchema = z.string().trim().min(1);
const timestampSchema = z.string().datetime({ offset: true });
const nullableTimestampSchema = timestampSchema.nullable().optional();
const jsonSchema = z.any();
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
//# sourceMappingURL=contracts.js.map