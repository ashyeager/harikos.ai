import type { Metadata } from "next";

import { AgentHandoff } from "../../components/marketing/interactive-system";
import { MarketingShell } from "../../components/marketing/marketing-shell";
import { ExampleLabel, PrincipleStrip, ProductCTA, PublicHero, PublicSection } from "../../components/marketing/public-page";

export const metadata: Metadata = { title: "Project Memory", description: "Persistent decisions, failed attempts, fixes, constraints, and outcomes for every coding-agent session." };

const events = [
  ["12:14", "ATTEMPT", "Create the subscription from the browser", "Codex / session 2F7A"],
  ["12:17", "FAILED ATTEMPT", "Privileged Stripe credentials required", "root cause / client boundary"],
  ["12:20", "DECISION", "Keep billing mutations server-side", "applies to checkout and portal"],
  ["12:31", "OUTCOME", "Signed webhook boundary completed", "commit c2137fb"],
] as const;

function MemoryHeroVisual() { return <div className="memory-stack"><ExampleLabel />{events.slice(0, 3).map(([time, type, text], index) => <article key={type} style={{ "--stack": index } as React.CSSProperties}><time>{time}</time><span>{type}</span><strong>{text}</strong></article>)}<div className="memory-stack-rail"><i /><i /><i /></div></div>; }

export default function MemoryMarketingPage() {
  return <MarketingShell><main className="public-page memory-page">
    <PublicHero eyebrow="MEMORY / PROJECT HISTORY" title="What the project learned" accent="should survive the session." copy="HARIKOS stores structured decisions, attempts, failures, fixes, constraints, discoveries, incidents, and outcomes without pretending that history is current Truth." secondary={["See agent handoff", "#handoff"]} visual={<MemoryHeroVisual />} />
    <PrincipleStrip items={[["STRUCTURED", "Eleven useful memory types"], ["PERSISTENT", "Across browsers and agents"], ["SCOPED", "Attached to the project"], ["SEPARATE", "Memory never self-authorizes Truth"]]} />
    <PublicSection eyebrow="A TECHNICAL TIMELINE" title={<>Keep the useful sequence,<br /><span>not another chat transcript.</span></>} copy="HARIKOS preserves the project-relevant event chain: what was tried, why it failed, what was decided, and what finally worked.">
      <div className="public-memory-timeline"><ExampleLabel /><div className="memory-line" />{events.map(([time, type, text, meta], index) => <article key={type}><time>{time}</time><i /><div><span>{type}</span><h3>{text}</h3><small>{meta}</small></div><b>0{index + 1}</b></article>)}</div>
    </PublicSection>
    <PublicSection eyebrow="AGENT CONTINUITY" title={<>The next agent inherits<br /><span>the hard-won parts.</span></>} copy="A related task receives current Truth plus the prior constraint, failed attempt, decision, outcome, and relevant files." tone="blue"><div id="handoff"><ExampleLabel /><AgentHandoff /></div></PublicSection>
    <PublicSection eyebrow="MEMORY CONTROL" title={<>Useful history stays<br /><span>inspectable and reversible.</span></>} copy="Records remain visible to the user and can move through simple active, superseded, and archived states." tone="deeper"><div className="memory-control-grid">{[["ACTIVE", "Still useful for current work", "green"], ["SUPERSEDED", "Replaced but retained as history", "gray"], ["ARCHIVED", "Hidden from normal retrieval", "blue"]].map(([state, copy, tone]) => <article className={`tone-${tone}`} key={state}><i /><strong>{state}</strong><p>{copy}</p></article>)}</div></PublicSection>
    <ProductCTA title="Let the next session start where the last one ended." />
  </main></MarketingShell>;
}
