"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui-primitives";
import { useToast } from "./ux-provider";

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
  const [createdProjectId, setCreatedProjectId] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);
  const [connectingStage, setConnectingStage] = useState<"creating" | "scanning">();
  const { notify } = useToast();

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/github/repositories", { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) throw new Error("Sign in to view repositories authorized for HARIKOS.");
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
  }, [reloadKey]);

  async function connect(repository: RepositoryOption) {
    setConnecting(repository.githubRepositoryId);
    setConnectingStage("creating");
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
        notify({ message: body.error ?? "Repository connection failed.", tone: "error" });
        return;
      }

      setCreatedProjectId(body.id);
      setConnectingStage("scanning");

      const scanResponse = await fetch(`/api/projects/${body.id}/scan`, { method: "POST" });
      const scanBody = (await scanResponse.json()) as { projectId?: string; error?: string };
      
      if (!scanResponse.ok || !scanBody.projectId) {
        setMessage(scanBody.error ?? "Project created, but its first scan failed. You can open it and retry.");
        notify({ message: "Project created, but its first scan needs attention.", tone: "error" });
        return;
      }

      notify({ message: "Repository connected and scanned.", tone: "success" });
      router.push(`/app/project/${body.id}`);
      router.refresh();
    } catch {
      setMessage("Repository connection could not reach the server.");
    } finally {
      setConnecting(undefined);
      setConnectingStage(undefined);
    }
  }

  if (loading) {
    return (
      <div aria-label="Loading authorized repositories" aria-live="polite" className="repository-skeleton" role="status">
        {Array.from({ length: 3 }, (_, index) => <div key={index}><Skeleton className="repository-avatar-skeleton" /><span><Skeleton className="repository-name-skeleton" /><Skeleton className="repository-meta-skeleton" /></span><Skeleton className="repository-action-skeleton" /></div>)}
        <span className="sr-only">Checking authorized repositories.</span>
      </div>
    );
  }

  if (message && repositories.length === 0) {
    return <section className="bg-ink border border-line mt-8 p-8" role="alert"><span className="font-mono text-[10px] tracking-widest text-muted uppercase">REPOSITORY LOOKUP</span><h2 className="text-lg font-bold text-white mt-2">Repositories could not be loaded.</h2><p className="text-muted text-sm mt-2">{message} Check your session or connection, then retry.</p><button className="button button-ghost mt-5" onClick={() => { setMessage(undefined); setLoading(true); setReloadKey((value) => value + 1); }} type="button">Retry repository lookup</button></section>;
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
          <a href="/api/github/install/start" className="h-12 px-6 flex items-center justify-center gap-2 bg-paper text-black hover:bg-paper-soft font-mono font-bold text-xs tracking-wide transition-colors">
            Install GitHub App &rarr;
          </a>
          {createdProjectId && <a className="text-orange text-xs" href={`/app/project/${createdProjectId}`}>Open the created project →</a>}
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
            <b className="font-mono text-[9px] text-muted group-hover:text-orange transition-colors self-start md:self-auto mt-2 md:mt-0">
              {connecting === repository.githubRepositoryId ? connectingStage === "scanning" ? "Scanning repository…" : "Creating project…" : "Connect \u2192"}
            </b>
          </button>
        ))}
      </div>
      <div aria-live="polite" className={`p-4 border-t border-line ${(message || createdProjectId || connecting) ? "" : "sr-only"}`} role="status">
        {connecting ? <p className="text-muted text-xs">{connectingStage === "scanning" ? "Project created. HARIKOS is scanning repository evidence…" : "Creating the project with verified repository ownership…"}</p> : null}
        {message && <p className="text-red text-xs" role="alert">{message}</p>}
        {createdProjectId && <a className="text-orange text-xs" href={`/app/project/${createdProjectId}`}>Open the created project →</a>}
      </div>
    </section>
  );
}
