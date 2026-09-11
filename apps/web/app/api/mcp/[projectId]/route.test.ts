import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as CloudProjects from "../../../../lib/cloud-projects";

vi.mock("../../../../lib/cloud-projects", async (importOriginal) => {
  const actual = await importOriginal<typeof CloudProjects>();
  return { ...actual, authenticateAgentToken: vi.fn(), createAgentMemory: vi.fn(), loadCloudSnapshotForAgent: vi.fn() };
});

import { authenticateAgentToken, createAgentMemory, loadCloudSnapshotForAgent } from "../../../../lib/cloud-projects";
import { ProductAccessError } from "../../../../lib/entitlements";
import { GET, POST } from "./route";

function call(body: unknown, token = "test-token", origin?: string) {
  return POST(new Request("https://harikos.example/api/mcp/project", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}`, ...(origin ? { origin } : {}) },
    body: JSON.stringify(body),
  }), { params: Promise.resolve({ projectId: "project" }) });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authenticateAgentToken).mockResolvedValue({ projectId: "project", connectionId: "connection" });
});

describe("remote MCP transport", () => {
  it("accepts initialization then acknowledges notifications without a JSON body", async () => {
    const initialized = await call({ jsonrpc: "2.0", id: 1, method: "initialize" });
    expect(await initialized.json()).toMatchObject({ id: 1, result: { protocolVersion: "2025-06-18" } });
    const response = await call({ jsonrpc: "2.0", method: "notifications/initialized" });
    expect(response.status).toBe(202);
    expect(await response.text()).toBe("");
  });

  it("publishes actionable input schemas for memory, context and outcomes", async () => {
    const response = await call({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    const { result } = await response.json();
    expect(result.tools).toHaveLength(9);
    expect(result.tools.find((tool: { name: string }) => tool.name === "record_memory").inputSchema.required).toEqual(expect.arrayContaining(["type", "content"]));
    expect(result.tools.find((tool: { name: string }) => tool.name === "get_context_pack").inputSchema.required).toContain("task");
    expect(result.tools.find((tool: { name: string }) => tool.name === "record_outcome").inputSchema.required).toContain("sessionId");
  });

  it("rejects malformed arguments before snapshot access", async () => {
    const response = await call({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "search_project_memory", arguments: { query: 123 } } });
    expect(await response.json()).toMatchObject({ id: 3, result: { isError: true } });
    expect(loadCloudSnapshotForAgent).not.toHaveBeenCalled();
  });

  it("rejects revoked and cross-project tokens", async () => {
    vi.mocked(authenticateAgentToken).mockResolvedValueOnce(undefined);
    expect((await call({ id: 4, method: "tools/list" })).status).toBe(401);
    vi.mocked(authenticateAgentToken).mockResolvedValueOnce({ projectId: "other", connectionId: "connection" });
    expect((await call({ id: 5, method: "tools/list" })).status).toBe(401);
  });

  it("rejects cross-origin requests before authentication", async () => {
    expect((await call({ id: 6, method: "tools/list" }, "test-token", "https://untrusted.example")).status).toBe(403);
    expect(authenticateAgentToken).not.toHaveBeenCalled();
  });

  it("advertises unsupported SSE with 405", async () => {
    expect((await GET()).status).toBe(405);
  });

  it("checks assumptions against current truth instead of superseded history", async () => {
    vi.mocked(loadCloudSnapshotForAgent).mockResolvedValue({
      repository: { name: "repo", headSha: "abc" },
      truths: [
        { id: "old", category: "Authentication", subject: "authentication", predicate: "provider", value: "Clerk", scope: "application", epistemicType: "derived", claimKind: "implementation", confidence: 0.9, status: "superseded", validFrom: "2026-09-10T00:00:00.000Z", validTo: "2026-09-11T00:00:00.000Z", firstSeenAt: "2026-09-10T00:00:00.000Z", lastVerifiedAt: "2026-09-11T00:00:00.000Z", supersedesClaimId: null, evidence: [] },
        { id: "current", category: "Authentication", subject: "authentication", predicate: "provider", value: "Supabase Auth", scope: "application", epistemicType: "derived", claimKind: "implementation", confidence: 0.95, status: "verified", validFrom: "2026-09-11T00:00:00.000Z", validTo: null, firstSeenAt: "2026-09-11T00:00:00.000Z", lastVerifiedAt: "2026-09-11T00:00:00.000Z", supersedesClaimId: "old", evidence: [] },
      ],
      contradictions: [],
      changes: [],
    } as never);
    const response = await call({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "check_assumption", arguments: { statement: "Authentication uses Clerk" } } });
    const body = await response.json();
    expect(JSON.parse(body.result.content[0].text)).toMatchObject({ status: "CONTRADICTED", matches: [{ id: "current" }] });
  });

  it("binds recorded session memory to the authenticated connection", async () => {
    vi.mocked(loadCloudSnapshotForAgent).mockResolvedValue({ repository: { name: "repo", headSha: "abc" }, truths: [], contradictions: [], changes: [] } as never);
    vi.mocked(createAgentMemory).mockResolvedValue({ id: "memory", projectId: "project", type: "decision", content: "Use Supabase", status: "active", importance: 0.5, agent: "remote-agent", sessionId: null, createdAt: "2026-09-11T00:00:00.000Z" });
    const response = await call({ jsonrpc: "2.0", id: 8, method: "tools/call", params: { name: "record_memory", arguments: { type: "decision", content: "Use Supabase" } } });
    expect(response.status).toBe(200);
    expect(createAgentMemory).toHaveBeenCalledWith("project", "connection", expect.objectContaining({ content: "Use Supabase" }));
  });

  it("denies MCP access when the token owner has no active entitlement", async () => {
    vi.mocked(authenticateAgentToken).mockRejectedValueOnce(new ProductAccessError());
    const response = await call({ jsonrpc: "2.0", id: 9, method: "tools/list" });
    expect(response.status).toBe(402);
    expect(await response.json()).toMatchObject({ code: "PAYMENT_REQUIRED" });
  });
});
