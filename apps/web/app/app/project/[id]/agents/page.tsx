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
  return <AppShell snapshot={snapshot}><PageHeader eyebrow="AGENT BRIDGE" title="Connect a coding agent." copy="Create a scoped bearer token for the remote HARIKOS MCP endpoint. The token is shown once." /><AgentConnectionForm projectId={id} initialConnections={connections} /></AppShell>;
}
