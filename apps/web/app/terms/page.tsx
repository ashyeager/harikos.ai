import type { Metadata } from "next";
import Link from "next/link";

import { MarketingShell } from "../../components/marketing/marketing-shell";

export const metadata: Metadata = { title: "Terms", description: "Terms for authorized use of HARIKOS AI and connected repositories." };

const sections = [
  ["AUTHORIZED USE", "Connect only repositories and accounts you are authorized to access. You remain responsible for the code, content, and instructions you provide."],
  ["PROHIBITED USE", "Do not use HARIKOS to access another person's data, bypass security controls, distribute malware, or violate applicable law or third-party rights."],
  ["OUTPUT REVIEW", "HARIKOS provides evidence-backed project information to assist development work. You remain responsible for reviewing outputs before relying on them in production."],
  ["SERVICE CHANGES", "The service may change as the product develops. HARIKOS may restrict access when required to protect the service or other users."],
  ["REVOCATION", "Repository authorization can be revoked through GitHub. Agent access can be revoked inside HARIKOS. Subscription management remains subject to the configured billing provider."],
] as const;

export default function TermsPage() { return <MarketingShell><main className="legal-page"><header><span className="eyebrow"><i />LEGAL / TERMS</span><h1>Build with authorized work.<br /><span>Keep responsibility clear.</span></h1><p>These terms define the minimum acceptable-use and responsibility boundaries for HARIKOS AI.</p><small>EFFECTIVE / AUGUST 24, 2026</small></header><section>{sections.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{copy}</p></div></article>)}<footer><p>Questions should be resolved before connecting sensitive repositories.</p><Link href="/privacy">Read the privacy notice <span>&nearr;</span></Link></footer></section></main></MarketingShell>; }
