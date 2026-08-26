import { notFound } from "next/navigation";
import { AppShell } from "../../../../../components/app-shell";
import { MemoryComposer } from "../../../../../components/memory-composer";
import { PageHeader } from "../../../../../components/page-header";
import { getAuthIdentity } from "../../../../../lib/auth";
import { listCloudMemories } from "../../../../../lib/cloud-projects";
import { projectSnapshot } from "../../../../../lib/project-data";

export const dynamic = "force-dynamic";

export default async function MemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();

  const identity = snapshot.mode === "github" ? await getAuthIdentity() : undefined;
  const memories = identity ? await listCloudMemories(identity, id) : [];

  return (
    <AppShell snapshot={snapshot}>
      <PageHeader 
        eyebrow="TEMPORAL LOG" 
        title="Project Memory" 
        copy="Decisions, failures, constraints, and outcomes persist separately from current Truth. Don't let your agents repeat the same mistakes." 
      />
      <MemoryComposer projectId={id} initialMemories={memories} />
    </AppShell>
  );
}
