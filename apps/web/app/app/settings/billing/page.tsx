import { AppShell } from "../../../../components/app-shell";
import { BillingActions } from "../../../../components/billing-actions";
import { BillingStatusRefresh } from "../../../../components/billing-status-refresh";
import { PageHeader } from "../../../../components/page-header";
import { SettingsNav } from "../../../../components/settings-nav";
import { getAuthIdentity } from "../../../../lib/auth";
import { getDashboardSummary } from "../../../../lib/cloud-projects";
import { integrationStatus } from "../../../../lib/config";
import { formatUtcDate } from "../../../../lib/date-format";
import { getPlanUsage, PLAN_CONFIG, resolveEntitlement } from "../../../../lib/entitlements";

export const dynamic = "force-dynamic";

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return <div className="billing-usage-row"><div><strong>{label}</strong><span>{used} of {limit}</span></div><div className="billing-usage-track"><i style={{ width: `${percent}%` }} /></div></div>;
}

export default async function BillingSettingsPage({ searchParams }: { searchParams: Promise<{ checkout?: string | string[] }> }) {
  const status = integrationStatus();
  const identity = await getAuthIdentity();
  const [entitlement, summary, params] = await Promise.all([
    identity ? resolveEntitlement(identity) : null,
    identity ? getDashboardSummary(identity) : Promise.resolve({ projects: 0, agents: 0, truths: 0, memories: 0, scans: 0, activity: 0 }),
    searchParams,
  ]);
  const planUsage = identity ? await getPlanUsage(identity) : null;
  const developer = entitlement?.role === "developer";
  const managed = Boolean(entitlement && ["trialing", "active", "past_due", "canceled"].includes(entitlement.status));
  const monthlyPrice = entitlement?.plan ? PLAN_CONFIG[entitlement.plan].monthlyUsd : null;
  const periodLabel = entitlement?.status === "trialing" && entitlement.trialEndsAt
    ? `Trial ends ${formatUtcDate(entitlement.trialEndsAt)}`
    : entitlement?.periodEndsAt ? `Current period ends ${formatUtcDate(entitlement.periodEndsAt)}` : "No billing period is active.";

  return <AppShell>
    <PageHeader eyebrow="SETTINGS / BILLING" title="Plan and billing" copy="See the access state HARIKOS enforces across projects, scans, Context, Memory, and MCP." />
    <SettingsNav active="billing" />
    {params.checkout === "return" ? <BillingStatusRefresh /> : null}
    <section className="billing-settings-grid">
      <article className="panel billing-plan-card">
        <div className="billing-plan-heading"><div><span>CURRENT ACCESS</span><h2>{developer ? "Developer access" : entitlement?.plan ? PLAN_CONFIG[entitlement.plan].name : "No active plan"}</h2></div><b className={`billing-status status-${entitlement?.status ?? "inactive"}`}>{entitlement?.status ?? "inactive"}</b></div>
        <div className="billing-price-line"><strong>{developer ? "Internal" : monthlyPrice === null ? "—" : `$${monthlyPrice}`}</strong>{!developer && monthlyPrice !== null ? <span>/ month</span> : null}</div>
        <p>{developer ? "Payment and capacity limits are bypassed for this internal account. Authentication, repository authorization, ownership, and project isolation still apply." : periodLabel}</p>
        {entitlement?.status === "past_due" ? <p className="billing-warning">Access is paused until Paddle confirms the subscription has recovered.</p> : null}
        <BillingActions enabled={status.paddle} managed={managed} developer={developer} />
      </article>

      <article className="panel billing-usage-card">
        <div><span>CAPACITY</span><h2>Active usage</h2></div>
        {developer ? <p>Internal developer access has no product capacity limit.</p> : entitlement && planUsage ? <div className="billing-usage-list">
          <UsageMeter label="Projects" used={planUsage.activeProjects} limit={entitlement.projectLimit} />
          <UsageMeter label="Agent connections" used={planUsage.activeAgents} limit={entitlement.agentLimit} />
          {entitlement.plan === "free" ? <>
            <UsageMeter label="Manual rescans this month" used={planUsage.manualScansThisMonth} limit={entitlement.scanLimit} />
            <UsageMeter label="Context Packs this month" used={planUsage.contextPacksThisMonth} limit={entitlement.contextPackLimit} />
            <UsageMeter label="Memory writes this month" used={planUsage.memoryWritesThisMonth} limit={entitlement.memoryWriteLimit} />
          </> : <p>Continuous reverification, Context Packs, and Memory writes are included.</p>}
        </div> : <p>Usage is unavailable.</p>}
        <small>Revoked agent connections do not count toward active usage.</small>
        <small>Workspace totals: {summary.truths} current Truth claims and {summary.memories} Memory records.</small>
      </article>
    </section>
  </AppShell>;
}
