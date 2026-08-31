import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowRight, FileWarning, Layers } from "lucide-react";
import { AppShell } from "../../../../components/app-shell";
import { PageHeader } from "../../../../components/page-header";
import { RescanProjectButton } from "../../../../components/rescan-project-button";
import { StatusBadge } from "../../../../components/status-badge";
import { TruthCard } from "../../../../components/truth-card";
import { projectSnapshot } from "../../../../lib/project-data";

export const dynamic = "force-dynamic";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();

  const current = snapshot.truths.filter((claim) => claim.status === "verified" || claim.status === "likely");
  const openContradictions = snapshot.contradictions.filter((item) => item.status === "open");
  const verifiedCount = current.filter((claim) => claim.status === "verified").length;

  return (
    <AppShell snapshot={snapshot}>
      <PageHeader
        eyebrow={`${snapshot.mode.toUpperCase()} WORKSPACE`}
        title={snapshot.repository.name}
        copy={`${snapshot.repository.owner ? `${snapshot.repository.owner}/` : ""}${snapshot.repository.defaultBranch} · verified against ${snapshot.repository.headSha.slice(0, 8)}`}
        action={(
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href={`/app/project/${snapshot.projectId}/context`} className="h-9 px-4 flex items-center justify-center gap-2 bg-white text-ink hover:bg-paper-soft font-mono font-bold text-[10px] tracking-wide transition-colors whitespace-nowrap rounded-sm shadow-sm">
              Prepare Context
            </Link>
            {snapshot.mode === "github" ? <RescanProjectButton projectId={snapshot.projectId} /> : null}
          </div>
        )}
      />
      <div className={`overview-status-bar ${openContradictions.length ? "has-attention" : ""}`}>
        <div><i /><span><strong>{openContradictions.length ? "Scan complete; review open drift" : "Last scan complete"}</strong><small>Scanned {new Date(snapshot.scannedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</small></span></div>
        <div><span>FILES ANALYZED</span><strong>{snapshot.sourceCount}</strong></div>
        <div><span>VERIFIED</span><strong>{verifiedCount}</strong></div>
        <div><span>DRIFT</span><strong>{openContradictions.length}</strong></div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity size={14} className="text-orange" />
          Active Project Truths
        </h2>
        <Link href={`/app/project/${snapshot.projectId}/truth`} className="text-[10px] font-mono tracking-widest text-muted hover:text-white uppercase transition-colors">
          View All &rarr;
        </Link>
      </div>

      {current.length ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {current.slice(0, 6).map((claim) => (
            <TruthCard claim={claim} projectId={snapshot.projectId} key={claim.id} />
          ))}
        </section>
      ) : (
        <section className="bg-ink border border-line rounded-sm p-10 text-center mb-12">
          <p className="text-sm text-white mb-2">No current Truth yet.</p>
          <p className="text-[11px] text-muted">A completed scan will show evidence-backed claims here. History stays on Memory; this surface is current state only.</p>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ink border border-line flex flex-col rounded-sm overflow-hidden">
          <div className="p-5 border-b border-line flex items-center justify-between bg-ink-soft">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-muted" />
              <h2 className="text-sm font-bold text-white">Evidence Coverage</h2>
            </div>
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase">TOP CLAIMS</span>
          </div>
          <div className="flex flex-col flex-1 divide-y divide-line p-5 justify-center gap-1">
            {current.slice(0, 5).map((claim) => (
              <Link className="flex items-center gap-4 py-2 group" href={`/app/project/${snapshot.projectId}/truth/${encodeURIComponent(claim.id)}`} key={claim.id}>
                <span className="w-24 truncate text-[11px] text-muted capitalize group-hover:text-white transition-colors" title={claim.subject}>{claim.subject}</span>
                <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-orange rounded-full transition-all" style={{ width: `${Math.round(claim.confidence * 100)}%` }}></div>
                </div>
                <strong className="w-16 text-right font-mono text-[9px] text-muted group-hover:text-orange transition-colors">{claim.evidence.length} sources</strong>
              </Link>
            ))}
            {current.length === 0 ? (
              <p className="text-sm text-muted py-8 text-center">No evidence rows until the first completed scan.</p>
            ) : null}
          </div>
        </div>

        <div className="bg-ink border border-line flex flex-col rounded-sm overflow-hidden">
          <div className="p-5 border-b border-line flex items-center justify-between bg-ink-soft">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-orange" />
              <h2 className="text-sm font-bold text-white">Semantic Drift</h2>
            </div>
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase">LATEST</span>
          </div>
          <div className="p-5 flex flex-col flex-1 relative">
            {snapshot.changes[0] ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] text-muted uppercase tracking-wider font-mono">{snapshot.changes[0].category}</span>
                  <StatusBadge status={openContradictions.length ? "contradicted" : "verified"} />
                </div>
                <p className="text-sm text-white leading-relaxed mb-6">{snapshot.changes[0].summary}</p>
                <div className="bg-ink-elevated p-4 flex items-center justify-between border border-line mb-6 rounded-sm font-mono text-xs">
                  <span className="text-muted line-through truncate max-w-[40%]">{snapshot.changes[0].previousValue}</span>
                  <ArrowRight size={14} className="text-muted" />
                  <strong className="text-orange truncate max-w-[40%]">{snapshot.changes[0].currentValue}</strong>
                </div>
                <Link href={`/app/project/${snapshot.projectId}/changes`} className="mt-auto h-9 flex items-center justify-center border border-line hover:border-orange text-white bg-ink-soft transition-colors text-[10px] uppercase font-mono tracking-widest rounded-sm">
                  Inspect Change
                </Link>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <FileWarning size={24} className="text-muted mb-4 opacity-50" />
                <p className="text-sm text-muted">No semantic drift detected.</p>
                <p className="text-[10px] text-muted mt-2">Rescan after a repository change to build semantic history.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
