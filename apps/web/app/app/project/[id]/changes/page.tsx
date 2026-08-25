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
      <PageHeader 
        eyebrow="SEMANTIC HISTORY" 
        title="Changes & Drift" 
        copy="Meaningful changes to project understanding, with old truth preserved and stale evidence exposed." 
      />

      {/* HIGHLIGHT SECTION */}
      <section className="bg-ink border border-line rounded-sm mb-8 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-0">
          <div className="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-line bg-ink-soft/30">
            <span className="font-mono text-[10px] tracking-widest text-cyan uppercase mb-3 flex items-center gap-2">
              <GitBranch size={12} />
              {snapshot.changes[0]?.category ?? "NO DRIFT DETECTED"}
            </span>
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
              {snapshot.changes[0]?.summary ?? "No semantic change detected yet."}
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              HARIKOS automatically updates related truth while retaining the previous validity interval, ensuring your agents always have the current context.
            </p>
          </div>
          
          {snapshot.changes[0] ? (
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-ink">
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                <div className="flex-1 flex flex-col gap-3 w-full bg-ink-elevated p-5 rounded-sm border border-line">
                  <div className="flex items-center justify-between">
                    <small className="font-mono text-[9px] tracking-widest text-muted uppercase">PREVIOUS</small>
                    <StatusBadge status="superseded" />
                  </div>
                  <strong className="text-white text-sm break-words line-through opacity-70">{snapshot.changes[0].previousValue}</strong>
                </div>
                
                <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center shrink-0 bg-ink shadow-sm z-10 -my-3 sm:my-0 sm:-mx-3">
                  <ArrowRight size={14} className="text-orange transform rotate-90 sm:rotate-0" />
                </div>
                
                <div className="flex-1 flex flex-col gap-3 w-full bg-ink-elevated p-5 rounded-sm border border-cyan/30 shadow-[0_0_15px_rgba(0,217,232,0.05)]">
                  <div className="flex items-center justify-between">
                    <small className="font-mono text-[9px] tracking-widest text-cyan uppercase">CURRENT</small>
                    <StatusBadge status="verified" />
                  </div>
                  <strong className="text-white text-sm break-words">{snapshot.changes[0].currentValue}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-8 flex items-center justify-center bg-ink">
              <p className="text-muted text-sm font-mono flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green" />
                Project state is fully aligned with truth.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        
        {/* TIMELINE */}
        <div className="bg-ink border border-line rounded-sm">
          <div className="p-6 border-b border-line flex items-center gap-2 bg-ink-soft">
            <GitCommit size={14} className="text-muted" />
            <h2 className="text-sm font-bold text-white">Project Timeline</h2>
          </div>
          
          <div className="p-8">
            <div className="relative border-l-2 border-line ml-3 flex flex-col gap-10 pb-4">
              {snapshot.changes.map((change, index) => (
                <article className="relative flex flex-col pl-8 group" key={change.id}>
                  <div className={cn(
                    "absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-ink flex items-center justify-center",
                    index === 0 ? "bg-cyan shadow-[0_0_10px_rgba(0,217,232,0.5)]" : "bg-line"
                  )}>
                    {index === 0 && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <time className="font-mono text-[10px] tracking-widest text-muted uppercase">
                      {new Date(change.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </time>
                    <span className="w-1 h-1 rounded-full bg-line" />
                    <span className="font-mono text-[10px] tracking-widest text-cyan uppercase px-2 py-0.5 bg-cyan/10 rounded-sm">
                      {change.category}
                    </span>
                  </div>
                  
                  <strong className="text-white text-base mb-2">{change.summary}</strong>
                  
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase tracking-widest bg-ink-elevated px-3 py-1.5 rounded-sm border border-line w-fit">
                    <GitCommit size={10} />
                    {change.commitSha.slice(0, 8)}
                  </div>
                </article>
              ))}
              
              <article className="relative flex flex-col pl-8 opacity-50">
                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-ink border-2 border-line" />
                <time className="font-mono text-[10px] tracking-widest text-muted uppercase mb-2">
                  AUG 22
                </time>
                <strong className="text-white text-sm mb-1">Initial Project Truth established</strong>
                <small className="text-xs text-muted">{snapshot.sourceCount} bounded sources analyzed</small>
              </article>
            </div>
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
