import { notFound } from "next/navigation";
import { AppShell } from "../../../../../components/app-shell";
import { PageHeader } from "../../../../../components/page-header";
import { TruthBoard } from "../../../../../components/truth-board";
import { projectSnapshot } from "../../../../../lib/project-data";

export const dynamic = "force-dynamic";

export default async function TruthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();

  return (
    <AppShell snapshot={snapshot}>
      <PageHeader
        eyebrow="CANONICAL PROJECT STATE"
        title="Project Truth"
        copy="Current implementation, historical state, evidence, confidence, and contradictions — without collapsing them into a generic summary."
      />
      <TruthBoard claims={snapshot.truths} projectId={snapshot.projectId} />
    </AppShell>
  );
}
