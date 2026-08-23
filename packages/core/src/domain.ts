import { z } from "zod";

export const truthStatusSchema = z.enum([
  "verified",
  "likely",
  "uncertain",
  "contradicted",
  "stale",
  "superseded",
  "rejected",
]);

export const repositoryMetadataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  owner: z.string().min(1).nullable(),
  defaultBranch: z.string().min(1),
  headSha: z.string().min(1),
  visibility: z.enum(["public", "private", "local"]),
  webUrl: z.string().url().nullable(),
  sourceType: z.enum(["local", "github"]),
});

export const repositoryEntrySchema = z.object({
  path: z.string().min(1),
  type: z.enum(["file", "directory"]),
  size: z.number().int().nonnegative().nullable(),
  sha: z.string().nullable(),
});

export const repositoryFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  contentHash: z.string().min(1),
  size: z.number().int().nonnegative(),
  ref: z.string().min(1),
});

export const changedFileSchema = z.object({
  path: z.string().min(1),
  status: z.enum(["added", "modified", "deleted", "renamed"]),
  previousPath: z.string().min(1).nullable(),
});

export const repositoryCommitSchema = z.object({
  sha: z.string().min(1),
  message: z.string(),
  author: z.string(),
  committedAt: z.string().datetime({ offset: true }),
});

export const sourceKindSchema = z.enum([
  "file",
  "manifest",
  "config",
  "documentation",
  "git_commit",
]);

export const scannedSourceSchema = z.object({
  path: z.string().min(1),
  kind: sourceKindSchema,
  content: z.string(),
  contentHash: z.string().min(1),
  observedAt: z.string().datetime({ offset: true }),
  commitSha: z.string().min(1),
});

export const candidateEvidenceSchema = z.object({
  sourceType: sourceKindSchema,
  path: z.string().min(1),
  contentHash: z.string().min(1),
  commitSha: z.string().min(1),
  lineStart: z.number().int().positive().nullable(),
  lineEnd: z.number().int().positive().nullable(),
  excerpt: z.string().max(600).nullable(),
  authority: z.number().min(0).max(1),
  observedAt: z.string().datetime({ offset: true }),
});

export const candidateClaimSchema = z.object({
  category: z.string().min(1),
  subject: z.string().min(1),
  predicate: z.string().min(1),
  value: z.string().min(1),
  scope: z.string().min(1).nullable(),
  epistemicType: z.enum(["observed", "derived", "inferred", "declared"]),
  claimKind: z.enum(["implementation", "intent"]),
  confidence: z.number().min(0).max(1),
  evidence: z.array(candidateEvidenceSchema).min(1),
});

export const projectTruthClaimSchema = candidateClaimSchema.omit({
  evidence: true,
}).extend({
  id: z.string().min(1),
  status: truthStatusSchema,
  validFrom: z.string().datetime({ offset: true }),
  validTo: z.string().datetime({ offset: true }).nullable(),
  firstSeenAt: z.string().datetime({ offset: true }),
  lastVerifiedAt: z.string().datetime({ offset: true }),
  supersedesClaimId: z.string().min(1).nullable(),
  evidence: z.array(candidateEvidenceSchema),
});

export const truthContradictionSchema = z.object({
  id: z.string().min(1),
  claimAId: z.string().min(1),
  claimBId: z.string().min(1),
  status: z.enum(["open", "resolved"]),
  reason: z.string().min(1),
  resolution: z.string().min(1).nullable(),
  createdAt: z.string().datetime({ offset: true }),
});

export const projectChangeSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  summary: z.string().min(1),
  previousValue: z.string().min(1).nullable(),
  currentValue: z.string().min(1),
  commitSha: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
});

export const projectSnapshotSchema = z.object({
  projectId: z.string().min(1),
  repository: repositoryMetadataSchema,
  scannedAt: z.string().datetime({ offset: true }),
  sourceCount: z.number().int().nonnegative(),
  truths: z.array(projectTruthClaimSchema),
  contradictions: z.array(truthContradictionSchema),
  changes: z.array(projectChangeSchema),
  mode: z.enum(["fixture", "local", "github"]),
});

export const contextPackSchema = z.object({
  task: z.string().min(1),
  generatedAt: z.string().datetime({ offset: true }),
  projectName: z.string().min(1),
  truths: z.array(projectTruthClaimSchema),
  recentChanges: z.array(projectChangeSchema),
  constraints: z.array(z.string()),
  relevantFiles: z.array(z.string()),
  tokenEstimate: z.number().int().nonnegative(),
  text: z.string().min(1),
});

export type RepositoryMetadata = z.infer<typeof repositoryMetadataSchema>;
export type RepositoryEntry = z.infer<typeof repositoryEntrySchema>;
export type RepositoryFile = z.infer<typeof repositoryFileSchema>;
export type ChangedFile = z.infer<typeof changedFileSchema>;
export type RepositoryCommit = z.infer<typeof repositoryCommitSchema>;
export type ScannedSource = z.infer<typeof scannedSourceSchema>;
export type CandidateEvidence = z.infer<typeof candidateEvidenceSchema>;
export type CandidateClaim = z.infer<typeof candidateClaimSchema>;
export type ProjectTruthClaim = z.infer<typeof projectTruthClaimSchema>;
export type TruthContradiction = z.infer<typeof truthContradictionSchema>;
export type ProjectChange = z.infer<typeof projectChangeSchema>;
export type ProjectSnapshot = z.infer<typeof projectSnapshotSchema>;
export type ContextPack = z.infer<typeof contextPackSchema>;
