"use client";

import { useState } from "react";
import type { CloudMemory } from "../lib/cloud-projects";

const memoryTypes = ["decision", "attempt", "failed_attempt", "fix", "bug", "root_cause", "constraint", "discovery", "outcome", "incident", "note"] as const;

export function MemoryComposer({ projectId, initialMemories }: { projectId: string; initialMemories: CloudMemory[] }) {
  const [memories, setMemories] = useState(initialMemories);
  const [type, setType] = useState<(typeof memoryTypes)[number]>("note");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  async function save() {
    setSaving(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content }),
      });
      const body = (await response.json()) as { memory?: CloudMemory; error?: string };
      if (!response.ok || !body.memory) {
        setError(body.error ?? "Memory could not be saved.");
        return;
      }
      setMemories((current) => [body.memory!, ...current]);
      setContent("");
    } catch {
      setError("Memory could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="memory-workbench">
      <section className="panel before-build-panel">
        <span className="eyebrow">CAPTURE PROJECT KNOWLEDGE</span>
        <h2>What should the next agent remember?</h2>
        <select aria-label="Memory type" onChange={(event) => setType(event.target.value as (typeof memoryTypes)[number])} value={type}>
          {memoryTypes.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}
        </select>
        <textarea aria-label="Memory content" onChange={(event) => setContent(event.target.value)} placeholder="Record a decision, constraint, failed attempt, or useful discovery." value={content} />
        <button className="button button-dark" disabled={saving || !content.trim()} onClick={save} type="button">{saving ? "Saving memory…" : "Save memory"}</button>
        {error ? <p className="inline-error" role="alert">{error}</p> : null}
      </section>
      <section className="panel memory-list">
        <div className="panel-heading"><div><span>PERSISTED PROJECT MEMORY</span><h2>{memories.length} records</h2></div></div>
        {memories.length ? memories.map((memory) => (
          <article className="memory-row" key={memory.id}>
            <div><strong>{memory.type.replace("_", " ")}</strong><small>{new Date(memory.createdAt).toLocaleString()}</small></div>
            <p>{memory.content}</p>
            {memory.agent ? <small>Recorded by {memory.agent}</small> : null}
          </article>
        )) : <p className="empty-state">No cloud memories have been recorded for this project yet.</p>}
      </section>
    </div>
  );
}
