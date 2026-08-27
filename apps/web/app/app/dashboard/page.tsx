"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "../../../components/app-shell";

const projects = [
  { id: "harikos-ai", name: "HARIKOS AI", repo: "ashyeager/harikos.ai", status: "Healthy", claims: 42, contradictions: 3, fresh: "2 min ago" },
  { id: "demo-saas", name: "Demo SaaS", repo: "demo/example-app", status: "Needs Review", claims: 27, contradictions: 6, fresh: "Yesterday" },
];

const activity = [
  ["SCAN", "Repository scan completed", "HARIKOS AI", "2 min ago"],
  ["TRUTH", "3 claims verified against source evidence", "HARIKOS AI", "18 min ago"],
  ["MEMORY", "Decision recorded: use Postgres for cloud persistence", "Workspace", "1 hr ago"],
];

export default function DashboardPage() {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id ?? "");
  const activeProject = projects.find((project) => project.id === selectedProject) ?? projects[0];

  return (
    <AppShell>
      <main className="dashboard-page" aria-labelledby="dashboard-title">
        <header className="dashboard-heading">
          <div>
            <span className="eyebrow"><i />PROJECT WORKSPACE</span>
            <h1 id="dashboard-title">HARIKOS Dashboard</h1>
            <p>Build fast with AI. HARIKOS keeps the project straight.</p>
          </div>
          <Link className="button-primary" href="/app/projects">Connect repository <span>&rarr;</span></Link>
        </header>

        <section aria-label="Workspace statistics" className="dashboard-stats">
          <article className="dashboard-stat"><span>Projects</span><strong>{projects.length}</strong></article>
          <article className="dashboard-stat"><span>Verified Claims</span><strong>69</strong></article>
          <article className="dashboard-stat"><span>Contradictions</span><strong>9</strong></article>
          <article className="dashboard-stat"><span>Context Freshness</span><strong>94%</strong></article>
        </section>

        <section className="dashboard-section" aria-labelledby="projects-title">
          <div className="section-heading"><div><span>CONNECTED WORKSPACES</span><h2 id="projects-title">Projects</h2></div><Link href="/app/projects">View all <span>&rarr;</span></Link></div>
          <div className="project-grid">
            {projects.length ? projects.map((project) => (
              <button className={`project-card ${selectedProject === project.id ? "project-card-selected" : ""}`} key={project.id} onClick={() => setSelectedProject(project.id)} type="button" aria-pressed={selectedProject === project.id}>
                <span className="project-card-top"><i className={`status-dot ${project.status === "Healthy" ? "healthy" : "review"}`} />{project.status}<span className="project-time">{project.fresh}</span></span>
                <span><h3>{project.name}</h3><p className="project-repo">{project.repo}</p></span>
                <span className="project-card-meta"><span>{project.claims} claims</span><span>{project.contradictions} contradictions</span></span>
              </button>
            )) : <div className="dashboard-empty"><h3>No projects yet</h3><p>Connect a repository to create your first Project Brain.</p><Link className="button-primary" href="/app/projects">Connect repository</Link></div>}
          </div>
        </section>

        <section className="dashboard-actions" aria-label="Selected project overview">
          <article><span>SELECTED PROJECT</span><h3>{activeProject?.name ?? "No project selected"}</h3><p>{activeProject ? `${activeProject.claims} verified claims are keeping ${activeProject.repo} aligned.` : "Choose a project above to see its current state."}</p><Link href={activeProject ? `/app/project/${activeProject.id}` : "/app/projects"}>Open project <span>&rarr;</span></Link></article>
          <article><span>CONTEXT HEALTH</span><h3>94% fresh</h3><p>Project context is ready to share with your coding agent. No stale blockers detected.</p><Link href="/app/projects">Prepare context <span>&rarr;</span></Link></article>
        </section>

        <section className="dashboard-section" aria-labelledby="activity-title">
          <div className="section-heading"><div><span>RECENT SIGNALS</span><h2 id="activity-title">Activity</h2></div><span className="dashboard-live-status"><i />LIVE</span></div>
          <div className="panel dashboard-activity">
            {activity.length ? activity.map(([kind, message, source, time]) => <div className="dashboard-activity-row" key={`${kind}-${message}`}><span className="activity-kind">{kind}</span><span><strong>{message}</strong><small>{source}</small></span><time>{time}</time></div>) : <p className="empty-state">No activity recorded yet.</p>}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
