import type { Metadata } from "next";
import Link from "next/link";

import { AgentHandoff, CinematicLoop, ContextCompression, InteractiveTerminal, TemporalTruth } from "../components/marketing/interactive-system";
import { MarketingShell } from "../components/marketing/marketing-shell";
import { ProductDemo } from "../components/marketing/product-demo";
import { ExampleLabel } from "../components/marketing/public-page";
import { SectionHeading } from "../components/marketing/section-heading";
import { getAuthIdentity } from "../lib/auth";

export const metadata: Metadata = {
  title: "HARIKOS — Verified Project State for AI Coding Agents",
  description: "Continuously verified project state, evidence, memory, and task-specific context for AI coding agents.",
};

const pillars = [
  ["01", "TRUTH", "What is true now?", "Current project facts, confidence, and inspectable repository evidence.", "/truth"],
  ["02", "MEMORY", "What happened before?", "Decisions, failures, fixes, and outcomes that survive agent sessions.", "/memory"],
  ["03", "CONTEXT", "What matters now?", "A compact, task-specific brief built from current Truth and relevant history.", "/context"],
  ["04", "AGENT BRIDGE", "How agents stay aligned.", "One project-scoped MCP bridge for Codex, Claude, Cursor, and other clients.", "/agents"],
] as const;

const faq = [
  ["Is HARIKOS another coding agent?", "No. HARIKOS is the shared project brain around your coding agents. It verifies current state, preserves useful history, and gives each agent relevant context."],
  ["What is the difference between Truth and Memory?", "Memory records what happened. Truth represents what current repository evidence supports. A remembered decision can be useful without being current fact."],
  ["Does HARIKOS store my whole repository?", "The intended default is bounded, authorized source fetching: analyze relevant files, persist structured claims and evidence pointers, and avoid becoming a permanent full-code mirror."],
  ["How do coding agents connect?", "Through a remote, project-scoped MCP endpoint using a revocable HARIKOS token. Existing tokens are never shown again after creation."],
  ["Can I inspect why HARIKOS believes something?", "Yes. Verified claims expose their evidence, file paths, line references, confidence, commit, and temporal history."],
] as const;

