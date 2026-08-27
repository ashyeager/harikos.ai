import { redirect } from "next/navigation";

import { getAuthIdentity } from "../../../lib/auth";
import { isDemoMode } from "../../../lib/config";

export const dynamic = "force-dynamic";

const demoProjects = [
  { name: "HARIKOS AI", repository: "ashyeager/harikos.ai", status: "Healthy", analyzed: "Just now", claims: 42, contradictions: 3 },
  { name: "Demo SaaS", repository: "demo/example-app", status: "Needs review", analyzed: "2 hours ago", claims: 27, contradictions: 6 },
];

export default async function DashboardPage() {
  const identity = await getAuthIdentity();
  if (!identity) redirect("/login");
  const demo = isDemoMode();

  return (
    <main className="dashboard-page">
      <header className="dashboard-heading">
        <div><span className="eyebrow"><i />PROJECT WORKSPACE</span><h1>Good to see you, {identity.displayName ?? identity.login}.</h1><p>Here&apos;s what your project brain knows right now.</p></div>
        <a className="button-primary" href="/app/projects">Connect repository <span>&rarr;</span></a>
      </header>
      <section aria-label="Workspace statistics" className="dashboard-stats">
        {[{ label: "Projects", value: demo ? "2" : "0" }, { label: "Verified claims", value: demo ? "69" : "0" }, { label: "Open contradictions", value: demo ? "9" : "0" }, { label: "Context freshness", value: demo ? "94%" : "—" }].map((stat) => <article className="dashboard-stat" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></article>)}
      </section>
      <section className="dashboard-section"><div className="section-heading"><div><span className="eyebrow"><i />CONNECTED PROJECTS</span><h2>Your project brains</h2></div><a href="/app/projects">View all <span>&rarr;</span></a></div>
        {demo ? <div className="project-grid">{demoProjects.map((project) => <article className="project-card" key={project.repository}><div className="project-card-top"><span className={`status-dot ${project.status === "Healthy" ? "healthy" : "review"}`} /><span>{project.status}</span><span className="project-time">{project.analyzed}</span></div><h3>{project.name}</h3><p className="project-repo">{project.repository}</p><div className="project-card-meta"><span>{project.claims} claims</span><span>{project.contradictions} contradictions</span></div><a href="/app/projects">Open project <span>&rarr;</span></a></article>)}</div> : <div className="dashboard-empty"><h3>Build your first Project Brain.</h3><p>Connect a repository to verify its truth, preserve useful history, and prepare focused context for your agents.</p><a className="button-primary" href="/app/projects">Connect your first repository <span>&rarr;</span></a></div>}
      </section>
    </main>
  );
}
