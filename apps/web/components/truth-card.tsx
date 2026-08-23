import type { ProjectTruthClaim } from "@harikos/core";
import Link from "next/link";

import { StatusBadge } from "./status-badge";

export function TruthCard({
  claim,
  projectId,
}: {
  claim: ProjectTruthClaim;
  projectId: string;
}) {
  return (
    <Link className="truth-card" href={`/app/project/${projectId}/truth/${encodeURIComponent(claim.id)}`}>
      <div className="truth-card-top">
        <span className="truth-category">{claim.category}</span>
        <StatusBadge status={claim.status} />
      </div>
      <h3>{claim.value}</h3>
      <p>{claim.subject.replaceAll("-", " ")} · {claim.scope ?? "project-wide"}</p>
      <div className="confidence-row">
        <span><i style={{ width: `${Math.round(claim.confidence * 100)}%` }} /></span>
        <strong>{Math.round(claim.confidence * 100)}%</strong>
      </div>
      <div className="truth-card-footer">
        <span>{claim.evidence.length} evidence {claim.evidence.length === 1 ? "source" : "sources"}</span>
        <b>Inspect →</b>
      </div>
    </Link>
  );
}
