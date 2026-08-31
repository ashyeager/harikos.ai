import { notFound } from "next/navigation";
import { AppShell } from "../../../../../../components/app-shell";
import { PageHeader } from "../../../../../../components/page-header";
import { StatusBadge } from "../../../../../../components/status-badge";
import { projectSnapshot } from "../../../../../../lib/project-data";

export const dynamic = "force-dynamic";

export default async function TruthDetailPage({ params }: { params: Promise<{ id: string; claimId: string }> }) {
  const { id, claimId } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();

  const claim = snapshot.truths.find((item) => item.id === decodeURIComponent(claimId));
  if (!claim) notFound();

  const previous = claim.supersedesClaimId ? snapshot.truths.find((item) => item.id === claim.supersedesClaimId) : undefined;

  return (
    <AppShell snapshot={snapshot}>
      <PageHeader 
        eyebrow={`${claim.category} / ${claim.subject}`} 
        title={claim.value} 
        copy="A traceable project claim: status, evidence, confidence, scope, and temporal history." 
        action={<StatusBadge status={claim.status} />} 
      />

      <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 mb-8">
        <article className="bg-ink border border-line p-8 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase">STATEMENT</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-8">
              {claim.subject.replaceAll("-", " ")} uses <strong className="text-orange">{claim.value}</strong>.
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-line">
            <div className="flex flex-col gap-2">
              <small className="font-mono text-[8px] tracking-widest text-muted uppercase">CONFIDENCE</small>
              <strong className="text-white text-sm">{Math.round(claim.confidence * 100)}%</strong>
            </div>
            <div className="flex flex-col gap-2">
              <small className="font-mono text-[8px] tracking-widest text-muted uppercase">SCOPE</small>
              <strong className="text-white text-sm capitalize">{claim.scope ?? "Project"}</strong>
            </div>
            <div className="flex flex-col gap-2">
              <small className="font-mono text-[8px] tracking-widest text-muted uppercase">EPISTEMIC TYPE</small>
              <strong className="text-white text-sm capitalize">{claim.epistemicType}</strong>
            </div>
            <div className="flex flex-col gap-2">
              <small className="font-mono text-[8px] tracking-widest text-muted uppercase">CURRENT SINCE</small>
              <strong className="text-white text-sm">{new Date(claim.validFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>
            </div>
          </div>
        </article>

        <article className="bg-ink border border-line p-8 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase block mb-4">VERIFIED AGAINST</span>
            <strong className="font-mono text-sm text-white break-all block mb-2">{snapshot.repository.headSha}</strong>
            <small className="font-mono text-[10px] text-muted">{claim.lastVerifiedAt.replace("T", " ").slice(0, 16)} UTC</small>
          </div>
          
          <div className="w-full h-1 bg-line rounded-full overflow-hidden mt-6">
            <div className="h-full bg-orange rounded-full" style={{ width: `${Math.round(claim.confidence * 100)}%` }}></div>
          </div>
        </article>
      </section>

      <section className="bg-ink border border-line mb-8">
        <div className="flex items-center justify-between p-6 border-b border-line">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase">PROVENANCE</span>
            <h2 className="text-lg font-bold text-white">Evidence</h2>
          </div>
          <b className="font-mono text-[10px] tracking-widest text-muted uppercase">{claim.evidence.length} SOURCES</b>
        </div>
        
        <div className="flex flex-col divide-y divide-line">
          {claim.evidence.map((item, index) => (
            <div className="p-6 flex gap-6" key={`${item.path}-${index}`}>
              <span className="w-10 h-10 flex items-center justify-center bg-ink-soft border border-line text-orange font-mono text-xs font-black shrink-0">
                {item.sourceType === "documentation" ? "D" : "F"}
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center">
                <strong className="font-mono text-sm text-white truncate">
                  {item.path}{item.lineStart ? `:${item.lineStart}` : ""}
                </strong>
                <small className="text-[10px] text-muted capitalize">
                  {item.sourceType} &middot; authority {Math.round(item.authority * 100)}%
                </small>
                {item.excerpt ? (
                  <code className="font-mono text-[10px] text-muted bg-ink-soft border border-line p-2 mt-2 truncate inline-block max-w-full">
                    {item.excerpt}
                  </code>
                ) : null}
              </div>
              <span className="text-green font-mono flex items-center px-4">&radic;</span>
            </div>
          ))}
        </div>
      </section>

      {previous ? (
        <section className="bg-ink border border-line p-8 flex flex-col md:flex-row items-center gap-8 justify-between min-h-[150px]">
          <div className="flex-1 flex flex-col gap-3">
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase">PREVIOUS TRUTH</span>
            <h2 className="text-2xl font-bold text-white">{previous.value}</h2>
            <div className="self-start"><StatusBadge status={previous.status} /></div>
          </div>
          
          <span className="text-orange text-3xl font-light transform rotate-90 md:rotate-0">&rarr;</span>
          
          <div className="flex-1 flex flex-col gap-3">
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase">CURRENT TRUTH</span>
            <h2 className="text-2xl font-bold text-white">{claim.value}</h2>
            <div className="self-start"><StatusBadge status={claim.status} /></div>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
