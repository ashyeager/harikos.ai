import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "../../../../components/app-shell";
import { PageHeader } from "../../../../components/page-header";
import { StatusBadge } from "../../../../components/status-badge";
import { TruthCard } from "../../../../components/truth-card";
import { projectSnapshot } from "../../../../lib/project-data";

export const dynamic = "force-dynamic";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  if (!snapshot) notFound();
  const current = snapshot.truths.filter((claim) => claim.status === "verified" || claim.status === "likely");
  return (
    <AppShell snapshot={snapshot}>
      <PageHeader
        eyebrow={`${snapshot.mode.toUpperCase()} REPOSITORY`}
        title={snapshot.repository.name}
        copy={`${snapshot.repository.owner ? `${snapshot.repository.owner} / ` : ""}${snapshot.repository.defaultBranch} · verified against ${snapshot.repository.headSha.slice(0, 12)}`}
        action={<Link className="button button-dark" href={`/app/project/${snapshot.projectId}/context`}>Prepare agent context <span>→</span></Link>}
      />
      <div className="overview-status-bar">
        <div><i /><span><strong>Project Truth is current</strong><small>Last scan {new Date(snapshot.scannedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</small></span></div>
        <div><span>FILES ANALYZED</span><strong>{snapshot.sourceCount}</strong></div>
        <div><span>VERIFIED</span><strong>{current.filter((claim) => claim.status === "verified").length}</strong></div>
        <div><span>DRIFT</span><strong>{snapshot.contradictions.length}</strong></div>
      </div>
      <section className="truth-card-grid overview-cards">
        {current.slice(0, 6).map((claim) => <TruthCard claim={claim} projectId={snapshot.projectId} key={claim.id} />)}
      </section>
      <section className="dashboard-grid">
        <div className="panel evidence-health">
          <div className="panel-heading"><div><span>EVIDENCE COVERAGE</span><h2>Why HARIKOS believes it</h2></div></div>
          {current.slice(0, 5).map((claim) => (
            <div className="evidence-health-row" key={claim.id}>
              <span>{claim.subject}</span><i><b style={{ width: `${Math.round(claim.confidence * 100)}%` }} /></i><strong>{claim.evidence.length} sources</strong>
            </div>
          ))}
        </div>
        <div className="panel recent-change-card">
          <div className="panel-heading"><div><span>RECENT SEMANTIC CHANGE</span><h2>{snapshot.changes[0]?.category ?? "No recent drift"}</h2></div></div>
          {snapshot.changes[0] ? <>
            <p>{snapshot.changes[0].summary}</p>
            <div className="mini-transition"><span>{snapshot.changes[0].previousValue}</span><b>→</b><strong>{snapshot.changes[0].currentValue}</strong></div>
            <StatusBadge status={snapshot.contradictions.length ? "contradicted" : "verified"} />
            <Link href={`/app/project/${snapshot.projectId}/changes`}>Inspect the change <b>→</b></Link>
          </> : <p>Rescan after a repository change to build semantic history.</p>}
        </div>
      </section>
    </AppShell>
  );
}
