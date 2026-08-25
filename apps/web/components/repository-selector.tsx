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
    return (
      <div className="p-8 text-center text-muted font-mono text-xs flex items-center justify-center gap-3 bg-ink border border-line">
        <svg className="animate-spin h-4 w-4 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Checking authorized repositories...
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <section className="bg-ink border border-line mt-8">
        <div className="px-6 py-5 flex flex-col gap-1 border-b border-line">
          <span className="font-mono text-[9px] tracking-widest text-muted uppercase">GITHUB INSTALLATIONS</span>
          <h2 className="text-lg font-bold text-white">Authorize a repository</h2>
        </div>
        <div className="p-8 flex flex-col items-start gap-6">
          <p className="text-muted text-sm">
            Install the read-only HARIKOS GitHub App, choose repositories, then return here to analyze them.
          </p>
          <a href="/api/github/install/start" className="h-12 px-6 flex items-center justify-center gap-2 bg-white text-ink hover:bg-paper-soft font-mono font-bold text-xs tracking-wide transition-colors">
            Install GitHub App &rarr;
          </a>
          {message && <p className="text-red text-xs" role="alert">{message}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-ink border border-line mt-8">
      <div className="px-6 py-5 flex flex-col gap-1 border-b border-line">
        <span className="font-mono text-[9px] tracking-widest text-muted uppercase">GITHUB INSTALLATIONS</span>
        <h2 className="text-lg font-bold text-white">Select a repository</h2>
      </div>
      <div className="flex flex-col divide-y divide-line">
        {repositories.map((repository) => (
          <button 
            disabled={connecting !== undefined} 
            key={repository.githubRepositoryId} 
            onClick={() => connect(repository)} 
            type="button"
            className="w-full text-left p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-ink-soft transition-colors group disabled:opacity-50 disabled:cursor-wait"
          >
            <span className="w-10 h-10 flex items-center justify-center bg-ink border border-line text-white font-mono text-xs font-black shrink-0">
              {repository.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="flex-1 flex flex-col min-w-0 gap-1">
              <strong className="text-sm text-white truncate">{repository.owner} / {repository.name}</strong>
              <span className="text-[10px] text-muted truncate">{repository.private ? "Private" : "Public"} &middot; {repository.defaultBranch}</span>
            </div>
            <b className="font-mono text-[9px] text-muted group-hover:text-cyan transition-colors self-start md:self-auto mt-2 md:mt-0">
              {connecting === repository.githubRepositoryId ? "Analyzing..." : "Connect \u2192"}
            </b>
          </button>
        ))}
      </div>
      {message && <div className="p-4 border-t border-line"><p className="text-red text-xs" role="alert">{message}</p></div>}
    </section>
  );
}
