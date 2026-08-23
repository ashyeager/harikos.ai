"use client";

import { useState } from "react";

interface ContextResult {
  text: string;
  tokenEstimate: number;
  relevantFiles: string[];
  truths: Array<{ id: string; subject: string; value: string; status: string }>;
}

export function ContextComposer({ projectId }: { projectId: string }) {
  const [task, setTask] = useState("Modify authentication middleware");
  const [result, setResult] = useState<ContextResult>();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string>();
  const [error, setError] = useState<string>();

  async function prepare() {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const body = (await response.json()) as ContextResult & { error?: string };
      if (!response.ok || !body.text) {
        setError(body.error ?? "Context generation failed.");
        return;
      }
      setResult(body);
    } catch {
      setError("Context generation could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(label: string) {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(label);
      window.setTimeout(() => setCopied(undefined), 1600);
    } catch {
      setError("Clipboard access was not available. Select the context text manually.");
    }
  }

  return (
    <div className="context-workbench">
      <section className="before-build-panel panel">
        <span className="eyebrow">TASK INPUT</span>
        <h2>What are you about to build?</h2>
        <p>HARIKOS will select current truths, relevant changes, constraints, and evidence — not dump the repository.</p>
        <textarea aria-label="Development task" onChange={(event) => setTask(event.target.value)} value={task} />
        <button className="button button-dark" disabled={loading || !task.trim()} onClick={prepare} type="button">
          {loading ? <><i className="button-spinner" /> Resolving current truth…</> : <>Prepare Agent Context <span>→</span></>}
        </button>
        {error ? <p className="inline-error" role="alert">{error}</p> : null}
      </section>

      <section className={`context-result ${result ? "has-result" : ""}`}>
        {result ? (
          <>
            <div className="context-result-bar"><span>CURRENT PROJECT CONTEXT</span><span>{result.tokenEstimate} estimated tokens</span></div>
            <pre>{result.text}</pre>
            <div className="context-actions">
              {[
                ["context", "Copy Context"],
                ["codex", "Copy for Codex"],
                ["claude", "Copy for Claude"],
                ["cursor", "Copy for Cursor"],
              ].map(([id, label]) => (
                <button key={id} onClick={() => copy(id!)} type="button">{copied === id ? "Copied ✓" : label}</button>
              ))}
            </div>
          </>
        ) : (
          <div className="context-empty"><span>↗</span><strong>Agent context will appear here.</strong><p>Prepare a task to see exactly what HARIKOS would give your coding agent.</p></div>
        )}
      </section>
    </div>
  );
}
