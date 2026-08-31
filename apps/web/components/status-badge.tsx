import type { ProjectTruthClaim } from "@harikos/core";
import { cn } from "../lib/utils";

export function StatusBadge({ status }: { status: ProjectTruthClaim["status"] }) {
  const statusStyles: Record<string, string> = {
    verified: "text-green bg-green/10 border-green/20",
    likely: "text-orange bg-orange/10 border-orange/20",
    uncertain: "text-yellow bg-yellow/10 border-yellow/20",
    contradicted: "text-red bg-red/10 border-red/20",
    superseded: "text-muted bg-ink-elevated border-line-light/20",
    stale: "text-muted bg-ink-elevated border-line-light/20",
    rejected: "text-red bg-red/10 border-red/20",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[8px] font-mono font-bold tracking-widest uppercase", statusStyles[status] || "text-muted bg-line border-line-light/10")}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shadow-sm"></span>
      {status}
    </span>
  );
}
