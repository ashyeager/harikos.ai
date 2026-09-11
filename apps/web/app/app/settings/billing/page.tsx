import { AppShell } from "../../../../components/app-shell";
import { BillingActions } from "../../../../components/billing-actions";
import { PageHeader } from "../../../../components/page-header";
import { SettingsNav } from "../../../../components/settings-nav";
import { integrationStatus } from "../../../../lib/config";
import { getAuthIdentity } from "../../../../lib/auth";
import { resolveEntitlement } from "../../../../lib/entitlements";

export const dynamic = "force-dynamic";

export default async function BillingSettingsPage() {
  const status = integrationStatus();
  const identity = await getAuthIdentity();
  const entitlement = identity ? await resolveEntitlement(identity) : null;
  return <AppShell><PageHeader eyebrow="SETTINGS / BILLING" title="Plan and billing" copy="Subscription lifecycle state is authoritative for access. This screen never infers entitlement from a checkout redirect." /><SettingsNav active="billing" /><section className="settings-content-grid"><article className="panel plan-baseline"><span>CURRENT ENTITLEMENT</span><h2>{entitlement?.plan ? entitlement.plan.toUpperCase() : "NO ACTIVE PLAN"}</h2><p>Status: {entitlement?.status ?? "inactive"}. {entitlement?.periodEndsAt ? `Current period ends ${new Date(entitlement.periodEndsAt).toLocaleDateString()}.` : entitlement?.trialEndsAt ? `Trial ends ${new Date(entitlement.trialEndsAt).toLocaleDateString()}.` : "No billing period is active."}</p><ul><li>Truth + Evidence</li><li>Persistent project Memory</li><li>Remote MCP agent connection</li><li>Task-specific Context Packs</li></ul></article><article className="panel plan-baseline plan-pro-card"><span>PLANS FROM $9 MONTHLY</span><h2>Choose capacity</h2><p>Core supports 1 project and agent, Pro supports 5, and Scale supports 20. New eligible users can start a 7-day Pro trial.</p><BillingActions enabled={status.paddle} /></article></section></AppShell>;
}
