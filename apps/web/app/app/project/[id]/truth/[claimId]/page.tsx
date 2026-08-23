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
      <PageHeader eyebrow={`${claim.category} / ${claim.subject}`} title={claim.value} copy="A traceable project claim: status, evidence, confidence, scope, and temporal history." action={<StatusBadge status={claim.status} />} />
      <section className="claim-detail-grid">
        <article className="panel claim-statement">
          <span>STATEMENT</span>
          <h2>{claim.subject.replaceAll("-", " ")} uses <strong>{claim.value}</strong>.</h2>
          <div className="claim-meta-grid">
            <div><small>CONFIDENCE</small><strong>{Math.round(claim.confidence * 100)}%</strong></div>
            <div><small>SCOPE</small><strong>{claim.scope ?? "Project"}</strong></div>
            <div><small>EPISTEMIC TYPE</small><strong>{claim.epistemicType}</strong></div>
            <div><small>CURRENT SINCE</small><strong>{new Date(claim.validFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong></div>
          </div>
        </article>
        <article className="panel verification-panel">
          <span>VERIFIED AGAINST</span>
          <strong>{snapshot.repository.headSha}</strong>
          <small>{claim.lastVerifiedAt.replace("T", " ").slice(0, 16)} UTC</small>
          <div className="confidence-gauge"><i style={{ width: `${Math.round(claim.confidence * 100)}%` }} /></div>
        </article>
      </section>
      <section className="panel evidence-panel">
        <div className="panel-heading"><div><span>PROVENANCE</span><h2>Evidence</h2></div><b>{claim.evidence.length} SOURCES</b></div>
        <div className="evidence-list">
          {claim.evidence.map((item, index) => (
            <div className="evidence-item" key={`${item.path}-${index}`}>
              <span className="file-icon">{item.sourceType === "documentation" ? "D" : "F"}</span>
              <div><strong>{item.path}{item.lineStart ? `:${item.lineStart}` : ""}</strong><small>{item.sourceType} · authority {Math.round(item.authority * 100)}%</small>{item.excerpt ? <code>{item.excerpt}</code> : null}</div>
              <span className="evidence-check">✓</span>
            </div>
          ))}
        </div>
      </section>
      {previous ? (
        <section className="panel history-panel">
          <div><span>PREVIOUS TRUTH</span><h2>{previous.value}</h2><StatusBadge status={previous.status} /></div>
          <span className="history-arrow">→</span>
          <div><span>CURRENT TRUTH</span><h2>{claim.value}</h2><StatusBadge status={claim.status} /></div>
        </section>
      ) : null}
    </AppShell>
  );
}
