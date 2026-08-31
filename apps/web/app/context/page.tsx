import type { Metadata } from "next";

import { ContextCompression } from "../../components/marketing/interactive-system";
import { MarketingShell } from "../../components/marketing/marketing-shell";
import { ExampleLabel, PrincipleStrip, ProductCTA, PublicHero, PublicSection } from "../../components/marketing/public-page";

export const metadata: Metadata = { title: "Context Packs", description: "Task-specific context assembled from current Truth, relevant Memory, changes, files, and constraints." };

function ContextHeroVisual() { return <div className="context-pack-hero"><ExampleLabel /><header><span>HARIKOS CONTEXT PACK</span><b>1,184 TOKENS</b></header><h3>TASK / Modify subscriptions</h3>{["CURRENT TRUTH / 06", "RELEVANT FILES / 03", "CONSTRAINTS / 02", "FAILED ATTEMPTS / 01", "DECISIONS + OUTCOMES / 02"].map((item) => <p key={item}><i />{item}<span>INCLUDED</span></p>)}<footer>PROVENANCE ATTACHED <b>100%</b></footer></div>; }

export default function ContextMarketingPage() { return <MarketingShell><main className="public-page context-page">
  <PublicHero eyebrow="CONTEXT / TASK RELEVANCE" title="Not more context." accent="The right context." copy="HARIKOS prepares a compact technical brief from current Truth, relevant files, recent changes, constraints, decisions, failed attempts, outcomes, and useful history." secondary={["See compression", "#compression"]} visual={<ContextHeroVisual />} />
  <PrincipleStrip items={[["CURRENT", "Superseded facts excluded"], ["RELEVANT", "Selected for the task"], ["COMPACT", "Bounded by a context budget"], ["TRACEABLE", "Provenance labels remain visible"]]} />
  <PublicSection eyebrow="CONTEXT COMPRESSION" title={<>A hundred project signals.<br /><span>One focused technical brief.</span></>} copy="Change the visual between the full signal field and the focused result. Irrelevant state dims; current facts and useful history remain." tone="accent"><div id="compression"><ExampleLabel /><ContextCompression /></div></PublicSection>
  <PublicSection eyebrow="BEFORE YOU BUILD" title={<>Know what exists before<br /><span>your agent adds more.</span></>} copy="A Context Pack makes installed systems, missing boundaries, constraints, and prior failures visible before implementation starts."><div className="before-build-example"><ExampleLabel /><header><span>TASK</span><strong>Add subscription management</strong></header>{[["ok", "Stripe is already installed."], ["ok", "Authentication uses Supabase."], ["warn", "No subscription status is available in the current UI contract."], ["fail", "A previous client-side mutation attempt failed."], ["ok", "Billing changes must remain server-side."]].map(([state, item]) => <p className={`check-${state}`} key={item}><i>{state === "ok" ? "OK" : state === "warn" ? "!" : "X"}</i>{item}</p>)}</div></PublicSection>
  <PublicSection eyebrow="OUTPUT STRUCTURE" title={<>Readable by humans.<br /><span>Practical for agents.</span></>} copy="The output is a technical brief, not a generic conversational answer." tone="deeper"><div className="context-section-grid">{["CURRENT TRUTH", "FILES", "RECENT CHANGES", "CONSTRAINTS", "DECISIONS", "FAILED ATTEMPTS", "OUTCOMES", "HISTORY"].map((item, index) => <article key={item}><span>0{index + 1}</span><strong>{item}</strong><p>{index < 3 ? "High-priority project signal" : "Included when relevant to the task"}</p></article>)}</div></PublicSection>
  <ProductCTA title="Give the agent enough to move fast, not enough to get lost." />
  </main></MarketingShell>; }
