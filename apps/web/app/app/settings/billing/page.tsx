import { BillingActions } from "../../../../components/billing-actions";
import { AppShell } from "../../../../components/app-shell";
import { PageHeader } from "../../../../components/page-header";
import { demoSnapshot } from "../../../../lib/project-data";

export default function BillingSettingsPage() {
  return <AppShell snapshot={demoSnapshot()}><PageHeader eyebrow="BILLING" title="Choose the plan that fits your project brain." copy="Subscription state is confirmed by Stripe webhooks and stored in HARIKOS PostgreSQL." /><section className="panel security-settings"><div className="panel-heading"><div><span>CURRENT PLAN</span><h2>Free</h2></div></div><p>1 project, 1 active agent connection, 250 memories per project, and 25 context packs per month.</p><BillingActions /></section></AppShell>;
}
