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
      <PageHeader eyebrow="BEFORE YOU BUILD" title="Give your agent current context." copy="Task-specific truth, relevant constraints, recent changes, and evidence — compact enough to use." />
      <ContextComposer projectId={snapshot.projectId} />
    </AppShell>
  );
}
