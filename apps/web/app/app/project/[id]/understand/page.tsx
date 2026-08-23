import { notFound } from "next/navigation";

import { AppShell } from "../../../../../components/app-shell";
import { PageHeader } from "../../../../../components/page-header";
import { UnderstandExplorer } from "../../../../../components/understand-explorer";
import { projectSnapshot } from "../../../../../lib/project-data";

export const dynamic = "force-dynamic";

export default async function UnderstandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();
  return (
    <AppShell snapshot={snapshot}>
      <PageHeader eyebrow="UNDERSTAND YOUR PROJECT" title="Ask from verified state." copy="Plain-language explanations grounded in current Project Truth — with technical depth and evidence when you need it." />
      <UnderstandExplorer projectId={snapshot.projectId} />
    </AppShell>
  );
}
