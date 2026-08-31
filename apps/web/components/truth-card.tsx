import type { ProjectTruthClaim } from "@harikos/core";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { Database, FileCode, GitBranch } from "lucide-react";

export function TruthCard({
  claim,
  projectId,
}: {
  claim: ProjectTruthClaim;
  projectId: string;
}) {
  return (
    <Link
      href={`/app/project/${projectId}/truth/${encodeURIComponent(claim.id)}`}
      className="truth-card-link bg-ink border border-line p-5 flex flex-col group transition-all duration-300 hover:bg-ink-elevated hover:border-line-light relative overflow-hidden rounded-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Database size={12} className="text-muted group-hover:text-orange transition-colors" />
          <span className="font-mono text-[9px] tracking-widest text-muted uppercase">
            {claim.category}
          </span>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      <h3 className="text-base font-bold text-white mb-2 leading-snug relative z-10 group-hover:text-orange transition-colors">
        {claim.value}
      </h3>

      <div className="flex items-center gap-2 mb-6 text-[10px] text-muted relative z-10">
        <span className="capitalize">{claim.subject.replaceAll("-", " ")}</span>
        <span className="w-1 h-1 rounded-full bg-line" />
        <span className="font-mono flex items-center gap-1">
          <GitBranch size={10} />
          {claim.scope ?? "global"}
        </span>
      </div>

      <div className="mt-auto pt-4 border-t border-line relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-orange rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.round(claim.confidence * 100)}%` }}
            />
          </div>
          <strong className="font-mono text-[9px] text-white">
            {Math.round(claim.confidence * 100)}%
          </strong>
        </div>
        <div className="flex justify-between items-center text-[9px] text-muted">
          <span className="flex items-center gap-1.5">
            <FileCode size={10} />
            {claim.evidence.length} {claim.evidence.length === 1 ? "source" : "sources"}
          </span>
          <b className="font-mono text-orange opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
            Inspect &rarr;
          </b>
        </div>
      </div>
    </Link>
  );
}
