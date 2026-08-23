import type { ProjectTruthClaim } from "@harikos/core";

export function StatusBadge({ status }: { status: ProjectTruthClaim["status"] }) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}
