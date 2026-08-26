import type { Metadata } from "next";

import { AgentHandoff } from "../../components/marketing/interactive-system";
import { MarketingShell } from "../../components/marketing/marketing-shell";
import { ExampleLabel, PrincipleStrip, ProductCTA, PublicHero, PublicSection } from "../../components/marketing/public-page";

export const metadata: Metadata = { title: "Agent Bridge", description: "Connect Codex, Claude, Cursor, and other MCP clients to the same project-scoped Truth, Memory, and Context." };

function AgentNetwork() {
  return <div className="agent-network"><ExampleLabel /><div className="agent-core"><i /><strong>HARIKOS</strong><small>PROJECT BRAIN</small></div>{[["CODEX", "READ + WRITE-BACK"], ["CLAUDE", "CONTEXT RECEIVED"], ["CURSOR", "TRUTH CHECK"], ["MCP CLIENT", "PROJECT-SCOPED"]].map(([name, state], index) => <article className={`agent-node agent-node-${index}`} key={name}><span>0{index + 1}</span><strong>{name}</strong><small>{state}</small><i /></article>)}<svg aria-hidden="true" viewBox="0 0 800 500"><path d="M160 120 C290 130 300 230 400 250" /><path d="M650 110 C520 120 505 220 400 250" /><path d="M160 390 C285 375 300 280 400 250" /><path d="M650 390 C520 375 505 280 400 250" /></svg></div>;
}

export default function AgentsMarketingPage() {
  return <MarketingShell><main className="public-page agents-page">
    <PublicHero eyebrow="AGENT BRIDGE / REMOTE MCP" title="Different agents." accent="One project brain." copy="Connect coding agents through a neutral remote MCP boundary. Each connection is named, project-scoped, revocable, and measurable only after a real authenticated request." secondary={["Developer setup", "/developers"]} visual={<AgentNetwork />} />
    <PrincipleStrip items={[["NEUTRAL", "MCP-compatible clients"], ["SCOPED", "One project per token"], ["REVOCABLE", "Access ends immediately"], ["HONEST", "No fake online state"]]} />
    <PublicSection eyebrow="THE HANDOFF" title={<>One agent learns.<br /><span>The next agent benefits.</span></>} copy="HARIKOS sends relevant current facts and useful project history without transferring an entire private transcript." tone="blue"><ExampleLabel /><AgentHandoff /></PublicSection>
    <PublicSection eyebrow="CONNECTION FLOW" title={<>Secure enough to trust.<br /><span>Simple enough to use.</span></>} copy="Plaintext is displayed once. The product retains a secure hash and prefix, then verifies scope on every MCP request."><div className="connection-flow">{[["01", "NAME", "Codex laptop"], ["02", "GENERATE", "Token shown once"], ["03", "CONFIGURE", "Remote MCP endpoint"], ["04", "VERIFY", "First authenticated request"], ["05", "REVOKE", "Immediate rejection"]].map(([number, label, copy]) => <article key={number}><span>{number}</span><i /><strong>{label}</strong><p>{copy}</p></article>)}</div></PublicSection>
    <PublicSection eyebrow="PROJECT-SCOPED TOOLS" title={<>Read what matters.<br /><span>Write back what the project learned.</span></>} copy="Agent claims do not become current Truth. Write-back creates structured Memory and Outcome records for later verification and retrieval." tone="deeper"><div className="tool-contract-grid">{[["get_project_truth", "read", "Current claims and evidence"], ["search_project_memory", "read", "Relevant history"], ["get_context_pack", "read", "Task-specific brief"], ["check_assumption", "read", "Support or contradiction"], ["record_memory", "write", "Structured project learning"], ["record_outcome", "write", "Session result"]].map(([tool, mode, copy]) => <article key={tool}><span>{(mode ?? "read").toUpperCase()}</span><code>{tool}()</code><p>{copy}</p></article>)}</div></PublicSection>
    <ProductCTA title="Connect the agent. Keep control of the project." />
  </main></MarketingShell>;
}
