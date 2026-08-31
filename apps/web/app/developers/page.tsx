import type { Metadata } from "next";

import { InteractiveTerminal } from "../../components/marketing/interactive-system";
import { MarketingShell } from "../../components/marketing/marketing-shell";
import { ExampleLabel, PrincipleStrip, ProductCTA, PublicHero, PublicSection } from "../../components/marketing/public-page";

export const metadata: Metadata = { title: "Developers", description: "Remote MCP tools, project-scoped tokens, inspectable evidence, and practical agent configuration for HARIKOS." };

const configExample = ['{', '  "mcpServers": {', '    "harikos": {', '      "url": "https://harikos-ai.vercel.app/api/mcp/PROJECT_ID",', '      "headers": {', '        "Authorization": "Bearer TOKEN_SHOWN_ONCE"', '      }', '    }', '  }', '}'].join("\n");
const requestExample = ["POST /api/mcp/:projectId", "Authorization: Bearer ...", "", "{", '  "method": "tools/call",', '  "params": {', '    "name": "check_assumption",', '    "arguments": {', '      "assumption": "Auth uses Clerk"', "    }", "  }", "}"].join("\n");
const responseExample = ["{", '  "verdict": "contradicted",', '  "currentTruth": "Supabase Auth",', '  "status": "verified",', '  "evidence": [', '    "middleware.ts:18-34"', "  ]", "}"].join("\n");

function ConfigPreview() {
  return <div className="config-preview"><ExampleLabel /><header><span>mcp.json</span><b>PROJECT / AUTH-SERVICE</b></header><pre><code>{configExample}</code></pre><footer><span>REMOTE / HTTP</span><span>PROJECT-SCOPED</span><span>REVOCABLE</span></footer></div>;
}

export default function DevelopersPage() {
  return <MarketingShell><main className="public-page developers-page">
    <PublicHero eyebrow="DEVELOPERS / REMOTE MCP" title="Give your coding tools" accent="a shared source of context." copy="HARIKOS exposes a small, agent-neutral tool contract for current Truth, relevant Memory, recent Changes, Context Packs, assumption checks, and structured write-back." secondary={["Inspect tools", "#tools"]} visual={<ConfigPreview />} />
    <PrincipleStrip items={[["HTTP", "Production-compatible transport"], ["BEARER", "High-entropy project token"], ["JSON-RPC", "MCP request boundary"], ["PROVENANCE", "Truth and Context remain traceable"]]} />
    <PublicSection eyebrow="ILLUSTRATIVE SHELL" title={<>Explore the product contract<br /><span>without reading a manual.</span></>} copy="This marketing-only terminal demonstrates the shape of HARIKOS output. It is clearly illustrative and does not pretend to be a connected production CLI." tone="accent"><ExampleLabel /><InteractiveTerminal /></PublicSection>
    <PublicSection eyebrow="MCP TOOL SURFACE" title={<>Small enough to learn.<br /><span>Complete enough to hand off work.</span></>} copy="Each tool has a narrow job and verifies authorization before returning project data." tone="deeper"><div className="api-tool-table" id="tools">{[["get_project_truth", "READ", "Current Truth and evidence summary"], ["search_project_memory", "READ", "Decisions, attempts, failures, fixes, constraints, outcomes"], ["get_recent_changes", "READ", "Meaningful semantic project changes"], ["get_context_pack", "READ", "Current task-specific context"], ["record_memory", "WRITE", "Structured history; never automatic Truth"], ["record_outcome", "WRITE", "Agent-session outcome and durable memory"], ["check_assumption", "READ", "Supported, contradicted, or unverified"]].map(([tool, method, description]) => <article key={tool}><code>{tool}</code><span>{method}</span><p>{description}</p><b>&nearr;</b></article>)}</div></PublicSection>
    <PublicSection eyebrow="REQUEST / RESPONSE" title={<>Predictable boundaries.<br /><span>Inspectable results.</span></>} copy="The agent receives labeled project knowledge, not an opaque blob of retrieved text."><div className="request-response"><section><span>REQUEST</span><pre>{requestExample}</pre></section><i aria-hidden="true">&rarr;</i><section><span>RESPONSE</span><pre>{responseExample}</pre></section></div></PublicSection>
    <ProductCTA title="Make project context part of the agent toolchain." />
  </main></MarketingShell>;
}
