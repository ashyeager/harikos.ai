import Link from "next/link";

import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { ScanLocalButton } from "../../../components/scan-local-button";
import { RepositorySelector } from "../../../components/repository-selector";
import { listCloudProjects } from "../../../lib/cloud-projects";
import { demoSnapshot } from "../../../lib/project-data";
import { integrationStatus } from "../../../lib/config";
import { getAuthIdentity } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const snapshot = demoSnapshot();
  const status = integrationStatus();
  const session = await getAuthIdentity();
  const cloudProjects = session ? await listCloudProjects(session) : [];
  return (
    <AppShell snapshot={snapshot}>
      <PageHeader eyebrow="REPOSITORIES" title="Choose what HARIKOS should understand." copy="Connect with least-privilege GitHub access or analyze the current local repository for the Stage 1 proof." />
      <section className="project-source-grid">
        <article className="source-card featured-source">
          <span className="source-icon">⌘</span>
          <div><small>PRODUCTION SOURCE</small><h2>GitHub App</h2><p>Selected repository access with Contents: Read and Metadata: Read.</p></div>
          {status.supabaseAuth && status.githubApp && status.postgres ? (
            <a className="button button-dark" href="/api/github/install/start">Install GitHub App <span>→</span></a>
          ) : (
            <Link className="button button-ghost" href="/app/settings">View required configuration</Link>
          )}
          <div className="source-status"><i className={status.githubApp ? "ready" : ""} />{status.githubApp ? "GitHub App ready" : "Credentials not configured"}</div>
        </article>
        <article className="source-card">
          <span className="source-icon cyan-icon">⌁</span>
          <div><small>LOCAL PROOF SOURCE</small><h2>HARIKOS-AI workspace</h2><p>Run the real bounded scanner against this repository and persist truth to local SQLite.</p></div>
          {status.localDemo ? <ScanLocalButton /> : <span className="disabled-message">Local scanning is disabled in production.</span>}
          <div className="source-status"><i className="ready" />Deterministic · no AI key required</div>
        </article>
      </section>
      <section className="connected-projects panel">
        <div className="panel-heading"><div><span>AVAILABLE NOW</span><h2>Projects</h2></div></div>
        <Link className="project-row" href={`/app/project/${snapshot.projectId}`}>
          <span className="repo-avatar">AC</span>
          <span><strong>{snapshot.repository.name}</strong><small>Controlled Clerk → Supabase fixture · clearly labeled demo</small></span>
          <span className="project-metrics"><b>{snapshot.truths.filter((claim) => claim.status === "verified").length}</b> verified</span>
          <b>Open →</b>
        </Link>
        {cloudProjects.map((project) => (
          <Link className="project-row" href={`/app/project/${project.id}`} key={project.id}>
            <span className="repo-avatar">{project.repository.slice(0, 2).toUpperCase()}</span>
            <span><strong>{project.owner} / {project.repository}</strong><small>GitHub repository · {project.private ? "private" : "public"}</small></span>
            <span className="project-metrics"><b>{project.lastCommitSha?.slice(0, 8) ?? "NEW"}</b> commit</span>
            <b>Open →</b>
          </Link>
        ))}
      </section>
      <RepositorySelector />
    </AppShell>
  );
}
