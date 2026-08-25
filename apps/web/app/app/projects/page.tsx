import Link from "next/link";
import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { ScanLocalButton } from "../../../components/scan-local-button";
import { RepositorySelector } from "../../../components/repository-selector";
import { listCloudProjects } from "../../../lib/cloud-projects";
import { demoSnapshot } from "../../../lib/project-data";
import { integrationStatus } from "../../../lib/config";
import { getAuthIdentity } from "../../../lib/auth";
import { Github, FolderGit2, FolderOpen, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "../../../lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const status = integrationStatus();
  const snapshot = status.localDemo ? demoSnapshot() : undefined;
  const session = await getAuthIdentity();
  const cloudProjects = session ? await listCloudProjects(session) : [];

  return (
    <AppShell>
      <PageHeader 
        eyebrow="REPOSITORIES" 
        title="Project Workspaces" 
        copy="Connect with least-privilege Github access or analyze the current local repository for the Stage 1 proof." 
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* GITHUB SOURCE */}
        <article className="min-h-[300px] p-8 flex flex-col border border-line rounded-sm relative bg-ink shadow-lg overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange to-orange/50"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-sm bg-orange/10 flex items-center justify-center text-orange border border-orange/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
              <Github size={20} />
            </div>
            <div>
              <span className="font-mono text-[9px] tracking-widest text-muted uppercase">PRODUCTION SOURCE</span>
              <h2 className="text-xl font-bold text-white">Github App</h2>
            </div>
          </div>
          
          <p className="text-sm text-muted leading-relaxed mb-8 flex-1">
            Connect repositories via the HARIKOS Github App. Requires minimal permissions (Contents: Read, Metadata: Read).
          </p>
          
          <div className="mt-auto flex flex-col items-start gap-6 w-full">
            {status.supabaseAuth && status.githubApp && status.postgres ? (
              <a href="/api/github/install/start" className="h-10 px-6 flex items-center justify-center gap-2 bg-white text-ink hover:bg-paper-soft font-mono font-bold text-[10px] uppercase tracking-widest transition-colors rounded-sm shadow-sm w-full sm:w-auto">
                Install Github App <ArrowRight size={14} />
              </a>
            ) : (
              <Link href="/app/settings" className="h-10 px-6 flex items-center justify-center border border-line text-white hover:border-cyan hover:bg-ink-soft bg-ink-soft/50 font-mono font-bold text-[10px] uppercase tracking-widest transition-colors rounded-sm w-full sm:w-auto">
                View required configuration
              </Link>
            )}
            
            <div className="flex items-center justify-between w-full pt-4 border-t border-line">
              <div className="flex items-center gap-2 text-[9px] font-mono uppercase">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  status.githubApp ? "bg-green shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" : "bg-orange shadow-[0_0_0_4px_rgba(249,115,22,0.1)]"
                )}></span>
                <span className={status.githubApp ? "text-green" : "text-orange"}>
                  {status.githubApp ? "Github App Ready" : "Missing Credentials"}
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* LOCAL DEMO SOURCE */}
        <article className="min-h-[300px] p-8 flex flex-col border border-line rounded-sm relative bg-ink shadow-lg overflow-hidden group hover:border-cyan/50 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan to-cyan/50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-sm bg-cyan/10 flex items-center justify-center text-cyan border border-cyan/20 group-hover:shadow-[0_0_15px_rgba(0,217,232,0.15)] transition-all">
              <FolderGit2 size={20} />
            </div>
            <div>
              <span className="font-mono text-[9px] tracking-widest text-muted uppercase">LOCAL PROOF SOURCE</span>
              <h2 className="text-xl font-bold text-white">Local Workspace</h2>
            </div>
          </div>
          
          <p className="text-sm text-muted leading-relaxed mb-8 flex-1">
            Run the bounded truth scanner against this repository (HARIKOS itself) and persist state to local SQLite. 
          </p>
          
          <div className="mt-auto flex flex-col items-start gap-6 w-full">
            {status.localDemo ? (
              <ScanLocalButton />
            ) : (
              <div className="h-10 flex items-center">
                <span className="text-[10px] text-muted font-mono tracking-widest uppercase bg-ink-soft px-3 py-1.5 rounded-sm border border-line">Local scanning disabled</span>
              </div>
            )}
            
            <div className="flex items-center justify-between w-full pt-4 border-t border-line">
              <div className="flex items-center gap-2 text-[9px] font-mono text-muted uppercase">
                <span className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_0_4px_rgba(0,217,232,0.1)] animate-pulse"></span>
                Deterministic • No AI Key Required
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* PROJECTS LIST */}
      <section className="bg-ink border border-line rounded-sm overflow-hidden mb-12 shadow-md">
        <div className="px-6 py-4 flex items-center justify-between border-b border-line bg-ink-soft">
          <div className="flex items-center gap-2">
            <FolderOpen size={14} className="text-muted" />
            <h2 className="text-sm font-bold text-white">Available Workspaces</h2>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-muted uppercase bg-ink border border-line px-2 py-0.5 rounded-sm">
            {(snapshot ? 1 : 0) + cloudProjects.length} Projects
          </span>
        </div>
        
        <div className="flex flex-col divide-y divide-line">
          {snapshot && (
            <Link href={`/app/project/${snapshot.projectId}`} className="p-5 flex items-center gap-4 hover:bg-ink-soft transition-colors group">
              <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-cyan/10 border border-cyan/20 text-cyan font-mono text-xs font-bold shadow-sm group-hover:bg-cyan group-hover:text-ink transition-colors">
                FI
              </div>
              <div className="flex-1 flex flex-col min-w-0 gap-1">
                <strong className="text-sm text-white truncate flex items-center gap-2">
                  {snapshot.repository.name}
                  <span className="text-[8px] bg-cyan/20 text-cyan px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-widest border border-cyan/30">Fixture</span>
                </strong>
                <span className="text-[10px] text-muted truncate">Controlled Clerk &rarr; Supabase fixture</span>
              </div>
              <div className="hidden md:flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase">
                <span className="text-muted"><b className="text-cyan font-bold mr-1">{snapshot.truths.filter((claim) => claim.status === "verified").length}</b>Verified</span>
              </div>
              <b className="font-mono text-cyan opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">Open &rarr;</b>
            </Link>
          )}
          
          {cloudProjects.map((project) => (
            <Link href={`/app/project/${project.id}`} key={project.id} className="p-5 flex items-center gap-4 hover:bg-ink-soft transition-colors group">
              <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-ink-elevated border border-line text-white font-mono text-xs font-bold shadow-sm">
                {project.repository.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 flex flex-col min-w-0 gap-1">
                <strong className="text-sm text-white truncate">{project.owner} / {project.repository}</strong>
                <span className="text-[10px] text-muted truncate">Github repository &middot; {project.private ? "Private" : "Public"}</span>
              </div>
              <div className="hidden md:flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase">
                <span className="text-muted"><b className="text-white font-bold mr-1">{project.lastCommitSha?.slice(0, 8) ?? "NEW"}</b>Commit</span>
              </div>
              <b className="font-mono text-cyan opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">Open &rarr;</b>
            </Link>
          ))}

          {(!snapshot && cloudProjects.length === 0) && (
            <div className="p-12 text-center flex flex-col items-center">
              <FolderOpen size={32} className="text-muted mb-4 opacity-50" />
              <p className="text-sm text-white font-medium mb-1">No workspaces found</p>
              <p className="text-[11px] text-muted max-w-sm">Connect a Github repository or run the local scanner to create your first workspace.</p>
            </div>
          )}
        </div>
      </section>

      <RepositorySelector />
    </AppShell>
  );
}
