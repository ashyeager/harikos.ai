import { notFound } from "next/navigation";
import { AppShell } from "../../../../../components/app-shell";
import { ContextComposer } from "../../../../../components/context-composer";
import { PageHeader } from "../../../../../components/page-header";
import { projectSnapshot } from "../../../../../lib/project-data";

export const dynamic = "force-dynamic";

export default async function ContextPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();

  return (
    <AppShell snapshot={snapshot}>
      <PageHeader 
        eyebrow="AGENT INSTRUCTION" 
        title="Context Pack Builder" 
        copy="Generate highly compressed, task-specific context containing current truths, recent changes, and project memory. Perfect for pasting into Claude, Cursor, or Aider." 
      />
      <ContextComposer projectId={snapshot.projectId} />
    </AppShell>
  );
}
