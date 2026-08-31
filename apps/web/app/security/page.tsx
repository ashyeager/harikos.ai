import type { Metadata } from "next";

import { MarketingShell } from "../../components/marketing/marketing-shell";
import { PrincipleStrip, ProductCTA, PublicHero, PublicSection } from "../../components/marketing/public-page";

export const metadata: Metadata = { title: "Security", description: "The real HARIKOS security model: minimum GitHub permissions, server-side authorization, bounded source analysis, signed webhooks, and revocable agent tokens." };

function SecurityVisual() {
  return <div className="security-boundary"><div className="boundary-label">PROJECT SECURITY BOUNDARY</div><div className="boundary-core"><span>HARIKOS</span><strong>SERVER</strong><small>AUTHORIZATION / OWNERSHIP</small></div>{[["GITHUB", "CONTENTS: READ"], ["SUPABASE", "PRIVATE DATA"], ["AGENT", "SCOPED TOKEN"], ["STRIPE", "SIGNED EVENTS"]].map(([label, access], index) => <article className={`boundary-node boundary-node-${index}`} key={label}><i /><strong>{label}</strong><small>{access}</small></article>)}<footer>NO ARBITRARY REPOSITORY CODE EXECUTION</footer></div>;
}

const controls = [
  ["GITHUB ACCESS", "Contents: Read and Metadata: Read are the minimum repository permissions. Installation access tokens remain server-side and temporary."],
  ["SOURCE HANDLING", "Relevant files are fetched through an authorized boundary, secret paths are denied, and unnecessary raw source is not intended for permanent retention."],
  ["USER OWNERSHIP", "Sensitive server operations resolve the authenticated user and verify project ownership instead of trusting browser-supplied IDs."],
  ["AGENT TOKENS", "Connections use high-entropy project-scoped bearer tokens. Plaintext is shown once; active access can be revoked."],
  ["WEBHOOKS", "GitHub and Stripe webhook handlers verify signatures before accepting repository or billing state changes."],
  ["BILLING AUTHORITY", "Paid entitlement comes from trusted Stripe subscription state, never from a checkout success URL in the browser."],
] as const;

export default function SecurityPage() {
  return <MarketingShell><main className="public-page security-page">
    <PublicHero eyebrow="SECURITY / REAL BOUNDARIES" title="Minimum access." accent="Maximum clarity." copy="HARIKOS is designed around explicit authorization, bounded repository analysis, revocable project access, and signed external events. This page describes implemented design principles, not certifications." secondary={["Read the controls", "#controls"]} visual={<SecurityVisual />} />
    <PrincipleStrip items={[["READ ONLY", "No GitHub repository writes"], ["SERVER SIDE", "Secrets stay outside the browser"], ["SCOPED", "User and project ownership checks"], ["NO CERTIFICATION THEATER", "Only real controls are stated"]]} />
    <PublicSection eyebrow="CONTROL SURFACE" title={<>Security should be visible<br /><span>where trust changes hands.</span></>} copy="The important boundaries are explicit in the product architecture and in the user interface." tone="deeper"><div className="security-control-list" id="controls">{controls.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><div><strong>{title}</strong><p>{copy}</p></div><b>CONTROL / DOCUMENTED</b></article>)}</div></PublicSection>
    <PublicSection eyebrow="REPOSITORY DATA PATH" title={<>Analyze what matters.<br /><span>Do not become a code mirror.</span></>} copy="The default policy is to fetch bounded relevant source, derive structured project knowledge, and persist evidence pointers and hashes instead of an arbitrary full repository copy." tone="accent"><div className="retention-flow">{[["01", "AUTHORIZED FETCH"], ["02", "FILTER SECRET PATHS"], ["03", "ANALYZE SIGNAL"], ["04", "DERIVE KNOWLEDGE"], ["05", "KEEP POINTERS + HASHES"]].map(([number, item]) => <article key={number}><span>{number}</span><strong>{item}</strong><i /></article>)}</div></PublicSection>
    <section className="security-disclaimer"><span>WHAT WE DO NOT CLAIM</span><div>{["SOC 2 certification", "HIPAA compliance", "ISO certification", "Zero-retention for every data type", "Perfect automated correctness"].map((item) => <p key={item}><i />{item}</p>)}</div></section>
    <ProductCTA title="Connect your repository through explicit, inspectable boundaries." />
  </main></MarketingShell>;
}
