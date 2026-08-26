import { notFound } from "next/navigation";
import { AppShell } from "../../../../../components/app-shell";
import { PageHeader } from "../../../../../components/page-header";
import { getAuthIdentity } from "../../../../../lib/auth";
import { listAgentConnections } from "../../../../../lib/cloud-projects";
import { projectSnapshot } from "../../../../../lib/project-data";
import { AgentConnectionForm } from "../../../../../components/agent-connection-form";

export const dynamic = "force-dynamic";

export default async function AgentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();

  const identity = snapshot.mode === "github" ? await getAuthIdentity() : undefined;
  const connections = identity ? await listAgentConnections(identity, id) : [];

  return (
    <AppShell snapshot={snapshot}>
      <PageHeader 
        eyebrow="REMOTE MCP" 
        title="Agent Connections" 
        copy="Create secure, scoped bearer tokens for your coding agents (Codex, Claude, Cursor) to connect to this project's Truth Engine." 
      />
      <AgentConnectionForm projectId={id} initialConnections={connections} />
    </AppShell>
  );
}
