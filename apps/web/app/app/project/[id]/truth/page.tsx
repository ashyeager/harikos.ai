import { notFound } from "next/navigation";
import { AppShell } from "../../../../../components/app-shell";
import { PageHeader } from "../../../../../components/page-header";
import { TruthCard } from "../../../../../components/truth-card";
import { projectSnapshot } from "../../../../../lib/project-data";
import { Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TruthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();

  const categories = Array.from(new Set(snapshot.truths.map((claim) => claim.category))) as string[];

  return (
    <AppShell snapshot={snapshot}>
      <PageHeader 
        eyebrow="CANONICAL PROJECT STATE" 
        title="Project Truth" 
        copy="Current implementation, historical state, evidence, confidence, and contradictions — without collapsing them into a generic summary." 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-4 border-b border-line" aria-label="Truth summary">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="px-3 h-8 flex items-center font-mono text-[9px] text-muted whitespace-nowrap bg-ink-soft border border-line rounded-sm cursor-pointer hover:bg-ink-elevated transition-colors">
            ALL <b className="text-white ml-2">{snapshot.truths.length}</b>
          </span>
          <span className="px-3 h-8 flex items-center font-mono text-[9px] text-cyan bg-ink border border-cyan/50 whitespace-nowrap rounded-sm shadow-[0_0_10px_rgba(0,217,232,0.1)] cursor-pointer">
            VERIFIED <b className="text-white ml-2">{snapshot.truths.filter((claim) => claim.status === "verified").length}</b>
          </span>
          <span className="px-3 h-8 flex items-center font-mono text-[9px] text-muted whitespace-nowrap border border-transparent hover:bg-ink-soft rounded-sm cursor-pointer transition-colors">
            SUPERSEDED <b className="text-white ml-2">{snapshot.truths.filter((claim) => claim.status === "superseded").length}</b>
          </span>
          <span className="px-3 h-8 flex items-center font-mono text-[9px] text-muted whitespace-nowrap border border-transparent hover:bg-ink-soft rounded-sm cursor-pointer transition-colors">
            CONTRADICTED <b className="text-white ml-2">{snapshot.truths.filter((claim) => claim.status === "contradicted").length}</b>
          </span>
        </div>
        
        <button className="flex items-center gap-2 px-3 h-8 border border-line bg-ink-soft hover:bg-ink hover:text-white transition-colors text-xs text-muted rounded-sm flex-shrink-0">
          <Filter size={12} />
          <span>Filter</span>
        </button>
      </div>

      <div className="flex flex-col gap-16">
        {categories.map((category) => {
          const claims = snapshot.truths.filter((claim) => claim.category === category);
          
          return (
            <section key={category} className="scroll-mt-24" id={category}>
              <div className="flex items-end justify-between border-b border-line pb-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-cyan/50 rounded-full"></span>
                  <h2 className="text-xl font-bold text-white capitalize">{category}</h2>
                </div>
                <span className="font-mono text-[9px] tracking-widest uppercase text-muted bg-ink-soft px-2 py-1 rounded-sm border border-line">
                  {claims.length} claims
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {claims.map((claim) => (
                  <TruthCard claim={claim} projectId={snapshot.projectId} key={claim.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
