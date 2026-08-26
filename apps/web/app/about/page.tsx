import type { Metadata } from "next";
import Link from "next/link";

import { MarketingShell } from "../../components/marketing/marketing-shell";
import { PrincipleStrip, ProductCTA, PublicHero, PublicSection } from "../../components/marketing/public-page";

export const metadata: Metadata = { title: "About", description: "Why HARIKOS exists: AI accelerated software creation while fragmenting project context across tools, sessions, and agents." };

function FragmentVisual() {
  return <div className="about-fragment"><div className="fragment-core">?</div>{[["SESSION 01", "Decision remembered"], ["README", "Architecture stale"], ["AGENT 02", "Context missing"], ["CODE", "Implementation current"], ["FAILED ATTEMPT", "Repeated"], ["HUMAN", "Explains again"]].map(([label, state], index) => <article className={`about-piece about-piece-${index}`} key={label}><span>{label}</span><strong>{state}</strong><i /></article>)}</div>;
}

export default function AboutPage() {
  return <MarketingShell><main className="public-page about-page">
    <PublicHero eyebrow="ABOUT / THE THESIS" title="Software got faster." accent="Project understanding did not." copy="AI agents accelerated implementation, but project context fragmented across sessions, tools, stale documentation, unrecorded failures, and changing code. HARIKOS exists to reconnect it." primary={["Explore the product", "/product"]} secondary={["Meet the architecture", "/how-it-works"]} visual={<FragmentVisual />} />
    <PrincipleStrip items={[["SHARED", "Across agents and sessions"], ["VERIFIED", "Against repository evidence"], ["INSPECTABLE", "For builders, not just models"], ["CURRENT", "Without erasing history"]]} />
    <PublicSection eyebrow="WHY HARIKOS" title={<>Agents can write the code.<br /><span>They still need project continuity.</span></>} copy="Every session that starts from zero wastes time, repeats mistakes, and increases the distance between what a project says and what its implementation actually supports."><div className="thesis-grid"><article><span>01</span><h3>Sessions end.</h3><p>Useful reasoning, constraints, and failed attempts disappear with them.</p></article><article><span>02</span><h3>Agents change.</h3><p>Codex, Claude, Cursor, and future tools inherit different assumptions.</p></article><article><span>03</span><h3>Repositories move.</h3><p>Memory and documentation can become stale while code remains authoritative.</p></article><article><span>04</span><h3>Builders need control.</h3><p>Project knowledge should be visible, correctable, revocable, and owned by the user.</p></article></div></PublicSection>
    <PublicSection eyebrow="THE PRODUCT PRINCIPLE" title={<>Remember what happened.<br /><span>Verify what is true.</span></>} copy="That distinction is the center of HARIKOS. Memory preserves the path. Truth represents what current evidence supports. Context selects the relevant parts for the work in front of you." tone="blue"><div className="about-equation"><span>TRUTH</span><i>+</i><span>MEMORY</span><i>+</i><span>CONTEXT</span><i>+</i><span>AGENT BRIDGE</span><strong>PROJECT BRAIN</strong></div></PublicSection>
    <section className="parent-company"><div><span>BUILT BY HARIKOS</span><h2>HARIKOS AI is an independent product with a simple mission: keep AI-built software understandable.</h2></div><a href="https://harikos.vercel.app/" rel="noreferrer" target="_blank">Visit HARIKOS <span>&nearr;</span></a><Link href="/security">Read the security model</Link></section>
    <ProductCTA title="Build fast without losing the plot." />
  </main></MarketingShell>;
}
