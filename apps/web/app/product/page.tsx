import type { Metadata } from "next";

import { CinematicLoop } from "../../components/marketing/interactive-system";
import { MarketingShell } from "../../components/marketing/marketing-shell";
import { ExampleLabel, PrincipleStrip, ProductCTA, PublicHero, PublicSection } from "../../components/marketing/public-page";
import { ProjectBrain } from "../../components/marketing/project-brain";

export const metadata: Metadata = { title: "Product", description: "See how HARIKOS combines Project Truth, Memory, Context, and an agent-neutral bridge into one project brain." };

const layers = [
  ["TRUTH", "Current project state", "Evidence-backed claims with confidence, status, and validity windows."],
  ["MEMORY", "Useful project history", "Decisions, failed attempts, fixes, constraints, and outcomes across sessions."],
  ["CONTEXT", "Task-specific focus", "The smallest useful brief assembled from current state and relevant history."],
  ["AGENT BRIDGE", "Shared agent access", "A remote MCP boundary for reading and writing project knowledge."],
] as const;

export default function ProductPage() {
  return (
    <MarketingShell>
      <main className="public-page product-page">
        <PublicHero eyebrow="PRODUCT / PROJECT BRAIN" title="One system for what changed," accent="what is true, and what matters next." copy="HARIKOS turns repository evidence and agent activity into a shared, inspectable project brain without confusing remembered history with current fact." secondary={["See how it works", "/how-it-works"]} visual={<div className="product-brain-frame"><ExampleLabel /><ProjectBrain /></div>} />
        <PrincipleStrip items={[["SOURCE", "Authorized repository"], ["RESOLVE", "Evidence to current Truth"], ["REMEMBER", "Structured project history"], ["HAND OFF", "Relevant context to agents"]]} />
        <PublicSection eyebrow="THE COMPLETE LOOP" title={<>From repository signal<br /><span>to better agent outcomes.</span></>} copy="Each stage has a clear authority boundary. Repository evidence establishes current state; agents contribute structured history; Context selects what is relevant for the task.">
          <div className="architecture-loop">
            {["REPOSITORY", "ANALYSIS", "EVIDENCE", "TRUTH", "MEMORY", "CONTEXT", "AGENT", "OUTCOME", "REVERIFY"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong>{index < 8 ? <i aria-hidden="true" /> : null}</div>)}
          </div>
        </PublicSection>
        <PublicSection eyebrow="FOUR PRECISE LAYERS" title={<>Rich project understanding.<br /><span>No conceptual blur.</span></>} copy="The interface keeps current state, history, task context, and agent access visibly distinct." tone="deeper">
          <div className="layer-detail-grid">{layers.map(([label, title, copy], index) => <article key={label}><span>0{index + 1}</span><small>{label}</small><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </PublicSection>
        <PublicSection eyebrow="PRODUCT MECHANIC" title={<>See state move<br /><span>through the brain.</span></>} copy="This deliberately illustrative sequence shows how an implementation change becomes verified Truth, durable Memory, and useful context for another agent." tone="blue"><ExampleLabel /><CinematicLoop /></PublicSection>
        <ProductCTA title="Give the whole project one current understanding." />
      </main>
    </MarketingShell>
  );
}
