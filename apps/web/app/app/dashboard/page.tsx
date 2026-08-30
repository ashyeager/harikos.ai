import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { getAuthIdentity } from "../../../lib/auth";
import { getDashboardSummary, listCloudProjects } from "../../../lib/cloud-projects";
import { integrationStatus } from "../../../lib/config";

export const dynamic = "force-dynamic";

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <article className="panel dashboard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default async function DashboardPage() {
  const identity = await getAuthIdentity();
  if (!identity) redirect("/login");

  const [projects, summary] = await Promise.all([
    listCloudProjects(identity),
    getDashboardSummary(identity),
  ]);
  const status = integrationStatus();
  const readyCount = [status.supabaseAuth, status.githubApp, status.postgres].filter(Boolean).length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="WORKSPACE / COMMAND CENTER"
        title="Keep every agent on the same page."
        copy="HARIKOS turns connected repositories, verified Truth, durable Memory, and agent activity into one operational view. Nothing below is simulated: counts come from persisted workspace records."
        action={<Link className="button button-dark" href="/app/projects">Connect repository <span>&rarr;</span></Link>}
      />

      <section className="dashboard-command-brief" aria-label="Workspace command brief">
        <div className="dashboard-command-lead">
          <span className="dashboard-command-kicker"><i /> LIVE WORKSPACE SIGNAL</span>
          <strong>{projects.length ? "Your project brain is ready for the next decision." : "Establish the first project brain."}</strong>
          <p>{projects.length ? "Start from current Truth, then hand the right context to the next agent." : "Connect a repository to turn project evidence into a durable working context."}</p>
          <div className="dashboard-command-actions"><Link className="button button-primary" href={projects.length ? `/app/project/${projects[0]?.id}` : "/app/projects"}>{projects.length ? "Open project" : "Choose repository"} <span>&rarr;</span></Link><Link className="dashboard-command-link" href={projects.length ? `/app/project/${projects[0]?.id}/context` : "/app/projects"}>Prepare context <span>&rarr;</span></Link></div>
        </div>
        <div className="dashboard-command-orbit" aria-hidden="true"><i /><i /><i /><b>{readyCount}/3</b><span>BOUNDARIES<br />READY</span></div>
        <div className="dashboard-command-note"><span>NEXT BEST ACTION</span><strong>{projects.length ? "Review project Truth" : "Connect your first repository"}</strong><small>{projects.length ? "Evidence-backed state is waiting." : "Read-only GitHub access is separate."}</small></div>
      </section>

      <section className="dashboard-metric-grid" aria-label="Workspace metrics">
        <Metric label="PROJECTS" value={summary.projects} detail="Connected project brains" />
        <Metric label="TRUTH" value={summary.truths} detail="Persisted claims" />
        <Metric label="MEMORY" value={summary.memories} detail="Project memories" />
        <Metric label="AGENTS" value={summary.agents} detail="Active connections" />
        <Metric label="SCANS" value={summary.scans} detail="Repository scans" />
        <Metric label="ACTIVITY" value={summary.activity} detail="Recorded changes" />
      </section>

      <section className="dashboard-grid">
        <div className="panel dashboard-projects">
          <div className="panel-heading">
            <div><span>CONNECTED PROJECTS</span><h2>Project brains</h2></div>
            <Link href="/app/projects">MANAGE &rarr;</Link>
          </div>
          {projects.length ? (
            <div className="dashboard-project-grid">
              {projects.slice(0, 6).map((project) => (
                <Link href={`/app/project/${project.id}`} key={project.id}>
                  <span className="repo-avatar">{project.repository.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <small>{project.private ? "PRIVATE" : "PUBLIC"} / {project.owner}</small>
                    <h3>{project.repository}</h3>
                    <p>{project.lastCommitSha ? `Head ${project.lastCommitSha.slice(0, 8)}` : "Awaiting first completed scan"}</p>
                  </div>
                  <b>OPEN &rarr;</b>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-block">
              <span>NO PROJECTS / FIRST RUN</span>
              <h3>Start with a repository you control.</h3>
              <p>Authorize the read-only GitHub App, choose a repository, and let HARIKOS establish the first evidence-backed project state.</p>
              <Link className="button button-dark" href="/app/projects">Choose a repository <span>&rarr;</span></Link>
            </div>
          )}
        </div>

        <aside className="panel dashboard-readiness">
          <div className="panel-heading">
            <div><span>SYSTEM READINESS</span><h2>{readyCount}/3 boundaries ready</h2></div>
          </div>
          <div className="readiness-list">
            <div className={status.supabaseAuth ? "ready" : "attention"}><i /><span><strong>Authentication</strong><small>{status.supabaseAuth ? "Supabase session boundary active" : "Provider configuration required"}</small></span></div>
            <div className={status.githubApp ? "ready" : "attention"}><i /><span><strong>GitHub App</strong><small>{status.githubApp ? "Read-only repository access available" : "App credentials or installation required"}</small></span></div>
            <div className={status.postgres ? "ready" : "attention"}><i /><span><strong>Cloud persistence</strong><small>{status.postgres ? "PostgreSQL project records available" : "Database connection required"}</small></span></div>
          </div>
          <div className="dashboard-next-action">
            <span>NEXT BEST ACTION</span>
            <strong>{projects.length ? "Review project Truth" : "Connect your first repository"}</strong>
            <Link href={projects.length ? `/app/project/${projects[0]?.id}` : "/app/projects"}>{projects.length ? "Open project &rarr;" : "Open GitHub setup &rarr;"}</Link>
          </div>
        </aside>
      </section>

      <section className="dashboard-actions">
        <article><span>01 / TRUTH + EVIDENCE</span><h3>See what the system actually knows.</h3><p>Open a project to review current claims, evidence, contradictions, and the latest scan state.</p><Link href={projects[0] ? `/app/project/${projects[0].id}/truth` : "/app/projects"}>Review Truth &rarr;</Link></article>
        <article><span>02 / AGENT BRIDGE</span><h3>Give agents relevant context.</h3><p>Create scoped connections and expose only the project tools and memory an agent is explicitly allowed to use.</p><Link href={projects[0] ? `/app/project/${projects[0].id}/agents` : "/app/projects"}>Manage agents &rarr;</Link></article>
      </section>
    </AppShell>
  );
}
