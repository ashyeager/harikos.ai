"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface RepositoryOption {
  installationId: string;
  githubRepositoryId: string;
  owner: string;
  name: string;
  defaultBranch: string;
  private: boolean;
}

export function RepositorySelector() {
  const router = useRouter();
  const [repositories, setRepositories] = useState<RepositoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string>();
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/github/repositories", { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) return [];
        if (!response.ok) throw new Error("Repository lookup failed.");
        const body = (await response.json()) as { repositories?: RepositoryOption[] };
        return body.repositories ?? [];
      })
      .then(setRepositories)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage(error instanceof Error ? error.message : "Repository lookup failed.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  async function connect(repository: RepositoryOption) {
    setConnecting(repository.githubRepositoryId);
    setMessage(undefined);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(repository),
      });
      const body = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !body.id) {
        setMessage(body.error ?? "Repository connection failed.");
        return;
      }
      const scanResponse = await fetch(`/api/projects/${body.id}/scan`, { method: "POST" });
      const scanBody = (await scanResponse.json()) as { projectId?: string; error?: string };
      if (!scanResponse.ok || !scanBody.projectId) {
        setMessage(scanBody.error ?? "Project created, but its first scan failed.");
        return;
      }
      router.push(`/app/project/${body.id}`);
      router.refresh();
    } catch {
      setMessage("Repository connection could not reach the server.");
    } finally {
      setConnecting(undefined);
    }
  }

  if (loading) {
    return <div className="repository-loader"><i className="button-spinner" /> Checking authorized repositories…</div>;
  }
  if (repositories.length === 0) {
    return (
      <section className="panel repository-selector">
        <div className="panel-heading"><div><span>GITHUB INSTALLATIONS</span><h2>Authorize a repository</h2></div></div>
        <p>Install the read-only HARIKOS GitHub App, choose repositories, then return here to analyze them.</p>
        <a className="button button-dark" href="/api/github/install/start">Install GitHub App <span>→</span></a>
        {message ? <p className="inline-error" role="alert">{message}</p> : null}
      </section>
    );
  }
  return (
    <section className="panel repository-selector">
      <div className="panel-heading"><div><span>GITHUB INSTALLATIONS</span><h2>Select a repository</h2></div></div>
      {repositories.map((repository) => (
        <button disabled={connecting !== undefined} key={repository.githubRepositoryId} onClick={() => connect(repository)} type="button">
          <span className="repo-avatar">{repository.name.slice(0, 2).toUpperCase()}</span>
          <span><strong>{repository.owner} / {repository.name}</strong><small>{repository.private ? "Private" : "Public"} · {repository.defaultBranch}</small></span>
          <b>{connecting === repository.githubRepositoryId ? "Analyzing…" : "Connect →"}</b>
        </button>
      ))}
      {message ? <p className="inline-error" role="alert">{message}</p> : null}
    </section>
  );
}
