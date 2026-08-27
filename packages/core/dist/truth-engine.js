import { createHash } from "node:crypto";
import { projectChangeSchema, projectTruthClaimSchema, truthContradictionSchema, } from "./domain.js";
function digest(value) {
    return createHash("sha256").update(value).digest("hex").slice(0, 20);
}
function identityOf(claim) {
    return [claim.subject, claim.predicate, claim.scope ?? "global", claim.claimKind].join("::").toLowerCase();
}
function valueKey(value) {
    return value.trim().toLowerCase();
}
function evidenceKey(evidence) {
    return [evidence.path, evidence.contentHash, evidence.lineStart ?? "", evidence.lineEnd ?? ""].join("::");
}
function mergeEvidence(...groups) {
    const seen = new Set();
    return groups.flat().filter((evidence) => {
        const key = evidenceKey(evidence);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
function aggregateCandidates(candidates) {
    const byValue = new Map();
    for (const candidate of candidates) {
        const group = byValue.get(valueKey(candidate.value)) ?? [];
        group.push(candidate);
        byValue.set(valueKey(candidate.value), group);
    }
    return [...byValue.values()].map((group) => {
        const strongest = [...group].sort((left, right) => right.confidence - left.confidence)[0];
        const evidence = mergeEvidence(...group.map((candidate) => candidate.evidence));
        const confidence = Math.min(0.99, Math.max(...group.map((candidate) => candidate.confidence)) +
            Math.min(0.08, Math.max(0, evidence.length - 1) * 0.02));
        return { ...strongest, confidence, evidence };
    });
}
function candidateScore(candidate) {
    const strongestAuthority = Math.max(...candidate.evidence.map((item) => item.authority));
    const activeEvidence = candidate.evidence.filter((item) => item.sourceType === "file" || item.sourceType === "config").length;
    return candidate.confidence + strongestAuthority * 0.35 + Math.min(0.12, activeEvidence * 0.04);
}
function statusFor(candidate) {
    const strongestAuthority = Math.max(...candidate.evidence.map((item) => item.authority));
    const hasActiveEvidence = candidate.evidence.some((item) => item.sourceType === "file" || item.sourceType === "config");
    if (candidate.confidence >= 0.75 && strongestAuthority >= 0.75 && hasActiveEvidence) {
        return "verified";
    }
    if (candidate.confidence >= 0.58) {
        return "likely";
    }
    return "uncertain";
}
function makeClaim(candidate, at, options = {}) {
    return projectTruthClaimSchema.parse({
        ...candidate,
        id: `truth_${digest(`${identityOf(candidate)}::${valueKey(candidate.value)}`)}`,
        status: options.status ?? statusFor(candidate),
        validFrom: at,
        validTo: null,
        firstSeenAt: at,
        lastVerifiedAt: at,
        supersedesClaimId: options.supersedesClaimId ?? null,
    });
}
function makeContradiction(current, competingClaimId, at, reason, status, resolution) {
    return truthContradictionSchema.parse({
        id: `contradiction_${digest(`${current.id}::${competingClaimId}::${reason}`)}`,
        claimAId: current.id,
        claimBId: competingClaimId,
        status,
        reason,
        resolution,
        createdAt: at,
    });
}
export function resolveTruth(previousTruths, candidates, at = new Date().toISOString(), commitSha = candidates[0]?.evidence[0]?.commitSha ?? "unknown") {
    const truths = new Map(previousTruths.map((claim) => [claim.id, claim]));
    const contradictions = [];
    const changes = [];
    const grouped = new Map();
    for (const candidate of candidates) {
        const identity = identityOf(candidate);
        const group = grouped.get(identity) ?? [];
        group.push(candidate);
        grouped.set(identity, group);
    }
    for (const [identity, rawGroup] of grouped) {
        const group = aggregateCandidates(rawGroup).sort((left, right) => candidateScore(right) - candidateScore(left));
        const leader = group[0];
        if (!leader) {
            continue;
        }
        const previous = [...truths.values()]
            .filter((claim) => identityOf(claim) === identity &&
            ["verified", "likely", "uncertain"].includes(claim.status))
            .sort((left, right) => right.confidence - left.confidence)[0];
        if (previous && valueKey(previous.value) === valueKey(leader.value)) {
            truths.set(previous.id, projectTruthClaimSchema.parse({
                ...previous,
                status: statusFor(leader),
                confidence: Math.max(previous.confidence, leader.confidence),
                lastVerifiedAt: at,
                evidence: leader.evidence,
            }));
            continue;
        }
        const leaderStatus = statusFor(leader);
        if (previous && leaderStatus === "verified") {
            truths.set(previous.id, projectTruthClaimSchema.parse({
                ...previous,
                status: "superseded",
                validTo: at,
                lastVerifiedAt: at,
            }));
            const current = makeClaim(leader, at, {
                status: "verified",
                supersedesClaimId: previous.id,
            });
            truths.set(current.id, current);
            const staleDocumentation = group.find((candidate) => valueKey(candidate.value) === valueKey(previous.value) &&
                candidate.evidence.some((item) => item.sourceType === "documentation"));
            const stalePath = staleDocumentation?.evidence.find((item) => item.sourceType === "documentation")?.path;
            const reason = stalePath
                ? `${stalePath} still describes ${previous.value}; active implementation evidence supports ${current.value}.`
                : `${previous.value} and ${current.value} cannot both be the active ${leader.subject} in the same scope.`;
            contradictions.push(makeContradiction(current, previous.id, at, reason, stalePath ? "open" : "resolved", stalePath ? null : `${current.value} superseded ${previous.value}.`));
            changes.push(projectChangeSchema.parse({
                id: `change_${digest(`${previous.id}::${current.id}::${commitSha}`)}`,
                category: leader.category,
                summary: `${leader.subject} changed from ${previous.value} to ${current.value}.`,
                previousValue: previous.value,
                currentValue: current.value,
                commitSha,
                createdAt: at,
            }));
            continue;
        }
        if (previous) {
            const competing = makeClaim(leader, at, { status: "contradicted" });
            truths.set(competing.id, competing);
            contradictions.push(makeContradiction(previous, competing.id, at, `New evidence for ${leader.value} is not strong enough to replace ${previous.value}.`, "open", null));
            continue;
        }
        const current = makeClaim(leader, at);
        truths.set(current.id, current);
        const runner = group.find((candidate) => valueKey(candidate.value) !== valueKey(leader.value));
        if (runner) {
            const competing = makeClaim(runner, at, { status: "contradicted" });
            truths.set(competing.id, competing);
            contradictions.push(makeContradiction(current, competing.id, at, `${runner.value} conflicts with stronger evidence for ${current.value}.`, "open", null));
        }
    }
    for (const previous of previousTruths) {
        const observedValues = grouped
            .get(identityOf(previous))
            ?.map((candidate) => valueKey(candidate.value));
        const current = truths.get(previous.id);
        if (!observedValues?.includes(valueKey(previous.value)) &&
            current &&
            ["verified", "likely", "uncertain", "contradicted"].includes(current.status)) {
            truths.set(previous.id, projectTruthClaimSchema.parse({
                ...current,
                status: "stale",
                validTo: at,
                lastVerifiedAt: at,
            }));
        }
    }
    return {
        truths: [...truths.values()].sort((left, right) => left.category.localeCompare(right.category) || left.subject.localeCompare(right.subject)),
        contradictions,
        changes,
    };
}
//# sourceMappingURL=truth-engine.js.map