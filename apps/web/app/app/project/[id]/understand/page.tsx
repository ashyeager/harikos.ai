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
      <PageHeader 
        eyebrow="UNDERSTAND YOUR PROJECT" 
        title="Grounded Intelligence" 
        copy="Ask plain-language questions about your codebase. Every answer is strictly grounded in current Project Truth — avoiding generic LLM hallucinations." 
      />
      <UnderstandExplorer projectId={snapshot.projectId} />
    </AppShell>
  );
}
