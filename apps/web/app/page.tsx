import type { Metadata } from "next";
import Link from "next/link";

import { ProjectStateFlow } from "../components/marketing/homepage-system-flow";
import { CinematicLoop, InteractiveTerminal } from "../components/marketing/interactive-system";
import { MarketingShell } from "../components/marketing/marketing-shell";
import { ProductDemo } from "../components/marketing/product-demo";
import { ProjectBrain } from "../components/marketing/project-brain";
import { RenaissanceHero } from "../components/marketing/renaissance-hero";
import { SectionHeading } from "../components/marketing/section-heading";
import { getAuthIdentity } from "../lib/auth";

export const metadata: Metadata = {
  title: "HARIKOS — Verified Project State for AI Coding Agents",
  description: "Keep project truth, memory, and task context consistent across coding agents, sessions, and repository changes.",
};

const plans = [
  ["Free", "$0", "1 project · 1 agent", "Initial scan + 1 manual rescan per UTC month"],
  ["Core", "$9", "1 project · 1 agent", "Continuous reverification and ongoing usage"],
  ["Pro", "$29", "5 projects · 5 agents", "Continuous reverification with an optional eligible trial"],
  ["Scale", "$79", "20 projects · 20 agents", "Continuous reverification and high usage"],
] as const;

export default async function LandingPage() {
  const authenticated = Boolean(await getAuthIdentity());
  const startHref = authenticated ? "/app/projects" : `/login?next=${encodeURIComponent("/app/projects")}`;

  return (
    <MarketingShell>
      <main>
        <RenaissanceHero startHref={startHref} />

        <ProductDemo />

        <section className="problem-section section-shell final-problem">
          <SectionHeading eyebrow="THE PROBLEM" title={<>Your repository moved forward.<br /><span>Your agents did not.</span></>} copy="Sessions end. Documentation drifts. The next agent inherits an incomplete story and repeats work that evidence could have settled." />
          <div className="final-problem-grid">
            <article><span>SESSION 01</span><strong>A decision lands</strong><p>The project moves to Supabase Auth and the implementation changes with it.</p></article>
            <article><span>SESSION 02</span><strong>The thread breaks</strong><p>The next agent begins from an outdated README and a partial handoff.</p></article>
            <article><span>HARIKOS</span><strong>Evidence reconnects it</strong><p>Current code, previous decisions, and the task at hand remain distinguishable.</p></article>
          </div>
        </section>

        <section className="section-shell final-flow">
          <SectionHeading eyebrow="HOW HARIKOS WORKS" title={<>From repository signal<br /><span>to an agent&apos;s next move.</span></>} copy="Choose a step to follow the information that HARIKOS carries through the project loop." />
          <ProjectStateFlow />
        </section>

        <section className="section-shell home-motion-showcase">
          <SectionHeading eyebrow="PROJECT STATE / IN MOTION" title={<>See the system resolve.<br /><span>Then watch it stay current.</span></>} copy="Two focused views show the same HARIKOS loop: a shared project state formed from connected evidence, and the lifecycle that updates it when the repository changes." />
          <div className="home-brain-stage">
            <div className="home-brain-copy"><span>ILLUSTRATIVE SYSTEM VIEW</span><h3>One state shared across the project.</h3><p>The layered mesh represents Evidence, Truth, Memory, Context, and agent access staying connected without collapsing into one undifferentiated record.</p><Link href="/product">Explore the product <b aria-hidden="true">↗</b></Link></div>
            <div className="home-brain-visual technical-sphere-stage"><ProjectBrain /></div>
          </div>
          <div className="home-loop-stage"><span className="example-label">ILLUSTRATIVE PRODUCT MECHANIC</span><CinematicLoop /></div>
        </section>

        <section className="pillars-section section-shell final-concepts">
          <SectionHeading eyebrow="THE CONNECTED SYSTEM" title={<>Current fact. Useful history.<br /><span>Relevant context.</span></>} copy="Truth, Memory, and Context have different jobs. HARIKOS keeps their boundaries clear while letting them travel together." />
          <div className="knowledge-weave">
            <article className="knowledge-node knowledge-truth"><span>01</span><div><small>TRUTH / CURRENT</small><h3>What the repository supports now.</h3><p>Inspectable claims stay connected to source evidence, confidence, and time.</p></div><Link href="/truth">Explore Truth <b aria-hidden="true">↗</b></Link></article>
            <article className="knowledge-node knowledge-memory"><span>02</span><div><small>MEMORY / HISTORY</small><h3>What happened before.</h3><p>Decisions, failed attempts, and outcomes persist without being promoted to fact.</p></div><Link href="/memory">Explore Memory <b aria-hidden="true">↗</b></Link></article>
            <article className="knowledge-node knowledge-context"><span>03</span><div><small>CONTEXT / TASK</small><h3>What this agent needs next.</h3><p>A Context Pack selects the smallest useful set of current Truth, constraints, evidence, and relevant Memory.</p></div><Link href="/context">Explore Context <b aria-hidden="true">↗</b></Link></article>
          </div>
        </section>

        <section className="contradiction-section section-shell final-contradiction">
          <div className="contradiction-copy"><span className="eyebrow"><i /> CHANGE / CONTRADICTION</span><h2>When sources disagree, the conflict stays visible.</h2><p>HARIKOS records the competing evidence, tracks the change, and shows why the current project state won.</p></div>
          <div className="final-contradiction-card">
            <div><span>README.md / PREVIOUS</span><code>Authentication: Clerk</code><b>STALE DOCUMENTATION</b></div>
            <i aria-hidden="true">≠</i>
            <div><span>middleware.ts / CURRENT</span><code>createServerClient()</code><b>CODE EVIDENCE</b></div>
            <strong>RESOLUTION / SUPABASE AUTH VERIFIED</strong>
          </div>
        </section>

        <section className="developer-section section-shell final-agents">
          <div className="story-copy"><span className="eyebrow"><i /> MULTI-AGENT / MCP</span><h2>One project state, available to every authorized agent.</h2><p>Connect Codex, Claude, Cursor, or another MCP client through a revocable project-scoped token. Read current state, create task Context, and write back useful outcomes inside the same boundary.</p><Link href="/developers">Explore the agent bridge <span aria-hidden="true">↗</span></Link></div>
          <InteractiveTerminal />
        </section>

        <section className="pricing-preview section-shell final-pricing">
          <SectionHeading eyebrow="PRICING / START FREE" title={<>Start with one real project.<br /><span>Grow when the work demands it.</span></>} copy="Free includes one active project, one active agent, an initial scan plus one manual rescan per UTC calendar month, three Context Packs, and ten Memory writes per month. Paid plans add capacity and continuous reverification." />
          <div className="home-plan-grid">
            {plans.map(([name, price, capacity, detail]) => <article key={name}><span>{name}</span><strong>{price}<small>/ month</small></strong><p>{capacity}</p><small>{detail}</small></article>)}
          </div>
          <div className="home-pricing-actions"><Link className="button button-primary button-large" href={startHref}>Start Free <span aria-hidden="true">↗</span></Link><Link className="button button-secondary button-large" href="/pricing">See all plan details</Link></div>
        </section>

        <section className="final-cta-section final-home-cta"><div><span className="eyebrow"><i /> PROJECT STATE / READY</span><h2>Stop re-explaining your project to every agent.</h2><p>Give every coding agent one current, evidence-backed understanding.</p><div><Link className="button button-primary button-large" href={startHref}>Start Free <span aria-hidden="true">↗</span></Link><Link className="button button-secondary button-large" href="/how-it-works">See how it works</Link></div></div></section>
      </main>
    </MarketingShell>
  );
}
