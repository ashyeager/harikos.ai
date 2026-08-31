import type { Metadata } from "next";

import { CinematicLoop } from "../../components/marketing/interactive-system";
import { MarketingShell } from "../../components/marketing/marketing-shell";
import { ExampleLabel, PrincipleStrip, ProductCTA, PublicHero, PublicSection } from "../../components/marketing/public-page";

export const metadata: Metadata = { title: "How It Works", description: "Trace HARIKOS from GitHub connection through evidence, Truth, Memory, Context, agent handoff, and reverification." };

const steps = [
  ["CONNECT", "Authorize selected GitHub repositories with read-only Contents and Metadata permissions."],
  ["UNDERSTAND", "Fetch bounded high-signal files and extract deterministic candidate claims."],
  ["VERIFY", "Resolve current Truth against evidence, confidence, authority, and contradiction rules."],
  ["REMEMBER", "Persist structured decisions, failed attempts, fixes, constraints, and outcomes."],
  ["CONNECT AGENTS", "Issue a project-scoped, revocable token for the remote MCP endpoint."],
  ["BUILD", "Prepare task-specific Context from current Truth and useful project history."],
  ["REVERIFY", "Rescan repository changes and update temporal state without erasing history."],
] as const;

function LifecycleVisual() {
  return <div className="lifecycle-visual"><ExampleLabel /><div className="lifecycle-core"><i /><strong>H</strong></div>{["REPO", "EVIDENCE", "TRUTH", "MEMORY", "CONTEXT", "AGENT"].map((item, index) => <span className={`life-node life-node-${index}`} key={item}>{item}<i /></span>)}<svg aria-hidden="true" viewBox="0 0 620 500"><ellipse cx="310" cy="250" rx="220" ry="150" /><ellipse cx="310" cy="250" rx="140" ry="220" transform="rotate(55 310 250)" /><path d="M105 180 C240 80 440 100 520 245 C450 410 220 425 105 180Z" /></svg></div>;
}

export default function HowItWorksPage() {
  return <MarketingShell><main className="public-page how-page">
    <PublicHero eyebrow="HOW IT WORKS / THE LOOP" title="Connect once." accent="Keep understanding current." copy="HARIKOS follows a deliberate lifecycle from authorized repository evidence to current Truth, durable project learning, focused agent context, and reverification." visual={<LifecycleVisual />} secondary={["Start the walkthrough", "#walkthrough"]} />
    <PrincipleStrip items={[["NO EXECUTION", "Source is analyzed, never run"], ["DETERMINISTIC FIRST", "Config and code before inference"], ["TEMPORAL", "Old state remains inspectable"], ["CIRCULAR", "Outcomes and changes feed the next pass"]]} />
    <PublicSection eyebrow="SEVEN STAGES" title={<>The project brain<br /><span>builds understanding in order.</span></>} copy="Every stage produces an inspectable artifact or an honest empty, loading, or error state."><div className="walkthrough" id="walkthrough"><aside><span>PROJECT LIFECYCLE</span><strong>Repository &rarr; Context &rarr; Outcome</strong><div><i /><i /><i /></div></aside><section>{steps.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><div><strong>{title}</strong><p>{copy}</p></div><i /></article>)}</section></div></PublicSection>
    <PublicSection eyebrow="THE SYSTEM MOVING" title={<>One change propagates<br /><span>without losing history.</span></>} copy="This illustrative loop compresses the product lifecycle into a clear sequence." tone="accent"><ExampleLabel /><CinematicLoop /></PublicSection>
    <ProductCTA title="Turn a changing repository into shared project understanding." />
  </main></MarketingShell>;
}
