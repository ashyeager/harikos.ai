import { NextResponse } from "next/server";

import { authenticateAgentToken, createAgentMemory, createCloudMemorySchema, loadCloudSnapshotForAgent, listAgentMemories } from "../../../../lib/cloud-projects";
import { getAuthIdentity } from "../../../../lib/auth";

export const runtime = "nodejs";

function rpc(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const token = request.headers.get("authorization")?.match(/^Bearer\\s+(.+)$/iu)?.[1];
  if (!token) return NextResponse.json({ error: "Bearer token required." }, { status: 401 });
  const { projectId } = await params;
  try {
    const auth = await authenticateAgentToken(token);
    if (!auth || auth.projectId !== projectId) return NextResponse.json({ error: "Agent token is invalid or revoked." }, { status: 401 });
    const body = (await request.json()) as { id?: unknown; method?: string; params?: { task?: string } };
    if (body.method === "initialize") return rpc(body.id, { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "harikos", version: "0.1.0" } });
    if (body.method === "tools/list") return rpc(body.id, { tools: [{ name: "get_project_truth", description: "Read current evidence-backed project Truth.", inputSchema: { type: "object" } }, { name: "search_project_memory", description: "Search persisted project Memory.", inputSchema: { type: "object", properties: { query: { type: "string" } } } }, { name: "get_context_pack", description: "Prepare current Truth context for a task.", inputSchema: { type: "object", properties: { task: { type: "string" } }, required: ["task"] } }, { name: "record_memory", description: "Persist a project decision, attempt, constraint, or outcome.", inputSchema: { type: "object", properties: { type: { type: "string" }, content: { type: "string" } }, required: ["type", "content"] } }] });
    if (body.method === "tools/call") {
      const name = (body.params as { name?: string } | undefined)?.name;
      const snapshot = await loadCloudSnapshotForAgent(projectId);
      if (!snapshot) return rpc(body.id, { isError: true, content: [{ type: "text", text: "Project has no completed scan." }] });
      if (name === "get_project_truth") return rpc(body.id, { content: [{ type: "text", text: JSON.stringify(snapshot.truths.filter((claim) => ["verified", "likely"].includes(claim.status))) }] });
      if (name === "search_project_memory") {
        const query = ((body.params as { arguments?: { query?: string } } | undefined)?.arguments?.query ?? "").toLowerCase();
        const memories = await listAgentMemories(projectId);
        return rpc(body.id, { content: [{ type: "text", text: JSON.stringify(memories.filter((memory) => !query || memory.content.toLowerCase().includes(query) || memory.type.includes(query))) }] });
      }
      if (name === "record_memory") {
        const args = (body.params as { arguments?: { type?: string; content?: string } } | undefined)?.arguments;
        const memory = await createAgentMemory(projectId, createCloudMemorySchema.parse({ type: args?.type, content: args?.content, agent: "remote-agent" }));
        return rpc(body.id, { content: [{ type: "text", text: JSON.stringify(memory) }] });
      }
      if (name === "get_context_pack") {
        const task = (body.params as { arguments?: { task?: string } } | undefined)?.arguments?.task;
        if (!task) return rpc(body.id, { isError: true, content: [{ type: "text", text: "task is required" }] });
        const { composeContextPack } = await import("@harikos/core");
        return rpc(body.id, { content: [{ type: "text", text: composeContextPack(snapshot, task).text }] });
      }
      return rpc(body.id, { isError: true, content: [{ type: "text", text: "Unknown tool." }] });
    }
    return rpc(body.id, {});
  } catch {
    return NextResponse.json({ error: "MCP request failed." }, { status: 500 });
  }
}

export async function GET() {
  const identity = await getAuthIdentity();
  return identity ? NextResponse.json({ transport: "streamable-http", endpoint: "POST /api/mcp/:projectId" }) : NextResponse.json({ error: "Authentication required." }, { status: 401 });
}
