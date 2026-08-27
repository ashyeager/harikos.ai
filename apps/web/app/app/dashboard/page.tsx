import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { getAuthIdentity } from "../../../lib/auth";
import { listCloudProjects } from "../../../lib/cloud-projects";
import { integrationStatus } from "../../../lib/config";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  console.log("[DASHBOARD] entered");
  const identity = await getAuthIdentity();
  console.log("[DASHBOARD] page identity resolved", identity ? { id: identity.id, provider: identity.provider } : null);
  if (!identity) redirect("/login");
  let projects;
  try {
    console.log("[DASHBOARD] listCloudProjects started");
    projects = await listCloudProjects(identity);
    console.log("[DASHBOARD] listCloudProjects completed", { count: projects.length });
  } catch (error) {
    console.error("[DASHBOARD ERROR]", { function: "listCloudProjects", message: error instanceof Error ? error.message : String(error), code: (error as { code?: unknown })?.code, details: (error as { details?: unknown })?.details, hint: (error as { hint?: unknown })?.hint });
    throw error;
  }
  const status = integrationStatus();
  console.log("[DASHBOARD] rendering dashboard");
  return <AppShell>
    <PageHeader eyebrow="WORKSPACE / OVERVIEW" title="Project brains" copy="Open a real connected project, review repository access, or continue the first-run path. Counts appear only when HARIKOS has persisted data for them." action={<Link className="button button-dark" href="/app/projects">Connect repository <span>&rarr;</span></Link>} />
    {projects.length ? <>
      <section className="dashboard-projects"><div className="panel-heading"><div><span>CONNECTED PROJECTS</span><h2>Continue building</h2></div><b>{projects.length} TOTAL</b></div><div className="dashboard-project-grid">{projects.map((project) => <Link href={`/app/project/${project.id}`} key={project.id}><span className="repo-avatar">{project.repository.slice(0, 2).toUpperCase()}</span><div><small>{project.private ? "PRIVATE GITHUB REPOSITORY" : "PUBLIC GITHUB REPOSITORY"}</small><h3>{project.owner} / {project.repository}</h3><p>{project.lastCommitSha ? `Last persisted commit ${project.lastCommitSha.slice(0, 8)}` : "Connected; first completed scan not recorded yet."}</p></div><b>OPEN &rarr;</b></Link>)}</div></section>
      <section className="dashboard-actions"><article><span>01 / REPOSITORIES</span><h3>Manage repository access</h3><p>Select installations and connect another authorized repository within your plan limit.</p><Link href="/app/projects">Open projects &rarr;</Link></article><article><span>02 / ACCOUNT</span><h3>Review account boundaries</h3><p>Inspect authentication provider, billing availability, and security configuration.</p><Link href="/app/settings/profile">Open settings &rarr;</Link></article></section>
    </> : <section className="onboarding-empty"><div className="empty-orbit" aria-hidden="true"><i /><i /><i /><span>H</span></div><div><span>NO PROJECTS / FIRST RUN</span><h2>Build your first Project Brain.</h2><p>Authentication is complete. Authorize the read-only GitHub App, choose a repository, and run the first bounded scan.</p><Link className="button button-dark" href="/app/projects">Choose a repository <span>&rarr;</span></Link></div><ol><li className="complete"><b>01</b><span>Sign in<strong>{identity.provider} identity active</strong></span></li><li className={status.githubApp ? "ready" : ""}><b>02</b><span>Connect GitHub<strong>{status.githubApp ? "App boundary configured" : "Deployment configuration required"}</strong></span></li><li><b>03</b><span>Choose repository<strong>No selection yet</strong></span></li><li><b>04</b><span>Run first scan<strong>Waiting for a project</strong></span></li><li><b>05</b><span>Connect an agent<strong>Available after scan</strong></span></li></ol></section>}
  </AppShell>;
}
