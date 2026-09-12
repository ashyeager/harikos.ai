import type { Metadata } from "next";
import Link from "next/link";

import { MarketingShell } from "../../components/marketing/marketing-shell";
import { SubscribeButton } from "../../components/marketing/subscribe-button";
import { getAuthIdentity } from "../../lib/auth";
import { integrationStatus } from "../../lib/config";

export const metadata: Metadata = { title: "Pricing", description: "Start HARIKOS free, or add continuous reverification from $9/month." };

interface PaidPlan {
  id: "core" | "pro" | "scale";
  name: string;
  price: string;
  capacity: string;
  description: string;
  recommended?: boolean;
}

const plans: readonly PaidPlan[] = [
  { id: "core", name: "Core", price: "$9", capacity: "1 project · 1 agent", description: "For one active codebase and its primary coding agent." },
  { id: "pro", name: "Pro", price: "$29", capacity: "5 projects · 5 agents", description: "For builders running several active repositories and agent workflows.", recommended: true },
  { id: "scale", name: "Scale", price: "$79", capacity: "20 projects · 20 agents", description: "For a growing portfolio of products and connected agents." },
];

const sharedCapabilities = ["Truth + inspectable Evidence", "Contradiction and change tracking", "Persistent Memory", "Task-specific Context Packs", "Remote MCP + agent write-back"];

function loginHref(plan: "core" | "pro" | "scale") {
  return `/login?next=${encodeURIComponent(`/pricing?plan=${plan}`)}`;
}

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  const [identity, params] = await Promise.all([getAuthIdentity(), searchParams]);
  const selectedPlan = typeof params.plan === "string" && ["core", "pro", "scale"].includes(params.plan) ? params.plan : undefined;
  const status = integrationStatus();

  return <MarketingShell><main className="public-page pricing-page">
    <section className="pricing-hero"><span className="eyebrow"><i />PRICING / START SIMPLE</span><h1>One verified project state.<br /><span>Every agent.</span></h1><p>Start with a practical Free workspace, then add capacity when your repositories and agent workflows grow.</p></section>

    <section className="pricing-composition" aria-label="HARIKOS plans">
      <article className="free-plan">
        <header><div><span>FREE / START HERE</span><small>NO CARD REQUIRED</small></div><strong>For one project</strong></header>
        <div className="free-plan-body"><div><h2>Build with the full project brain.</h2><p>Connect one repository and one agent to see whether HARIKOS fits your workflow.</p></div><ul><li><b>1</b> connected repository</li><li><b>1</b> active agent connection</li><li><b>10</b> Memory writes per month</li><li><b>3</b> Context Packs per month</li><li><b>1</b> initial scan + 1 manual rescan/month</li><li><b>—</b> no continuous auto reverification</li></ul><Link className="button button-primary button-large" href={identity ? "/app/projects" : `/login?next=${encodeURIComponent("/app/projects")}`}>Start Free <span>&rarr;</span></Link></div>
      </article>

      <div className="paid-plan-grid"><div className="plan-grid">
        {plans.map((plan) => <article className={`${plan.recommended ? "plan-pro" : ""} ${selectedPlan === plan.id ? "is-selected" : ""}`} key={plan.id}>
          <header><span>{plan.name.toUpperCase()}</span><small>{plan.recommended ? "RECOMMENDED · 7-DAY FREE TRIAL" : "MONTHLY · CANCEL IN PADDLE"}</small></header>
          <div className="plan-price"><strong>{plan.price}</strong><span>/ month</span></div>
          <strong className="plan-capacity">{plan.capacity}</strong>
          <p>{plan.description}</p>
          {identity ? <SubscribeButton enabled={status.paddle} featured={plan.recommended} plan={plan.id} /> : <Link className={`button button-large ${plan.recommended ? "button-primary" : "button-secondary"}`} href={loginHref(plan.id)}>{plan.id === "pro" ? "Start 7-day Pro trial" : `Choose ${plan.name}`} <span>&rarr;</span></Link>}
        </article>)}
        <article className="plan-enterprise">
          <header><span>ENTERPRISE</span><small>CUSTOM AGREEMENT</small></header>
          <div className="plan-price"><strong>Let&apos;s talk</strong></div>
          <strong className="plan-capacity">Custom capacity</strong>
          <p>For organizations that need a commercial agreement and tailored limits.</p>
          <Link className="button button-secondary button-large" href="/about">Talk to HARIKOS <span>&rarr;</span></Link>
        </article>
      </div></div>

      <aside className="pricing-includes">
        <div><span>INCLUDED IN CORE, PRO, AND SCALE</span><h2>The full project intelligence loop.</h2></div>
        <ul>{sharedCapabilities.map((capability) => <li key={capability}><i />{capability}</li>)}</ul>
        <p>Pro&apos;s optional 7-day trial starts without a card. Access begins only after HARIKOS receives Paddle&apos;s signed subscription state, and each account is eligible once.</p>
      </aside>
    </section>

    <section className="pricing-note"><span>BILLING AUTHORITY</span><p>Checkout runs on Paddle. HARIKOS never turns a return URL into entitlement; signed lifecycle updates control product access.</p><Link href="/security">Security model <span>&nearr;</span></Link></section>
  </main></MarketingShell>;
}
