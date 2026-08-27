import { z } from "zod";
export declare const truthStatusSchema: z.ZodEnum<["verified", "likely", "uncertain", "contradicted", "stale", "superseded", "rejected"]>;
export declare const repositoryMetadataSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    owner: z.ZodNullable<z.ZodString>;
    defaultBranch: z.ZodString;
    headSha: z.ZodString;
    visibility: z.ZodEnum<["public", "private", "local"]>;
    webUrl: z.ZodNullable<z.ZodString>;
    sourceType: z.ZodEnum<["local", "github"]>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    owner?: string;
    defaultBranch?: string;
    headSha?: string;
    visibility?: "local" | "private" | "public";
    webUrl?: string;
    sourceType?: "local" | "github";
}, {
    id?: string;
    name?: string;
    owner?: string;
    defaultBranch?: string;
    headSha?: string;
    visibility?: "local" | "private" | "public";
    webUrl?: string;
    sourceType?: "local" | "github";
}>;
export declare const repositoryEntrySchema: z.ZodObject<{
    path: z.ZodString;
    type: z.ZodEnum<["file", "directory"]>;
    size: z.ZodNullable<z.ZodNumber>;
    sha: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path?: string;
    type?: "file" | "directory";
    size?: number;
    sha?: string;
}, {
    path?: string;
    type?: "file" | "directory";
    size?: number;
    sha?: string;
}>;
export declare const repositoryFileSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
    contentHash: z.ZodString;
    size: z.ZodNumber;
    ref: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path?: string;
    size?: number;
    content?: string;
    contentHash?: string;
    ref?: string;
}, {
    path?: string;
    size?: number;
    content?: string;
    contentHash?: string;
    ref?: string;
}>;
export declare const changedFileSchema: z.ZodObject<{
    path: z.ZodString;
    status: z.ZodEnum<["added", "modified", "deleted", "renamed"]>;
    previousPath: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "added" | "modified" | "deleted" | "renamed";
    path?: string;
    previousPath?: string;
}, {
    status?: "added" | "modified" | "deleted" | "renamed";
    path?: string;
    previousPath?: string;
}>;
export declare const repositoryCommitSchema: z.ZodObject<{
    sha: z.ZodString;
    message: z.ZodString;
    author: z.ZodString;
    committedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message?: string;
    sha?: string;
    author?: string;
    committedAt?: string;
}, {
    message?: string;
    sha?: string;
    author?: string;
    committedAt?: string;
}>;
export declare const sourceKindSchema: z.ZodEnum<["file", "manifest", "config", "documentation", "git_commit"]>;
export declare const scannedSourceSchema: z.ZodObject<{
    path: z.ZodString;
    kind: z.ZodEnum<["file", "manifest", "config", "documentation", "git_commit"]>;
    content: z.ZodString;
    contentHash: z.ZodString;
    observedAt: z.ZodString;
    commitSha: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path?: string;
    content?: string;
    contentHash?: string;
    kind?: "file" | "manifest" | "config" | "documentation" | "git_commit";
    observedAt?: string;
    commitSha?: string;
}, {
    path?: string;
    content?: string;
    contentHash?: string;
    kind?: "file" | "manifest" | "config" | "documentation" | "git_commit";
    observedAt?: string;
    commitSha?: string;
}>;
export declare const candidateEvidenceSchema: z.ZodObject<{
    sourceType: z.ZodEnum<["file", "manifest", "config", "documentation", "git_commit"]>;
    path: z.ZodString;
    contentHash: z.ZodString;
    commitSha: z.ZodString;
    lineStart: z.ZodNullable<z.ZodNumber>;
    lineEnd: z.ZodNullable<z.ZodNumber>;
    excerpt: z.ZodNullable<z.ZodString>;
    authority: z.ZodNumber;
    observedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path?: string;
    sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
    contentHash?: string;
    observedAt?: string;
    commitSha?: string;
    lineStart?: number;
    lineEnd?: number;
    excerpt?: string;
    authority?: number;
}, {
    path?: string;
    sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
    contentHash?: string;
    observedAt?: string;
    commitSha?: string;
    lineStart?: number;
    lineEnd?: number;
    excerpt?: string;
    authority?: number;
}>;
export declare const candidateClaimSchema: z.ZodObject<{
    category: z.ZodString;
    subject: z.ZodString;
    predicate: z.ZodString;
    value: z.ZodString;
    scope: z.ZodNullable<z.ZodString>;
    epistemicType: z.ZodEnum<["observed", "derived", "inferred", "declared"]>;
    claimKind: z.ZodEnum<["implementation", "intent"]>;
    confidence: z.ZodNumber;
    evidence: z.ZodArray<z.ZodObject<{
        sourceType: z.ZodEnum<["file", "manifest", "config", "documentation", "git_commit"]>;
        path: z.ZodString;
        contentHash: z.ZodString;
        commitSha: z.ZodString;
        lineStart: z.ZodNullable<z.ZodNumber>;
        lineEnd: z.ZodNullable<z.ZodNumber>;
        excerpt: z.ZodNullable<z.ZodString>;
        authority: z.ZodNumber;
        observedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path?: string;
        sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
        contentHash?: string;
        observedAt?: string;
        commitSha?: string;
        lineStart?: number;
        lineEnd?: number;
        excerpt?: string;
        authority?: number;
    }, {
        path?: string;
        sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
        contentHash?: string;
        observedAt?: string;
        commitSha?: string;
        lineStart?: number;
        lineEnd?: number;
        excerpt?: string;
        authority?: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    value?: string;
    category?: string;
    subject?: string;
    predicate?: string;
    scope?: string;
    epistemicType?: "observed" | "derived" | "inferred" | "declared";
    claimKind?: "implementation" | "intent";
    confidence?: number;
    evidence?: {
        path?: string;
        sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
        contentHash?: string;
        observedAt?: string;
        commitSha?: string;
        lineStart?: number;
        lineEnd?: number;
        excerpt?: string;
        authority?: number;
    }[];
}, {
    value?: string;
    category?: string;
    subject?: string;
    predicate?: string;
    scope?: string;
    epistemicType?: "observed" | "derived" | "inferred" | "declared";
    claimKind?: "implementation" | "intent";
    confidence?: number;
    evidence?: {
        path?: string;
        sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
        contentHash?: string;
        observedAt?: string;
        commitSha?: string;
        lineStart?: number;
        lineEnd?: number;
        excerpt?: string;
        authority?: number;
    }[];
}>;
export declare const projectTruthClaimSchema: z.ZodObject<Omit<{
    category: z.ZodString;
    subject: z.ZodString;
    predicate: z.ZodString;
    value: z.ZodString;
    scope: z.ZodNullable<z.ZodString>;
    epistemicType: z.ZodEnum<["observed", "derived", "inferred", "declared"]>;
    claimKind: z.ZodEnum<["implementation", "intent"]>;
    confidence: z.ZodNumber;
    evidence: z.ZodArray<z.ZodObject<{
        sourceType: z.ZodEnum<["file", "manifest", "config", "documentation", "git_commit"]>;
        path: z.ZodString;
        contentHash: z.ZodString;
        commitSha: z.ZodString;
        lineStart: z.ZodNullable<z.ZodNumber>;
        lineEnd: z.ZodNullable<z.ZodNumber>;
        excerpt: z.ZodNullable<z.ZodString>;
        authority: z.ZodNumber;
        observedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path?: string;
        sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
        contentHash?: string;
        observedAt?: string;
        commitSha?: string;
        lineStart?: number;
        lineEnd?: number;
        excerpt?: string;
        authority?: number;
    }, {
        path?: string;
        sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
        contentHash?: string;
        observedAt?: string;
        commitSha?: string;
        lineStart?: number;
        lineEnd?: number;
        excerpt?: string;
        authority?: number;
    }>, "many">;
}, "evidence"> & {
    id: z.ZodString;
    status: z.ZodEnum<["verified", "likely", "uncertain", "contradicted", "stale", "superseded", "rejected"]>;
    validFrom: z.ZodString;
    validTo: z.ZodNullable<z.ZodString>;
    firstSeenAt: z.ZodString;
    lastVerifiedAt: z.ZodString;
    supersedesClaimId: z.ZodNullable<z.ZodString>;
    evidence: z.ZodArray<z.ZodObject<{
        sourceType: z.ZodEnum<["file", "manifest", "config", "documentation", "git_commit"]>;
        path: z.ZodString;
        contentHash: z.ZodString;
        commitSha: z.ZodString;
        lineStart: z.ZodNullable<z.ZodNumber>;
        lineEnd: z.ZodNullable<z.ZodNumber>;
        excerpt: z.ZodNullable<z.ZodString>;
        authority: z.ZodNumber;
        observedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path?: string;
        sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
        contentHash?: string;
        observedAt?: string;
        commitSha?: string;
        lineStart?: number;
        lineEnd?: number;
        excerpt?: string;
        authority?: number;
    }, {
        path?: string;
        sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
        contentHash?: string;
        observedAt?: string;
        commitSha?: string;
        lineStart?: number;
        lineEnd?: number;
        excerpt?: string;
        authority?: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    status?: "verified" | "likely" | "uncertain" | "contradicted" | "stale" | "superseded" | "rejected";
    value?: string;
    id?: string;
    category?: string;
    subject?: string;
    predicate?: string;
    scope?: string;
    epistemicType?: "observed" | "derived" | "inferred" | "declared";
    claimKind?: "implementation" | "intent";
    confidence?: number;
    evidence?: {
        path?: string;
        sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
        contentHash?: string;
        observedAt?: string;
        commitSha?: string;
        lineStart?: number;
        lineEnd?: number;
        excerpt?: string;
        authority?: number;
    }[];
    validFrom?: string;
    validTo?: string;
    firstSeenAt?: string;
    lastVerifiedAt?: string;
    supersedesClaimId?: string;
}, {
    status?: "verified" | "likely" | "uncertain" | "contradicted" | "stale" | "superseded" | "rejected";
    value?: string;
    id?: string;
    category?: string;
    subject?: string;
    predicate?: string;
    scope?: string;
    epistemicType?: "observed" | "derived" | "inferred" | "declared";
    claimKind?: "implementation" | "intent";
    confidence?: number;
    evidence?: {
        path?: string;
        sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
        contentHash?: string;
        observedAt?: string;
        commitSha?: string;
        lineStart?: number;
        lineEnd?: number;
        excerpt?: string;
        authority?: number;
    }[];
    validFrom?: string;
    validTo?: string;
    firstSeenAt?: string;
    lastVerifiedAt?: string;
    supersedesClaimId?: string;
}>;
export declare const truthContradictionSchema: z.ZodObject<{
    id: z.ZodString;
    claimAId: z.ZodString;
    claimBId: z.ZodString;
    status: z.ZodEnum<["open", "resolved"]>;
    reason: z.ZodString;
    resolution: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status?: "open" | "resolved";
    createdAt?: string;
    id?: string;
    claimAId?: string;
    claimBId?: string;
    reason?: string;
    resolution?: string;
}, {
    status?: "open" | "resolved";
    createdAt?: string;
    id?: string;
    claimAId?: string;
    claimBId?: string;
    reason?: string;
    resolution?: string;
}>;
export declare const projectChangeSchema: z.ZodObject<{
    id: z.ZodString;
    category: z.ZodString;
    summary: z.ZodString;
    previousValue: z.ZodNullable<z.ZodString>;
    currentValue: z.ZodString;
    commitSha: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt?: string;
    id?: string;
    commitSha?: string;
    category?: string;
    summary?: string;
    previousValue?: string;
    currentValue?: string;
}, {
    createdAt?: string;
    id?: string;
    commitSha?: string;
    category?: string;
    summary?: string;
    previousValue?: string;
    currentValue?: string;
}>;
export declare const projectSnapshotSchema: z.ZodObject<{
    projectId: z.ZodString;
    repository: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        owner: z.ZodNullable<z.ZodString>;
        defaultBranch: z.ZodString;
        headSha: z.ZodString;
        visibility: z.ZodEnum<["public", "private", "local"]>;
        webUrl: z.ZodNullable<z.ZodString>;
        sourceType: z.ZodEnum<["local", "github"]>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        owner?: string;
        defaultBranch?: string;
        headSha?: string;
        visibility?: "local" | "private" | "public";
        webUrl?: string;
        sourceType?: "local" | "github";
    }, {
        id?: string;
        name?: string;
        owner?: string;
        defaultBranch?: string;
        headSha?: string;
        visibility?: "local" | "private" | "public";
        webUrl?: string;
        sourceType?: "local" | "github";
    }>;
    scannedAt: z.ZodString;
    sourceCount: z.ZodNumber;
    truths: z.ZodArray<z.ZodObject<Omit<{
        category: z.ZodString;
        subject: z.ZodString;
        predicate: z.ZodString;
        value: z.ZodString;
        scope: z.ZodNullable<z.ZodString>;
        epistemicType: z.ZodEnum<["observed", "derived", "inferred", "declared"]>;
        claimKind: z.ZodEnum<["implementation", "intent"]>;
        confidence: z.ZodNumber;
        evidence: z.ZodArray<z.ZodObject<{
            sourceType: z.ZodEnum<["file", "manifest", "config", "documentation", "git_commit"]>;
            path: z.ZodString;
            contentHash: z.ZodString;
            commitSha: z.ZodString;
            lineStart: z.ZodNullable<z.ZodNumber>;
            lineEnd: z.ZodNullable<z.ZodNumber>;
            excerpt: z.ZodNullable<z.ZodString>;
            authority: z.ZodNumber;
            observedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }, {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }>, "many">;
    }, "evidence"> & {
        id: z.ZodString;
        status: z.ZodEnum<["verified", "likely", "uncertain", "contradicted", "stale", "superseded", "rejected"]>;
        validFrom: z.ZodString;
        validTo: z.ZodNullable<z.ZodString>;
        firstSeenAt: z.ZodString;
        lastVerifiedAt: z.ZodString;
        supersedesClaimId: z.ZodNullable<z.ZodString>;
        evidence: z.ZodArray<z.ZodObject<{
            sourceType: z.ZodEnum<["file", "manifest", "config", "documentation", "git_commit"]>;
            path: z.ZodString;
            contentHash: z.ZodString;
            commitSha: z.ZodString;
            lineStart: z.ZodNullable<z.ZodNumber>;
            lineEnd: z.ZodNullable<z.ZodNumber>;
            excerpt: z.ZodNullable<z.ZodString>;
            authority: z.ZodNumber;
            observedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }, {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        status?: "verified" | "likely" | "uncertain" | "contradicted" | "stale" | "superseded" | "rejected";
        value?: string;
        id?: string;
        category?: string;
        subject?: string;
        predicate?: string;
        scope?: string;
        epistemicType?: "observed" | "derived" | "inferred" | "declared";
        claimKind?: "implementation" | "intent";
        confidence?: number;
        evidence?: {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }[];
        validFrom?: string;
        validTo?: string;
        firstSeenAt?: string;
        lastVerifiedAt?: string;
        supersedesClaimId?: string;
    }, {
        status?: "verified" | "likely" | "uncertain" | "contradicted" | "stale" | "superseded" | "rejected";
        value?: string;
        id?: string;
        category?: string;
        subject?: string;
        predicate?: string;
        scope?: string;
        epistemicType?: "observed" | "derived" | "inferred" | "declared";
        claimKind?: "implementation" | "intent";
        confidence?: number;
        evidence?: {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }[];
        validFrom?: string;
        validTo?: string;
        firstSeenAt?: string;
        lastVerifiedAt?: string;
        supersedesClaimId?: string;
    }>, "many">;
    contradictions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        claimAId: z.ZodString;
        claimBId: z.ZodString;
        status: z.ZodEnum<["open", "resolved"]>;
        reason: z.ZodString;
        resolution: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status?: "open" | "resolved";
        createdAt?: string;
        id?: string;
        claimAId?: string;
        claimBId?: string;
        reason?: string;
        resolution?: string;
    }, {
        status?: "open" | "resolved";
        createdAt?: string;
        id?: string;
        claimAId?: string;
        claimBId?: string;
        reason?: string;
        resolution?: string;
    }>, "many">;
    changes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        category: z.ZodString;
        summary: z.ZodString;
        previousValue: z.ZodNullable<z.ZodString>;
        currentValue: z.ZodString;
        commitSha: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt?: string;
        id?: string;
        commitSha?: string;
        category?: string;
        summary?: string;
        previousValue?: string;
        currentValue?: string;
    }, {
        createdAt?: string;
        id?: string;
        commitSha?: string;
        category?: string;
        summary?: string;
        previousValue?: string;
        currentValue?: string;
    }>, "many">;
    mode: z.ZodEnum<["fixture", "local", "github"]>;
}, "strip", z.ZodTypeAny, {
    projectId?: string;
    repository?: {
        id?: string;
        name?: string;
        owner?: string;
        defaultBranch?: string;
        headSha?: string;
        visibility?: "local" | "private" | "public";
        webUrl?: string;
        sourceType?: "local" | "github";
    };
    scannedAt?: string;
    sourceCount?: number;
    truths?: {
        status?: "verified" | "likely" | "uncertain" | "contradicted" | "stale" | "superseded" | "rejected";
        value?: string;
        id?: string;
        category?: string;
        subject?: string;
        predicate?: string;
        scope?: string;
        epistemicType?: "observed" | "derived" | "inferred" | "declared";
        claimKind?: "implementation" | "intent";
        confidence?: number;
        evidence?: {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }[];
        validFrom?: string;
        validTo?: string;
        firstSeenAt?: string;
        lastVerifiedAt?: string;
        supersedesClaimId?: string;
    }[];
    contradictions?: {
        status?: "open" | "resolved";
        createdAt?: string;
        id?: string;
        claimAId?: string;
        claimBId?: string;
        reason?: string;
        resolution?: string;
    }[];
    changes?: {
        createdAt?: string;
        id?: string;
        commitSha?: string;
        category?: string;
        summary?: string;
        previousValue?: string;
        currentValue?: string;
    }[];
    mode?: "local" | "github" | "fixture";
}, {
    projectId?: string;
    repository?: {
        id?: string;
        name?: string;
        owner?: string;
        defaultBranch?: string;
        headSha?: string;
        visibility?: "local" | "private" | "public";
        webUrl?: string;
        sourceType?: "local" | "github";
    };
    scannedAt?: string;
    sourceCount?: number;
    truths?: {
        status?: "verified" | "likely" | "uncertain" | "contradicted" | "stale" | "superseded" | "rejected";
        value?: string;
        id?: string;
        category?: string;
        subject?: string;
        predicate?: string;
        scope?: string;
        epistemicType?: "observed" | "derived" | "inferred" | "declared";
        claimKind?: "implementation" | "intent";
        confidence?: number;
        evidence?: {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }[];
        validFrom?: string;
        validTo?: string;
        firstSeenAt?: string;
        lastVerifiedAt?: string;
        supersedesClaimId?: string;
    }[];
    contradictions?: {
        status?: "open" | "resolved";
        createdAt?: string;
        id?: string;
        claimAId?: string;
        claimBId?: string;
        reason?: string;
        resolution?: string;
    }[];
    changes?: {
        createdAt?: string;
        id?: string;
        commitSha?: string;
        category?: string;
        summary?: string;
        previousValue?: string;
        currentValue?: string;
    }[];
    mode?: "local" | "github" | "fixture";
}>;
export declare const contextPackSchema: z.ZodObject<{
    task: z.ZodString;
    generatedAt: z.ZodString;
    projectName: z.ZodString;
    truths: z.ZodArray<z.ZodObject<Omit<{
        category: z.ZodString;
        subject: z.ZodString;
        predicate: z.ZodString;
        value: z.ZodString;
        scope: z.ZodNullable<z.ZodString>;
        epistemicType: z.ZodEnum<["observed", "derived", "inferred", "declared"]>;
        claimKind: z.ZodEnum<["implementation", "intent"]>;
        confidence: z.ZodNumber;
        evidence: z.ZodArray<z.ZodObject<{
            sourceType: z.ZodEnum<["file", "manifest", "config", "documentation", "git_commit"]>;
            path: z.ZodString;
            contentHash: z.ZodString;
            commitSha: z.ZodString;
            lineStart: z.ZodNullable<z.ZodNumber>;
            lineEnd: z.ZodNullable<z.ZodNumber>;
            excerpt: z.ZodNullable<z.ZodString>;
            authority: z.ZodNumber;
            observedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }, {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }>, "many">;
    }, "evidence"> & {
        id: z.ZodString;
        status: z.ZodEnum<["verified", "likely", "uncertain", "contradicted", "stale", "superseded", "rejected"]>;
        validFrom: z.ZodString;
        validTo: z.ZodNullable<z.ZodString>;
        firstSeenAt: z.ZodString;
        lastVerifiedAt: z.ZodString;
        supersedesClaimId: z.ZodNullable<z.ZodString>;
        evidence: z.ZodArray<z.ZodObject<{
            sourceType: z.ZodEnum<["file", "manifest", "config", "documentation", "git_commit"]>;
            path: z.ZodString;
            contentHash: z.ZodString;
            commitSha: z.ZodString;
            lineStart: z.ZodNullable<z.ZodNumber>;
            lineEnd: z.ZodNullable<z.ZodNumber>;
            excerpt: z.ZodNullable<z.ZodString>;
            authority: z.ZodNumber;
            observedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }, {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        status?: "verified" | "likely" | "uncertain" | "contradicted" | "stale" | "superseded" | "rejected";
        value?: string;
        id?: string;
        category?: string;
        subject?: string;
        predicate?: string;
        scope?: string;
        epistemicType?: "observed" | "derived" | "inferred" | "declared";
        claimKind?: "implementation" | "intent";
        confidence?: number;
        evidence?: {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }[];
        validFrom?: string;
        validTo?: string;
        firstSeenAt?: string;
        lastVerifiedAt?: string;
        supersedesClaimId?: string;
    }, {
        status?: "verified" | "likely" | "uncertain" | "contradicted" | "stale" | "superseded" | "rejected";
        value?: string;
        id?: string;
        category?: string;
        subject?: string;
        predicate?: string;
        scope?: string;
        epistemicType?: "observed" | "derived" | "inferred" | "declared";
        claimKind?: "implementation" | "intent";
        confidence?: number;
        evidence?: {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }[];
        validFrom?: string;
        validTo?: string;
        firstSeenAt?: string;
        lastVerifiedAt?: string;
        supersedesClaimId?: string;
    }>, "many">;
    recentChanges: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        category: z.ZodString;
        summary: z.ZodString;
        previousValue: z.ZodNullable<z.ZodString>;
        currentValue: z.ZodString;
        commitSha: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt?: string;
        id?: string;
        commitSha?: string;
        category?: string;
        summary?: string;
        previousValue?: string;
        currentValue?: string;
    }, {
        createdAt?: string;
        id?: string;
        commitSha?: string;
        category?: string;
        summary?: string;
        previousValue?: string;
        currentValue?: string;
    }>, "many">;
    constraints: z.ZodArray<z.ZodString, "many">;
    relevantFiles: z.ZodArray<z.ZodString, "many">;
    tokenEstimate: z.ZodNumber;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectName?: string;
    truths?: {
        status?: "verified" | "likely" | "uncertain" | "contradicted" | "stale" | "superseded" | "rejected";
        value?: string;
        id?: string;
        category?: string;
        subject?: string;
        predicate?: string;
        scope?: string;
        epistemicType?: "observed" | "derived" | "inferred" | "declared";
        claimKind?: "implementation" | "intent";
        confidence?: number;
        evidence?: {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }[];
        validFrom?: string;
        validTo?: string;
        firstSeenAt?: string;
        lastVerifiedAt?: string;
        supersedesClaimId?: string;
    }[];
    task?: string;
    generatedAt?: string;
    recentChanges?: {
        createdAt?: string;
        id?: string;
        commitSha?: string;
        category?: string;
        summary?: string;
        previousValue?: string;
        currentValue?: string;
    }[];
    constraints?: string[];
    relevantFiles?: string[];
    tokenEstimate?: number;
    text?: string;
}, {
    projectName?: string;
    truths?: {
        status?: "verified" | "likely" | "uncertain" | "contradicted" | "stale" | "superseded" | "rejected";
        value?: string;
        id?: string;
        category?: string;
        subject?: string;
        predicate?: string;
        scope?: string;
        epistemicType?: "observed" | "derived" | "inferred" | "declared";
        claimKind?: "implementation" | "intent";
        confidence?: number;
        evidence?: {
            path?: string;
            sourceType?: "file" | "manifest" | "config" | "documentation" | "git_commit";
            contentHash?: string;
            observedAt?: string;
            commitSha?: string;
            lineStart?: number;
            lineEnd?: number;
            excerpt?: string;
            authority?: number;
        }[];
        validFrom?: string;
        validTo?: string;
        firstSeenAt?: string;
        lastVerifiedAt?: string;
        supersedesClaimId?: string;
    }[];
    task?: string;
    generatedAt?: string;
    recentChanges?: {
        createdAt?: string;
        id?: string;
        commitSha?: string;
        category?: string;
        summary?: string;
        previousValue?: string;
        currentValue?: string;
    }[];
    constraints?: string[];
    relevantFiles?: string[];
    tokenEstimate?: number;
    text?: string;
}>;
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
//# sourceMappingURL=domain.d.ts.map