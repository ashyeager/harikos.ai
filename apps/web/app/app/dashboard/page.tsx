import Link from "next/link";

import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { StatusBadge } from "../../../components/status-badge";
import { TruthCard } from "../../../components/truth-card";
import { demoSnapshot } from "../../../lib/project-data";

export default function DashboardPage() {
  const snapshot = demoSnapshot();
  const verified = snapshot.truths.filter((claim) => claim.status === "verified");
  const superseded = snapshot.truths.filter((claim) => claim.status === "superseded");
  return (
    <AppShell snapshot={snapshot}>
      <PageHeader
        eyebrow="PROJECT OVERVIEW"
        title={`Good evening. ${snapshot.repository.name} is understood.`}
        copy={`HARIKOS verified ${snapshot.sourceCount} high-signal sources against ${snapshot.repository.headSha.slice(0, 8)}.`}
        action={<Link className="button button-dark" href={`/app/project/${snapshot.projectId}/context`}>Before you build <span>→</span></Link>}
      />

      <section className="metric-grid" aria-label="Project Truth metrics">
        <article><span>VERIFIED TRUTHS</span><strong>{verified.length}</strong><small><i className="positive" /> Current implementation</small></article>
        <article><span>CHANGES</span><strong>{snapshot.changes.length}</strong><small>Since previous scan</small></article>
        <article><span>UNCERTAIN</span><strong>{snapshot.truths.filter((claim) => claim.status === "uncertain").length}</strong><small>Needs more evidence</small></article>
        <article className="metric-alert"><span>CONTRADICTIONS</span><strong>{snapshot.contradictions.length}</strong><small><i className="warning" /> Review recommended</small></article>
      </section>

      <section className="dashboard-grid">
        <div className="panel truth-summary-panel">
          <div className="panel-heading"><div><span>CURRENT ARCHITECTURE</span><h2>Project Truth</h2></div><Link href={`/app/project/${snapshot.projectId}/truth`}>View all <b>→</b></Link></div>
          <div className="compact-truth-list">
            {verified.slice(0, 6).map((claim) => (
              <Link href={`/app/project/${snapshot.projectId}/truth/${encodeURIComponent(claim.id)}`} key={claim.id}>
                <span className="truth-symbol">{claim.subject.slice(0, 1).toUpperCase()}</span>
                <span><small>{claim.subject.replaceAll("-", " ")}</small><strong>{claim.value}</strong></span>
                <StatusBadge status={claim.status} />
                <b>{Math.round(claim.confidence * 100)}%</b>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel drift-panel">
          <div className="panel-heading"><div><span>LATEST CHANGE</span><h2>Authentication drift</h2></div><Link href={`/app/project/${snapshot.projectId}/changes`}>History <b>→</b></Link></div>
          <div className="drift-visual">
            <div><small>PREVIOUS</small><strong>{superseded[0]?.value ?? "Clerk"}</strong><StatusBadge status="superseded" /></div>
            <span className="drift-arrow">→</span>
            <div><small>CURRENT</small><strong>{verified.find((claim) => claim.subject === "authentication")?.value}</strong><StatusBadge status="verified" /></div>
          </div>
          <div className="contradiction-note"><span>!</span><p><strong>README appears stale.</strong>{snapshot.contradictions[0]?.reason}</p></div>
        </div>
      </section>

      <section className="dashboard-truths">
        <div className="panel-heading"><div><span>HIGH-VALUE STATE</span><h2>What your AI should know</h2></div></div>
        <div className="truth-card-grid">
          {verified.slice(0, 3).map((claim) => <TruthCard claim={claim} projectId={snapshot.projectId} key={claim.id} />)}
        </div>
      </section>
    </AppShell>
  );
}
