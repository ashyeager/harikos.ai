import type { Metadata } from "next";
import Link from "next/link";

import { MarketingShell } from "../../components/marketing/marketing-shell";

export const metadata: Metadata = { title: "Privacy", description: "How HARIKOS handles account, repository, project-brain, and agent-connection data." };

const sections = [
  ["IDENTITY", "Supabase Auth receives identity information from Google or GitHub so HARIKOS can authenticate you and associate projects with your account."],
  ["REPOSITORY ACCESS", "The HARIKOS GitHub App can read only repositories you authorize, within its configured read-only Contents and Metadata permissions."],
  ["PROJECT DATA", "HARIKOS stores project records, scans, evidence-backed claims, memories, Context Packs, agent connections, sessions, and outcomes needed to provide the service."],
  ["CREDENTIALS", "OAuth, database, GitHub App, billing, and agent-token secrets are handled through server-side boundaries. Existing agent token plaintext is not displayed again after creation."],
  ["YOUR CONTROL", "You can revoke repository access in GitHub, revoke agent connections in HARIKOS, and sign out to end the active session."],
] as const;

export default function PrivacyPage() { return <MarketingShell><main className="legal-page"><header><span className="eyebrow"><i />LEGAL / PRIVACY</span><h1>Your account.<br /><span>Your repositories.</span></h1><p>This notice explains the product data HARIKOS needs to provide a shared project brain. It does not claim certifications or retention guarantees beyond the implemented service.</p><small>EFFECTIVE / AUGUST 24, 2026</small></header><section>{sections.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{copy}</p></div></article>)}<footer><p>HARIKOS does not sell personal data.</p><Link href="/security">Inspect the security model <span>&nearr;</span></Link></footer></section></main></MarketingShell>; }
