import { NextResponse } from "next/server";

import { authenticateAgentToken, beginAgentSession, createAgentMemory, createCloudMemorySchema, finishAgentSession, loadCloudSnapshotForAgent, listAgentMemories, recordAgentOutcome, outcomeSchema } from "../../../../lib/cloud-projects";
import { z } from "zod";

export const runtime = "nodejs";

const toolInputs = {
  get_project_truth: z.object({}),
  search_project_memory: z.object({ query: z.string().optional() }),
  get_recent_changes: z.object({}),
  get_context_pack: z.object({ task: z.string().trim().min(1) }),
  record_memory: createCloudMemorySchema.pick({ type: true, content: true, sessionId: true }),
  record_outcome: outcomeSchema.extend({ sessionId: z.string().uuid() }),
  check_assumption: z.object({ statement: z.string().trim().min(1) }),
  begin_agent_session: z.object({ task: z.string().trim().min(1).max(2_000).optional() }),
  end_agent_session: z.object({ sessionId: z.string().uuid(), status: z.enum(["completed", "failed", "abandoned"]).optional() }),
};

function rpc(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/iu)?.[1];
  if (!token) return NextResponse.json({ error: "Bearer token required." }, { status: 401 });
  const { projectId } = await params;
  try {
    const auth = await authenticateAgentToken(token);
    if (!auth || auth.projectId !== projectId) return NextResponse.json({ error: "Agent token is invalid or revoked." }, { status: 401 });
    const body = (await request.json()) as { id?: unknown; method?: string; params?: { task?: string } };
    if (body.id === undefined && body.method?.startsWith("notifications/")) return new Response(null, { status: 202 });
    if (body.method === "initialize") return rpc(body.id, { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "harikos", version: "0.1.0" } });
    if (body.method === "tools/list") return rpc(body.id, { tools: Object.entries(toolInputs).map(([name, schema]) => ({ name, description: `HARIKOS ${name}`, inputSchema: z.toJSONSchema(schema, { io: "input" }) })) });
    if (body.method === "tools/call") {
      const params = body.params as { name?: string; arguments?: Record<string, unknown> } | undefined;
      const name = params?.name;
      const args = params?.arguments ?? {};
      const schema = name && Object.hasOwn(toolInputs, name) ? toolInputs[name as keyof typeof toolInputs] : undefined;
      if (!schema || !schema.safeParse(args).success) return rpc(body.id, { isError: true, content: [{ type: "text", text: schema ? "Invalid tool arguments. Consult tools/list for the input schema." : "Unknown tool." }] });
      if (name === "begin_agent_session") {
        const session = await beginAgentSession(projectId, auth.connectionId, typeof args.task === "string" ? args.task : undefined);
        return rpc(body.id, { content: [{ type: "text", text: JSON.stringify(session) }] });
      }
      if (name === "end_agent_session") {
        if (typeof args.sessionId !== "string") return rpc(body.id, { isError: true, content: [{ type: "text", text: "sessionId is required" }] });
        const status = args.status === "failed" || args.status === "abandoned" ? args.status : "completed";
        const session = await finishAgentSession(projectId, auth.connectionId, args.sessionId, status);
        return rpc(body.id, { content: [{ type: "text", text: JSON.stringify(session) }] });
      }
      if (name === "record_outcome") {
        if (typeof args.sessionId !== "string") return rpc(body.id, { isError: true, content: [{ type: "text", text: "sessionId is required" }] });
        const outcome = await recordAgentOutcome(projectId, auth.connectionId, args.sessionId, outcomeSchema.parse({ summary: args.summary, status: args.status, metadata: args.metadata }));
        return rpc(body.id, { content: [{ type: "text", text: JSON.stringify(outcome) }] });
      }
      const snapshot = await loadCloudSnapshotForAgent(projectId);
      if (!snapshot) return rpc(body.id, { isError: true, content: [{ type: "text", text: "Project has no completed scan." }] });
      if (name === "get_project_truth") return rpc(body.id, { content: [{ type: "text", text: JSON.stringify(snapshot.truths.filter((claim) => ["verified", "likely"].includes(claim.status))) }] });
      if (name === "search_project_memory") {
        const query = ((body.params as { arguments?: { query?: string } } | undefined)?.arguments?.query ?? "").toLowerCase();
        const memories = await listAgentMemories(projectId);
        return rpc(body.id, { content: [{ type: "text", text: JSON.stringify(memories.filter((memory) => !query || memory.content.toLowerCase().includes(query) || memory.type.includes(query))) }] });
      }
      if (name === "record_memory") {
        const memory = await createAgentMemory(projectId, createCloudMemorySchema.parse({ type: args.type, content: args.content, agent: "remote-agent", sessionId: args.sessionId }));
        return rpc(body.id, { content: [{ type: "text", text: JSON.stringify(memory) }] });
      }
      if (name === "get_recent_changes") return rpc(body.id, { content: [{ type: "text", text: JSON.stringify(snapshot.changes.slice(-10)) }] });
      if (name === "check_assumption") {
        const statement = typeof args.statement === "string" ? args.statement.toLowerCase() : "";
        const matches = snapshot.truths.filter((claim) => statement.includes(claim.subject.toLowerCase()) || statement.includes(claim.value.toLowerCase()));
        const contradicted = matches.some((claim) => claim.status === "superseded" || !statement.includes(claim.value.toLowerCase()));
        return rpc(body.id, { content: [{ type: "text", text: JSON.stringify({ status: matches.length === 0 ? "UNVERIFIED" : contradicted ? "CONTRADICTED" : "SUPPORTED", matches }) }] });
      }
      if (name === "get_context_pack") {
        const task = typeof args.task === "string" ? args.task : undefined;
        if (!task) return rpc(body.id, { isError: true, content: [{ type: "text", text: "task is required" }] });
        const { composeContextPack } = await import("@harikos/core");
        const memories = await listAgentMemories(projectId);
        return rpc(body.id, { content: [{ type: "text", text: composeContextPack(snapshot, task, () => new Date(), memories).text }] });
      }
      return rpc(body.id, { isError: true, content: [{ type: "text", text: "Unknown tool." }] });
    }
    if (body.method === "ping") return rpc(body.id, {});
    return NextResponse.json({ jsonrpc: "2.0", id: body.id ?? null, error: { code: -32601, message: "Method not found" } });
  } catch (error) {
    const cause = error instanceof Error ? error.cause : undefined;
    const code =
      cause && typeof cause === "object" && "code" in cause
        ? String(cause.code)
        : "unclassified";
    console.error("[mcp] request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      code,
    });
    return NextResponse.json({ error: "MCP request failed." }, { status: 500 });
  }
}

export async function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
