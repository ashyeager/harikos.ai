import { notFound } from "next/navigation";

import { AppShell } from "../../../../../components/app-shell";
import { PageHeader } from "../../../../../components/page-header";
import { StatusBadge } from "../../../../../components/status-badge";
import { projectSnapshot } from "../../../../../lib/project-data";

export const dynamic = "force-dynamic";

export default async function ChangesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();
  const openContradictions = snapshot.contradictions.filter((item) => item.status === "open");
  return (
    <AppShell snapshot={snapshot}>
      <PageHeader eyebrow="SEMANTIC HISTORY" title="Changes & drift" copy="Meaningful changes to project understanding, with old truth preserved and stale evidence exposed." />
      <section className="change-hero panel">
        <div><span className="change-alert">{snapshot.changes[0] ? `${snapshot.changes[0].category.toUpperCase()} CHANGE` : "NO RECORDED CHANGE"}</span><h2>{snapshot.changes[0]?.summary ?? "No semantic change detected yet."}</h2><p>{snapshot.changes[0] ? "HARIKOS updated related truth while retaining the previous validity interval." : "A completed rescan that changes project meaning will appear here with its prior state preserved."}</p></div>
        {snapshot.changes[0] ? <div className="large-transition"><span><small>PREVIOUS</small><strong>{snapshot.changes[0].previousValue}</strong><StatusBadge status="superseded" /></span><b>→</b><span><small>CURRENT</small><strong>{snapshot.changes[0].currentValue}</strong><StatusBadge status="verified" /></span></div> : null}
      </section>
      <section className="change-layout">
        <div className="panel timeline-panel">
          <div className="panel-heading"><div><span>PROJECT TIMELINE</span><h2>What changed</h2></div></div>
          <div className="timeline">
            {snapshot.changes.map((change) => (
              <article key={change.id}><i /><time>{new Date(change.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</time><div><strong>{change.summary}</strong><small>Commit {change.commitSha.slice(0, 8)} · {change.category}</small></div></article>
            ))}
            <article><i className="quiet" /><time>INITIAL</time><div><strong>Initial Project Truth established</strong><small>{snapshot.sourceCount} bounded sources analyzed</small></div></article>
          </div>
        </div>
        <aside className="panel contradiction-panel">
          <div className="panel-heading"><div><span>CONTRADICTIONS</span><h2>Current and resolved</h2></div><b>{openContradictions.length} OPEN</b></div>
          {snapshot.contradictions.map((item) => (
            <article key={item.id}><span>{item.status === "open" ? "!" : "✓"}</span><div><strong>{item.status === "open" ? "Active contradiction" : "Resolved transition"}</strong><p>{item.reason}</p><small>{item.status === "open" ? "OPEN · REVIEW RECOMMENDED" : "RESOLVED · HISTORY PRESERVED"}</small></div></article>
          ))}
          {snapshot.contradictions.length === 0 ? <p>No contradictions have been recorded.</p> : null}
        </aside>
      </section>
    </AppShell>
  );
}
