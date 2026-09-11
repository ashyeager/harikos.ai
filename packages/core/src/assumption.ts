import type { ProjectTruthClaim } from "./domain.js";

export type AssumptionCheck = {
  status: "SUPPORTED" | "CONTRADICTED" | "UNVERIFIED";
  matches: ProjectTruthClaim[];
};

const currentStatuses = new Set<ProjectTruthClaim["status"]>(["verified", "likely"]);
const genericValueWords = new Set(["auth", "authentication", "database", "framework", "provider", "service"]);

function normalized(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
}

function identity(claim: ProjectTruthClaim): string {
  return [claim.subject, claim.predicate, claim.scope ?? "global", claim.claimKind]
    .map(normalized)
    .join("::");
}

function mentionsValue(statement: string, value: string): boolean {
  const normalizedValue = normalized(value);
  if (!normalizedValue) return false;
  if (statement.includes(normalizedValue)) return true;
  const distinctiveWords = normalizedValue
    .split(" ")
    .filter((word) => word.length > 2 && !genericValueWords.has(word));
  return distinctiveWords.length > 0 && distinctiveWords.every((word) => statement.split(" ").includes(word));
}

export function checkProjectAssumption(
  claims: ProjectTruthClaim[],
  statement: string,
): AssumptionCheck {
  const normalizedStatement = normalized(statement);
  const current = claims.filter((claim) => currentStatuses.has(claim.status));
  const mentioned = claims.filter((claim) => mentionsValue(normalizedStatement, claim.value));
  const supported = mentioned.filter((claim) => currentStatuses.has(claim.status));
  if (supported.length > 0) return { status: "SUPPORTED", matches: supported };

  const contradictedBy = mentioned.flatMap((historical) =>
    current.filter(
      (claim) => identity(claim) === identity(historical) && normalized(claim.value) !== normalized(historical.value),
    ),
  );
  if (contradictedBy.length > 0) {
    return { status: "CONTRADICTED", matches: [...new Map(contradictedBy.map((claim) => [claim.id, claim])).values()] };
  }
  return { status: "UNVERIFIED", matches: [] };
}
