import { notFound } from "next/navigation";

import { AppShell } from "../../../../../components/app-shell";
import { PageHeader } from "../../../../../components/page-header";
import { TruthCard } from "../../../../../components/truth-card";
import { projectSnapshot } from "../../../../../lib/project-data";

export const dynamic = "force-dynamic";

export default async function TruthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();
  const categories = [...new Set(snapshot.truths.map((claim) => claim.category))];
  return (
    <AppShell snapshot={snapshot}>
      <PageHeader eyebrow="CANONICAL PROJECT STATE" title="Project Truth" copy="Current implementation, historical state, evidence, confidence, and contradictions — without collapsing them into a generic summary." />
      <div className="filter-bar" aria-label="Truth summary">
        <span>ALL <b>{snapshot.truths.length}</b></span>
        <span className="selected-filter">VERIFIED <b>{snapshot.truths.filter((claim) => claim.status === "verified").length}</b></span>
        <span>SUPERSEDED <b>{snapshot.truths.filter((claim) => claim.status === "superseded").length}</b></span>
        <span>CONTRADICTED <b>{snapshot.truths.filter((claim) => claim.status === "contradicted").length}</b></span>
      </div>
      {categories.map((category) => (
        <section className="truth-category-section" key={category}>
          <div className="category-heading"><h2>{category}</h2><span>{snapshot.truths.filter((claim) => claim.category === category).length} claims</span></div>
          <div className="truth-card-grid">
            {snapshot.truths.filter((claim) => claim.category === category).map((claim) => <TruthCard claim={claim} projectId={snapshot.projectId} key={claim.id} />)}
          </div>
        </section>
      ))}
    </AppShell>
  );
}
