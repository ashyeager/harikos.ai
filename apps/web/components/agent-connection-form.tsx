"use client";

import { useState } from "react";
import type { AgentConnection } from "../lib/cloud-projects";

export function AgentConnectionForm({ projectId, initialConnections }: { projectId: string; initialConnections: AgentConnection[] }) {
  const [connections, setConnections] = useState(initialConnections);
  const [name, setName] = useState("Claude Code");
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<string>();
  async function create() {
    const response = await fetch(`/api/projects/${projectId}/agents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const body = await response.json() as { connection?: AgentConnection; token?: string; error?: string };
    if (!response.ok || !body.connection || !body.token) { setError(body.error ?? "Connection could not be created."); return; }
    setConnections((current) => [...current, body.connection!]); setToken(body.token);
  }
  async function revoke(id: string) {
    await fetch(`/api/projects/${projectId}/agents?connectionId=${encodeURIComponent(id)}`, { method: "DELETE" });
    setConnections((current) => current.map((connection) => connection.id === id ? { ...connection, revokedAt: new Date().toISOString() } : connection));
  }
  return <section className="panel memory-list"><div className="panel-heading"><div><span>REMOTE MCP</span><h2>Agent connections</h2></div></div><input aria-label="Connection name" onChange={(event) => setName(event.target.value)} value={name} /><button className="button button-dark" onClick={create} type="button">Generate connection token</button>{token ? <pre>{token}{"\n\n"}POST /api/mcp/{projectId}{"\n"}Authorization: Bearer {token}</pre> : null}{error ? <p className="inline-error" role="alert">{error}</p> : null}{connections.map((connection) => <div className="memory-row" key={connection.id}><strong>{connection.name}</strong><small>{connection.tokenPrefix}… {connection.revokedAt ? "revoked" : "active"}</small>{!connection.revokedAt ? <button onClick={() => revoke(connection.id)} type="button">Revoke</button> : null}</div>)}</section>;
}
