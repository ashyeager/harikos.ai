import type { Metadata } from "next";
import Link from "next/link";

import { MarketingShell } from "../../components/marketing/marketing-shell";
import { ProductCTA } from "../../components/marketing/public-page";

export const metadata: Metadata = { title: "Pricing", description: "Start HARIKOS free with one repository and one agent connection. Pro is $15 per month for up to five projects and agents." };

const features = [
  ["Connected repositories", "1", "Up to 5"],
  ["Active agent connections", "1", "Up to 5"],
  ["Memories per project", "250", "Higher practical limit"],
  ["Context Packs", "25 / month", "Higher practical limit"],
  ["Project Truth + Evidence", "Included", "Included"],
  ["Project history", "Core history", "Full usable history"],
] as const;

export default function PricingPage() {
  return <MarketingShell><main className="public-page pricing-page">
    <section className="pricing-hero"><span className="eyebrow"><i />PRICING / TWO PLANS</span><h1>Start with one project brain.<br /><span>Scale when the work does.</span></h1><p>No invented enterprise tier, annual discount, or hidden benchmark. Pro is the current monthly launch configuration.</p></section>
    <section className="plan-grid">
      <article><header><span>FREE</span><small>FOR ONE ACTIVE PROJECT</small></header><div className="plan-price"><strong>$0</strong><span>/ forever</span></div><p>Build a verified project brain and connect one coding agent.</p><Link className="button button-secondary button-large" href="/login">Start free <span>&rarr;</span></Link><footer>NO CARD REQUIRED BY HARIKOS</footer></article>
      <article className="plan-pro"><header><span>PRO</span><small>CURRENT LAUNCH HYPOTHESIS</small></header><div className="plan-price"><strong>$15</strong><span>/ month</span></div><p>More projects, agent connections, Memory capacity, Context Packs, and usable history.</p><Link className="button button-primary button-large" href="/login">Sign in to upgrade <span>&rarr;</span></Link><footer>SUBSCRIPTION STATE COMES FROM STRIPE</footer></article>
    </section>
    <section className="pricing-table"><header><span>CAPABILITY</span><strong>FREE</strong><strong>PRO</strong></header>{features.map(([feature, free, pro]) => <div key={feature}><span>{feature}</span><strong>{free}</strong><strong>{pro}</strong></div>)}</section>
    <section className="pricing-note"><span>BILLING AUTHORITY</span><p>HARIKOS never grants paid access from a browser redirect. Pro entitlement is derived from trusted Stripe subscription state after signed webhook processing.</p><Link href="/security">Security model <span>&nearr;</span></Link></section>
    <ProductCTA title="Start with the project you are building now." copy="Connect one repository for free. Upgrade only when you need more project brains and agent capacity." />
  </main></MarketingShell>;
}
