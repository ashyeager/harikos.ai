"use client";

import { useState } from "react";

import type { AgentConnection } from "../lib/cloud-projects";

type PendingAction = "create" | string;

export function AgentConnectionForm({ projectId, initialConnections }: { projectId: string; initialConnections: AgentConnection[] }) {
  const [connections, setConnections] = useState(initialConnections);
  const [name, setName] = useState("Codex");
  const [token, setToken] = useState<string>();
  const [pending, setPending] = useState<PendingAction>();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();
  const endpoint = `/api/mcp/${projectId}`;
  const config = token ? `Endpoint: ${endpoint}\nAuthorization: Bearer ${token}` : "";

  async function create() {
    if (!name.trim()) { setError("Give this connection a recognizable name."); return; }
    setPending("create"); setError(undefined); setCopied(false); setToken(undefined);
    try {
      const response = await fetch(`/api/projects/${projectId}/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const body = await response.json() as { connection?: AgentConnection; token?: string; error?: string };
      if (!response.ok || !body.connection || !body.token) throw new Error(body.error ?? "Connection could not be created.");
      setConnections((current) => [...current, body.connection!]);
      setToken(body.token);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connection could not be created.");
    } finally {
      setPending(undefined);
    }
  }

  async function revoke(id: string) {
    setPending(id); setError(undefined);
    try {
      const response = await fetch(`/api/projects/${projectId}/agents?connectionId=${encodeURIComponent(id)}`, { method: "DELETE" });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Connection could not be revoked.");
      setConnections((current) => current.map((connection) => connection.id === id ? { ...connection, revokedAt: new Date().toISOString() } : connection));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connection could not be revoked.");
    } finally {
      setPending(undefined);
    }
  }

  async function copyConfig() {
    if (!config) return;
    const absoluteConfig = config.replace(endpoint, new URL(endpoint, window.location.origin).toString());
    try { await navigator.clipboard.writeText(absoluteConfig); setCopied(true); }
    catch { setError("Copy was blocked by the browser. Select the configuration manually."); }
  }

  return (
    <section className="agent-console">
      <article className="panel agent-create-card">
        <div className="panel-heading"><div><span>NEW CONNECTION</span><h2>Generate project access</h2></div><b>PLAINTEXT ONCE</b></div>
        <div className="agent-create-body">
          <label htmlFor="agent-name">Connection name</label>
          <input id="agent-name" maxLength={100} onChange={(event) => setName(event.target.value)} placeholder="e.g. Codex laptop" value={name} />
          <p>Name the agent and device so access remains easy to audit and revoke.</p>
          <button className="button button-dark full-button" disabled={pending !== undefined} onClick={create} type="button">{pending === "create" ? "Generating securely..." : "Generate connection token"} <span>&rarr;</span></button>
          {error ? <p className="inline-error" role="alert">{error}</p> : null}
        </div>
      </article>

      <article className={`panel agent-token-card ${token ? "has-token" : ""}`}>
        <div className="panel-heading"><div><span>ONE-TIME SECRET</span><h2>{token ? "Configure your MCP client" : "Waiting for generation"}</h2></div><b>{token ? "COPY NOW" : "NOT CREATED"}</b></div>
        {token ? <div className="agent-token-body"><p>This token will not be displayed again. Copy it before leaving this page.</p><pre>{config}</pre><button className="button button-ghost full-button" onClick={copyConfig} type="button">{copied ? "Configuration copied" : "Copy endpoint + token"}</button></div> : <div className="agent-token-empty"><span>H</span><p>A generated token appears here once. HARIKOS stores only its secure hash and identifying prefix.</p></div>}
      </article>

      <article className="panel agent-connection-list">
        <div className="panel-heading"><div><span>REMOTE MCP</span><h2>Agent connections</h2></div><b>{connections.filter((connection) => !connection.revokedAt).length} ACTIVE</b></div>
        {connections.length === 0 ? <div className="agent-list-empty"><span>NO CONNECTIONS</span><p>Create the first project-scoped connection above. No agent is shown as online until it makes an authenticated request.</p></div> : connections.map((connection) => (
          <div className="agent-connection-row" key={connection.id}>
            <span className="agent-mark">{connection.name.slice(0, 2).toUpperCase()}</span>
            <div><strong>{connection.name}</strong><small>{connection.tokenPrefix}… · created {new Date(connection.createdAt).toLocaleDateString()}</small></div>
            <div className="agent-use-state"><span className={connection.revokedAt ? "revoked" : connection.lastUsedAt ? "used" : "unused"}>{connection.revokedAt ? "REVOKED" : connection.lastUsedAt ? "USED" : "AWAITING FIRST REQUEST"}</span>{connection.lastUsedAt ? <small>{new Date(connection.lastUsedAt).toLocaleString()}</small> : null}</div>
            {!connection.revokedAt ? <button disabled={pending !== undefined} onClick={() => revoke(connection.id)} type="button">{pending === connection.id ? "Revoking..." : "Revoke"}</button> : null}
          </div>
        ))}
      </article>
    </section>
  );
}
