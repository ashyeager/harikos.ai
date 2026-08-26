import { notFound } from "next/navigation";
import { AppShell } from "../../../../../components/app-shell";
import { PageHeader } from "../../../../../components/page-header";
import { StatusBadge } from "../../../../../components/status-badge";
import { projectSnapshot } from "../../../../../lib/project-data";
import { FileWarning, GitCommit, GitBranch, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "../../../../../lib/utils";

export const dynamic = "force-dynamic";

export default async function ChangesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();

  const openContradictions = snapshot.contradictions.filter((item) => item.status === "open");

  return (
    <AppShell snapshot={snapshot}>
      <PageHeader eyebrow="SEMANTIC HISTORY" title="Changes & drift" copy="Meaningful changes to project understanding, with old truth preserved and stale evidence exposed." />
      <section className="change-hero panel">
        <div><span className="change-alert">{snapshot.changes[0] ? `${snapshot.changes[0].category.toUpperCase()} CHANGE` : "NO RECORDED CHANGE"}</span><h2>{snapshot.changes[0]?.summary ?? "No semantic change detected yet."}</h2><p>{snapshot.changes[0] ? "HARIKOS updated related truth while retaining the previous validity interval." : "A completed rescan that changes project meaning will appear here with its prior state preserved."}</p></div>
        {snapshot.changes[0] ? <div className="large-transition"><span><small>PREVIOUS</small><strong>{snapshot.changes[0].previousValue}</strong><StatusBadge status="superseded" /></span><b>→</b><span><small>CURRENT</small><strong>{snapshot.changes[0].currentValue}</strong><StatusBadge status="verified" /></span></div> : null}
      </section>
      <section className="change-layout">
        <div className="panel timeline-panel">
          <div className="panel-heading"><div><span>PROJECT TIMELINE</span><h2>What changed</h2></div></div>
          <div className="timeline">
            {snapshot.changes.map((change) => (
              <article key={change.id}><i /><time>{new Date(change.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</time><div><strong>{change.summary}</strong><small>Commit {change.commitSha.slice(0, 8)} · {change.category}</small></div></article>
            ))}
            <article><i className="quiet" /><time>INITIAL</time><div><strong>Initial Project Truth established</strong><small>{snapshot.sourceCount} bounded sources analyzed</small></div></article>
          </div>
        </div>

        {/* CONTRADICTIONS SIDEBAR */}
        <aside className="flex flex-col gap-4">
          <div className="bg-ink border border-line rounded-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-line flex items-center justify-between bg-ink-soft">
              <div className="flex items-center gap-2">
                <FileWarning size={14} className="text-muted" />
                <h2 className="text-sm font-bold text-white">Contradictions</h2>
              </div>
              <b className="font-mono text-[10px] tracking-widest text-orange uppercase bg-orange/10 px-2 py-0.5 rounded-sm">
                {openContradictions.length} OPEN
              </b>
            </div>
            
            <div className="flex flex-col divide-y divide-line max-h-[600px] overflow-y-auto">
              {snapshot.contradictions.map((item) => (
                <article className="p-5 flex gap-4 hover:bg-ink-soft/50 transition-colors" key={item.id}>
                  <div className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-sm shrink-0 shadow-sm",
                    item.status === "open" ? "bg-orange/10 text-orange border border-orange/20" : "bg-green/10 text-green border border-green/20"
                  )}>
                    {item.status === "open" ? <ShieldAlert size={14} /> : <CheckCircle2 size={14} />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <strong className="text-white text-sm">
                      {item.status === "open" ? "Active contradiction" : "Resolved transition"}
                    </strong>
                    <p className="text-xs text-muted leading-relaxed font-mono bg-ink-elevated p-2 rounded-sm border border-line">
                      {item.reason}
                    </p>
                    <small className={cn(
                      "font-mono text-[9px] tracking-widest uppercase mt-1",
                      item.status === "open" ? "text-orange" : "text-green"
                    )}>
                      {item.status === "open" ? "OPEN \u00b7 REVIEW RECOMMENDED" : "RESOLVED \u00b7 HISTORY PRESERVED"}
                    </small>
                  </div>
                </article>
              ))}
              
              {snapshot.contradictions.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <CheckCircle2 size={24} className="text-muted mb-4 opacity-50" />
                  <p className="text-sm text-white font-medium mb-1">No contradictions</p>
                  <p className="text-[11px] text-muted">The project truth is fully aligned.</p>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