export default async function LandingPage() {
  const authenticated = Boolean(await getAuthIdentity());
  const freeHref = authenticated ? "/app/projects" : `/login?next=${encodeURIComponent("/app/projects")}`;
  const proHref = authenticated ? "/pricing?plan=pro" : `/login?next=${encodeURIComponent("/pricing?plan=pro")}`;
  return (
    <MarketingShell>
      <main>
        <section className="home-hero">
          <div className="hero-grid-overlay" aria-hidden="true" />
          <div className="hero-copy">
            <div className="system-pill"><i /> CONTINUOUSLY VERIFIED PROJECT STATE</div>
            <p className="hero-slogan">One verified project state. Every agent.</p>
            <h1>Your agents can read the code. <span>HARIKOS tells them what&apos;s actually true.</span></h1>
            <p className="hero-support">Continuously verified project state, evidence, memory, and task-specific context for AI coding agents.</p>
            <div className="hero-actions">
              <Link className="button button-primary button-large" href={freeHref}>Start Free <span>↗</span></Link>
              <Link className="button button-secondary button-large" href="#product-demo"><i aria-hidden="true">▶</i> See HARIKOS in action</Link>
            </div>
            <Link className="hero-trial-link" href={proHref}>Prefer more capacity? Start a 7-day Pro trial <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <ProductDemo />

        <section className="signal-ribbon" aria-label="HARIKOS product systems">
          {pillars.map(([number, label]) => <div key={number}><span>{number}</span><strong>{label}</strong><i /></div>)}
        </section>

        <section className="problem-section section-shell">
          <SectionHeading eyebrow="THE FAILURE MODE" title={<>Your agents move fast.<br /><span>Your project context fragments.</span></>} copy="Code changes. Documentation drifts. One agent learns what the next agent never sees. Old assumptions stay alive because nobody checks them against the repository." aside={<span className="diagnostic-code">DIAGNOSTIC / CONTEXT_LOSS</span>} />
          <div className="fragment-field" data-reveal>
            <div className="fragment-agent"><span>AGENT / 01</span><strong>Codex session</strong><small>Decision: Supabase Auth</small></div>
            <div className="fragment-file fragment-file-one"><span>README.md</span><strong>“We use Clerk.”</strong><small>STALE / UNKNOWN</small></div>
            <div className="fragment-file fragment-file-two"><span>middleware.ts:18</span><strong>createServerClient()</strong><small>CODE / CURRENT</small></div>
            <div className="fragment-agent fragment-agent-two"><span>AGENT / 02</span><strong>New session</strong><small>Context: empty</small></div>
            <div className="fragment-center"><span>NO SHARED STATE</span><i /><strong>?</strong><small>ASSUMPTION SURVIVES</small></div>
          </div>
        </section>

        <section className="pillars-section section-shell" id="system">
          <SectionHeading eyebrow="ONE COHERENT SYSTEM" title={<>A project brain made of<br /><span>four precise layers.</span></>} copy="HARIKOS does not blur history and reality into one summary. Each layer has a job, and evidence keeps the layers honest." />
          <div className="pillar-grid" data-reveal>
            {pillars.map(([number, label, title, copy, href]) => (
              <Link className={`pillar-card pillar-${label.toLowerCase().replace(" ", "-")}`} href={href} key={number}>
                <div><span>{number} / 04</span><i /></div><strong>{label}</strong><h3>{title}</h3><p>{copy}</p><b>Explore {label.toLowerCase()} ↗</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="mechanic-section section-shell">
          <SectionHeading eyebrow="THE PROJECT BRAIN IN MOTION" title={<>A repository changes.<br /><span>HARIKOS carries the meaning forward.</span></>} copy="This illustrative loop shows the product mechanic: evidence updates Truth, a useful decision becomes Memory, and the next agent starts with current Context." />
          <div data-reveal><CinematicLoop /></div>
        </section>

        <section className="truth-story section-shell">
          <div className="story-copy" data-reveal><span className="eyebrow"><i /> TRUTH / CURRENT STATE</span><h2>Truth moves with the repository.</h2><p>Every important claim carries status, confidence, scope, evidence, and a validity window. When implementation changes, HARIKOS preserves what was true without presenting it as current.</p><Link href="/truth">Explore Project Truth <span>↗</span></Link></div>
          <div data-reveal><TemporalTruth /></div>
        </section>

        <section className="memory-story section-shell">
          <SectionHeading eyebrow="MEMORY / PROJECT HISTORY" title={<>Useful history survives.<br /><span>Noise does not become authority.</span></>} copy="This illustrative timeline shows how decisions, failed attempts, fixes, constraints, and outcomes can prevent the next session from repeating the last one." />
          <div className="memory-timeline-visual" data-reveal>
            <ExampleLabel />
            <div className="memory-rail"><i /><i /><i /><i /></div>
            {[
              ["12:14", "ATTEMPT", "Create a subscription from the browser", "Codex / session 2F7A"],
              ["12:17", "FAILED ATTEMPT", "Privileged credentials cannot cross the client boundary", "root cause / security"],
              ["12:20", "DECISION", "Keep subscription creation server-side", "applies to billing routes"],
              ["12:31", "OUTCOME", "Checkout route and signed webhook boundary created", "commit c2137fb"],
            ].map(([time, type, text, meta], index) => <article className={`memory-event memory-event-${index}`} key={type}><time>{time}</time><span>{type}</span><h3>{text}</h3><small>{meta}</small></article>)}
            <div className="memory-invariant"><span>MEMORY ≠ TRUTH</span><strong>History informs. Repository evidence verifies.</strong></div>
          </div>
        </section>

        <section className="handoff-section section-shell">
          <div className="story-copy" data-reveal><span className="eyebrow"><i /> AGENT HANDOFF</span><h2>The next agent should not start from zero.</h2><p>Codex records a failed attempt, a decision, and an outcome. HARIKOS makes the project-useful parts available when Claude—or any other MCP client—starts a related task.</p><Link href="/agents">See the agent bridge <span>↗</span></Link></div>
          <div data-reveal><AgentHandoff /></div>
        </section>

        <section className="context-section section-shell">
          <SectionHeading eyebrow="CONTEXT / TASK RELEVANCE" title={<>Not more context.<br /><span>The right context.</span></>} copy="HARIKOS compresses repository signal, current Truth, relevant Memory, changes, and constraints into a focused Context Pack." />
          <div data-reveal><ContextCompression /></div>
        </section>

        <section className="contradiction-section section-shell">
          <div className="contradiction-grid" data-reveal>
            <ExampleLabel />
            <div className="contradiction-source"><span>DOCUMENTATION / README.md:42</span><code>Authentication is handled by <b>Clerk</b>.</code><small>AUTHORITY 0.42 · SAMPLE AGE 19 DAYS</small></div>
            <div className="contradiction-vs"><i />VS<i /></div>
            <div className="contradiction-source source-code"><span>CODE / middleware.ts:18</span><code>const supabase = <b>createServerClient</b>()</code><small>AUTHORITY 0.98 · COMMIT C2137FB</small></div>
            <div className="contradiction-resolve"><span>HARIKOS RESOLUTION</span><strong>CODE EVIDENCE WINS</strong><div><p>Supabase Auth <b>VERIFIED</b></p><p>README.md <b>CONTRADICTED</b></p></div></div>
          </div>
          <div className="contradiction-copy" data-reveal><span className="eyebrow"><i /> CONTRADICTION / EXPLICIT</span><h2>Memory can be wrong.<br />The repository gets the final say.</h2><p>HARIKOS does not flatten conflicting evidence into false certainty. It exposes the disagreement, ranks authority, and preserves the transition.</p></div>
        </section>

        <section className="evidence-section section-shell">
          <SectionHeading eyebrow="EVIDENCE / PROVENANCE" title={<>Every truth has<br /><span>a reason you can inspect.</span></>} copy="This illustrative inspector shows the file, line, commit, authority, and observation time attached to a claim—never opaque confidence theater." />
          <div className="evidence-inspector" data-reveal>
            <ExampleLabel />
            <div className="evidence-claim"><span>CLAIM / AUTHENTICATION</span><h3>Supabase Auth</h3><div><b>VERIFIED</b><strong>99%</strong></div><p>project-wide · current since Aug 24</p></div>
            <div className="evidence-edges"><i /><i /><i /></div>
            <div className="evidence-sources">
              {["middleware.ts:18–34", "lib/supabase/server.ts:7–22", "package.json:31"].map((file, index) => <article key={file}><span>0{index + 1}</span><div><strong>{file}</strong><small>{index === 2 ? "MANIFEST" : "SOURCE CODE"} · AUTHORITY {index === 2 ? "86" : "98"}%</small></div><b>↗</b></article>)}
            </div>
            <div className="evidence-meta"><span>COMMIT</span><strong>c2137fb</strong><span>OBSERVED</span><strong>2026-08-24 16:41 UTC</strong></div>
          </div>
        </section>

        <section className="developer-section section-shell">
          <div className="story-copy" data-reveal><span className="eyebrow"><i /> DEVELOPERS / MCP</span><h2>Ask the project brain directly.</h2><p>Connect a coding agent with one revocable, project-scoped token. Read Truth, search Memory, prepare Context, check assumptions, and write back structured outcomes.</p><div className="tool-list">{["get_project_truth", "search_project_memory", "get_context_pack", "record_outcome"].map((tool) => <code key={tool}>{tool}()</code>)}</div><Link href="/developers">Open developer experience <span>↗</span></Link></div>
          <div data-reveal><InteractiveTerminal /></div>
        </section>

        <section className="security-preview section-shell">
          <SectionHeading eyebrow="SECURITY / ARCHITECTURE" title={<>Minimum access.<br /><span>Explicit boundaries.</span></>} copy="HARIKOS is designed around server-side authorization, bounded repository analysis, signed webhook boundaries, and revocable project-scoped agent access." />
          <div className="security-grid" data-reveal>
            {[["GITHUB", "Contents: Read\nMetadata: Read", "No repository writes"], ["SOURCE", "Bounded file fetch\nSecret paths denied", "No arbitrary code execution"], ["AGENTS", "High-entropy tokens\nHash + prefix stored", "Revoke immediately"], ["DATA", "User ownership checks\nPrivate tables protected", "Server-side credentials"]].map(([label, detail, foot], index) => <article key={label}><span>0{index + 1}</span><i /><h3>{label}</h3><p>{detail}</p><small>{foot}</small></article>)}
          </div>
          <Link className="section-text-link" href="/security">Inspect the security model <span>↗</span></Link>
        </section>

        <section className="pricing-preview section-shell">
          <SectionHeading eyebrow="PRICING / SIMPLE BY DESIGN" title={<>Start with one project.<br /><span>Scale the shared brain.</span></>} copy="Start Free with one repository, one agent, 10 Memory writes, 3 Context Packs, and 1 manual rescan each month. Upgrade when the work grows." />
          <div className="pricing-preview-grid" data-reveal>
            <article><span>FREE / START HERE</span><div><strong>$0</strong><small>/ forever</small></div><p>One repository, one active agent, 10 Memory writes, 3 Context Packs, and 1 manual rescan each month.</p><Link className="button button-secondary" href={freeHref}>Start Free <span>↗</span></Link></article>
            <article className="pricing-pro"><span>PRO / 7-DAY TRIAL</span><div><strong>$29</strong><small>/ month</small></div><p>Up to five projects and agent connections with higher Memory and Context capacity.</p><Link className="button button-primary" href={proHref}>Start Pro trial <span>↗</span></Link></article>
          </div>
          <Link className="section-text-link" href="/pricing">Compare plan details <span>↗</span></Link>
        </section>

        <section className="faq-section section-shell">
          <SectionHeading eyebrow="FAQ / THE SHORT VERSION" title={<>Questions before you<br /><span>connect a repository.</span></>} />
          <div className="faq-list" data-reveal>{faq.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>0{index + 1}</span><strong>{question}</strong><i /></summary><p>{answer}</p></details>)}</div>
        </section>

        <section className="final-cta-section">
          <div className="cta-grid" aria-hidden="true" />
          <div data-reveal><span className="eyebrow"><i /> PROJECT BRAIN / READY</span><h2>Build fast.<br /><span>Keep the project straight.</span></h2><p>Connect a repository and give every coding agent one current, evidence-backed understanding.</p><div><Link className="button button-primary button-large" href="/login">Connect your repository <span>↗</span></Link><Link className="button button-secondary button-large" href="/how-it-works">Trace the system</Link></div></div>
          <div className="cta-orbit" aria-hidden="true"><i /><i /><i /><span>H</span></div>
        </section>
      </main>
    </MarketingShell>
  );
}
