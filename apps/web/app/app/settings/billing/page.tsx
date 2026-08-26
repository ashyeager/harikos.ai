import { AppShell } from "../../../../components/app-shell";
import { BillingActions } from "../../../../components/billing-actions";
import { PageHeader } from "../../../../components/page-header";
import { SettingsNav } from "../../../../components/settings-nav";
import { integrationStatus } from "../../../../lib/config";

export default function BillingSettingsPage() {
  const status = integrationStatus();
  return <AppShell><PageHeader eyebrow="SETTINGS / BILLING" title="Plan and billing" copy="Stripe webhook state is authoritative for paid entitlement. This screen does not infer a current subscription from a checkout redirect." /><SettingsNav active="billing" /><section className="settings-content-grid"><article className="panel plan-baseline"><span>FREE BASELINE</span><h2>$0 <small>/ month</small></h2><p>One project, one active agent connection, 250 memories per project, and 25 Context Packs per month.</p><ul><li>Project Truth + Evidence</li><li>Persistent project Memory</li><li>Remote MCP agent connection</li><li>Task-specific Context Packs</li></ul></article><article className="panel plan-baseline plan-pro-card"><span>PRO / LAUNCH CONFIGURATION</span><h2>$15 <small>/ month</small></h2><p>Up to five projects and agent connections with higher practical Memory and Context capacity.</p><BillingActions enabled={status.stripe} /></article></section></AppShell>;
}
