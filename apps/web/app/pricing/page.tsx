import type { Metadata } from "next";
import Link from "next/link";

import { MarketingShell } from "../../components/marketing/marketing-shell";
import { ProductCTA } from "../../components/marketing/public-page";
import { SubscribeButton } from "../../components/marketing/subscribe-button";
import { getAuthIdentity } from "../../lib/auth";

export const metadata: Metadata = { title: "Pricing", description: "HARIKOS plans start at $9/month, with a 7-day Pro trial for new users." };

export default async function PricingPage() {
  const authenticated = Boolean(await getAuthIdentity());
  return <MarketingShell><main className="public-page pricing-page">
    <section className="pricing-hero"><span className="eyebrow"><i />PRICING / FOUR PLANS</span><h1>Start with one project brain.<br /><span>Scale when the work does.</span></h1><p>Every plan includes the complete HARIKOS intelligence loop. Capacity scales with the work, and new users can try Pro for 7 days.</p></section>
    <section className="plan-grid">
      {[["CORE", "$9", "1 active project · 1 agent connection"], ["PRO", "$29", "Up to 5 projects · 5 agent connections"], ["SCALE", "$79", "Up to 20 projects · 20 agent connections"], ["ENTERPRISE", "Custom", "Custom limits and commercial agreement"]].map(([name, price, copy]) => <article className={name === "PRO" ? "plan-pro" : ""} key={name}><header><span>{name}</span><small>{name === "PRO" ? "7-DAY TRIAL FOR NEW USERS" : "FULL HARIKOS INTELLIGENCE"}</small></header><div className="plan-price"><strong>{price}</strong><span>{price === "Custom" ? " / contact sales" : " / month"}</span></div><p>{copy}. Truth, Evidence, Memory, Context Packs, MCP, and agent write-back included.</p>{name === "ENTERPRISE" ? <p>Contact the HARIKOS team for a custom agreement.</p> : authenticated ? <SubscribeButton plan={name.toLowerCase() as "core" | "pro" | "scale"} /> : <Link className="button button-secondary button-large" href="/login">Sign in to choose {name.toLowerCase()} <span>&rarr;</span></Link>}<footer>SUBSCRIPTION STATE IS SERVER-AUTHORITATIVE</footer></article>)}
    </section>
    <section className="pricing-note"><span>BILLING AUTHORITY</span><p>HARIKOS never grants access from a browser redirect. Entitlement is derived from the configured billing provider's signed lifecycle events.</p><Link href="/security">Security model <span>&nearr;</span></Link></section>
    <ProductCTA title="Start with the project you are building now." copy="Begin with a 7-day Pro trial, then choose the capacity that matches your work." />
  </main></MarketingShell>;
}
