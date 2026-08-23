"use client";

import { useState } from "react";

const suggestions = [
  "How does authentication work?",
  "How is the database structured?",
  "What changed recently?",
];

export function UnderstandExplorer({ projectId }: { projectId: string }) {
  const [question, setQuestion] = useState(suggestions[0]!);
  const [mode, setMode] = useState<"simple" | "technical" | "evidence">("simple");
  const [answer, setAnswer] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function ask() {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/understand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode }),
      });
      const body = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !body.answer) {
        setError(body.error ?? "HARIKOS could not prepare a grounded answer.");
        return;
      }
      setAnswer(body.answer);
    } catch {
      setError("HARIKOS could not reach the project service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="understand-explorer">
      <div className="question-suggestions">
        {suggestions.map((suggestion) => (
          <button key={suggestion} onClick={() => setQuestion(suggestion)} type="button">{suggestion}<span>→</span></button>
        ))}
      </div>
      <div className="question-panel panel">
        <label htmlFor="project-question">Ask about the verified project</label>
        <div className="question-input-row">
          <input id="project-question" onChange={(event) => setQuestion(event.target.value)} value={question} />
          <button className="button button-dark" disabled={loading || !question.trim()} onClick={ask} type="button">{loading ? "Checking evidence…" : "Ask HARIKOS"}</button>
        </div>
        <div className="mode-switch" aria-label="Answer depth">
          {(["simple", "technical", "evidence"] as const).map((item) => (
            <button className={mode === item ? "active" : ""} key={item} onClick={() => setMode(item)} type="button">{item}</button>
          ))}
        </div>
      </div>
      {error ? <p className="inline-error" role="alert">{error}</p> : null}
      {answer ? (
        <article className="answer-panel panel" aria-live="polite">
          <div className="answer-heading"><span className="answer-mark">H</span><div><small>GROUNDED IN PROJECT TRUTH</small><strong>{mode} answer</strong></div></div>
          <p>{answer}</p>
          <div className="answer-footer"><span>Generated from current verified claims</span><span>Not generic repo chat</span></div>
        </article>
      ) : null}
    </div>
  );
}
