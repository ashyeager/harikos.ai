import type { Metadata } from "next";
import Link from "next/link";

import { InteractiveTerminal } from "../components/marketing/interactive-system";
import { MarketingShell } from "../components/marketing/marketing-shell";
import { ProductDemo } from "../components/marketing/product-demo";
import { ProjectBrain } from "../components/marketing/project-brain";
import { SectionHeading } from "../components/marketing/section-heading";
import { getAuthIdentity } from "../lib/auth";

export const metadata: Metadata = {
  title: "HARIKOS — Verified Project State for AI Coding Agents",
  description: "Keep project truth, memory, and task context consistent across coding agents, sessions, and repository changes.",
};

const concepts = [
  ["TRUTH", "What the repository supports now.", "Verified claims stay linked to inspectable evidence.", "/truth"],
  ["MEMORY", "What happened before.", "Decisions, failed attempts, fixes, and outcomes survive the session.", "/memory"],
  ["CONTEXT", "What matters for this task.", "Each agent receives a focused brief instead of a project-wide dump.", "/context"],
] as const;

export default async function LandingPage() {
  const authenticated = Boolean(await getAuthIdentity());
  const startHref = authenticated ? "/app/projects" : `/login?next=${encodeURIComponent("/app/projects")}`;
  const proHref = authenticated ? "/pricing?plan=pro" : `/login?next=${encodeURIComponent("/pricing?plan=pro")}`;
  return <MarketingShell><main>
    <section className="home-hero final-home-hero">
      <div className="hero-copy">
        <div className="system-pill"><i /> VERIFIED PROJECT STATE</div>
        <h1>Many agents.<br /><span>One verified project state.</span></h1>
        <p className="hero-support">HARIKOS keeps project truth, memory, and task context consistent across coding agents, sessions, and repository changes.</p>
        <div className="hero-actions">
          <Link className="button button-primary button-large" href={startHref}>Start Free <span>↗</span></Link>
          <Link className="button button-secondary button-large" href="#product-demo">See HARIKOS in action</Link>
        </div>
      </div>
      <div className="final-hero-object"><ProjectBrain /></div>
    </section>

    <ProductDemo />

    <section className="problem-section section-shell final-problem">
      <SectionHeading eyebrow="THE PROBLEM" title={<>Your repo changed.<br /><span>Your agents should know.</span></>} copy="Different agents and sessions accumulate fragmented context. Documentation drifts, assumptions survive, and the next agent repeats work the last one already finished." />
      <div className="final-problem-grid">
        <article><span>SESSION 01</span><strong>Decision made</strong><p>The project moved to Supabase Auth.</p></article>
        <article><span>SESSION 02</span><strong>Context lost</strong><p>The next agent still follows an outdated README.</p></article>
        <article><span>REPOSITORY</span><strong>Evidence changed</strong><p>The implementation is current. The shared understanding is not.</p></article>
      </div>
    </section>

    <section className="section-shell final-flow">
      <SectionHeading eyebrow="HOW HARIKOS WORKS" title={<>Repository signal becomes<br /><span>shared current understanding.</span></>} />
      <div className="final-flow-row">
        {["Repository", "Evidence", "Verified state", "Agent"].map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong>{index < 3 ? <i aria-hidden="true">→</i> : null}</div>)}
      </div>
    </section>

    <section className="pillars-section section-shell final-concepts">
      <SectionHeading eyebrow="THE CORE SYSTEM" title={<>Memory remembers.<br /><span>Evidence verifies.</span></>} copy="HARIKOS keeps history useful without confusing it with what the repository supports now." />
      <div className="final-concept-grid">
        {concepts.map(([label, title, copy, href], index) => <Link href={href} key={label}><span>0{index + 1}</span><strong>{label}</strong><h3>{title}</h3><p>{copy}</p><b>Explore {label.toLowerCase()} ↗</b></Link>)}
      </div>
    </section>

    <section className="contradiction-section section-shell final-contradiction">
      <div className="contradiction-copy"><span className="eyebrow"><i /> CONTRADICTION / EXPLICIT</span><h2>The repository gets the final say.</h2><p>HARIKOS preserves disagreement instead of flattening it into false certainty.</p></div>
      <div className="final-contradiction-card">
        <div><span>README.md</span><code>Authentication: Clerk</code><b>CONTRADICTED</b></div>
        <i aria-hidden="true">≠</i>
        <div><span>middleware.ts</span><code>createServerClient()</code><b>VERIFIED</b></div>
        <strong>Current Truth: Supabase Auth</strong>
      </div>
    </section>

    <section className="developer-section section-shell final-agents">
      <div className="story-copy"><span className="eyebrow"><i /> AGENTS / MCP</span><h2>Every agent starts from the same current context.</h2><p>Connect Codex, Claude, Cursor, or another MCP client with one revocable project-scoped token.</p><Link href="/developers">Explore the agent bridge <span>↗</span></Link></div>
      <InteractiveTerminal />
    </section>

    <section className="pricing-preview section-shell final-pricing">
      <SectionHeading eyebrow="START FREE" title={<>One project.<br /><span>The complete HARIKOS loop.</span></>} copy="Connect a repository, inspect Truth and Evidence, create Context, and keep useful Memory. Try Pro free for seven days when you need more capacity—no card required." />
      <div className="pricing-preview-grid">
        <article><span>FREE</span><div><strong>$0</strong><small>/ forever</small></div><p>One project and one agent with the complete initial verified-state workflow.</p><Link className="button button-secondary" href={startHref}>Start Free <span>↗</span></Link></article>
        <article className="pricing-pro"><span>PRO TRIAL</span><div><strong>7 days</strong><small> / no card</small></div><p>Try Pro capacity before choosing the $29 monthly plan.</p><Link className="button button-primary" href={proHref}>Try Pro free <span>↗</span></Link></article>
      </div>
    </section>

    <section className="final-cta-section final-home-cta"><div><span className="eyebrow"><i /> PROJECT STATE / READY</span><h2>Stop re-explaining your project to every agent.</h2><p>Give every coding agent one current, evidence-backed understanding.</p><div><Link className="button button-primary button-large" href={startHref}>Start Free <span>↗</span></Link><Link className="button button-secondary button-large" href="/how-it-works">See how it works</Link></div></div></section>
  </main></MarketingShell>;
}
