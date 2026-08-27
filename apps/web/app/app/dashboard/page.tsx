export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main className="dashboard-page" aria-labelledby="dashboard-title">
      <header className="dashboard-heading">
        <div>
          <span className="eyebrow"><i />PROJECT WORKSPACE</span>
          <h1 id="dashboard-title">HARIKOS Dashboard</h1>
          <p>Demo Mode</p>
        </div>
      </header>
      <p role="status">System Status: Operational</p>
      <section aria-label="Workspace statistics" className="dashboard-stats">
        <article className="dashboard-stat"><span>Projects</span><strong>2</strong></article>
        <article className="dashboard-stat"><span>Verified Claims</span><strong>69</strong></article>
        <article className="dashboard-stat"><span>Contradictions</span><strong>9</strong></article>
        <article className="dashboard-stat"><span>Context Freshness</span><strong>94%</strong></article>
      </section>
    </main>
  );
}
