import type { Metadata } from "next";

import { TemporalTruth } from "../../components/marketing/interactive-system";
import { MarketingShell } from "../../components/marketing/marketing-shell";
import { ExampleLabel, PrincipleStrip, ProductCTA, PublicHero, PublicSection } from "../../components/marketing/public-page";

export const metadata: Metadata = { title: "Project Truth", description: "Evidence-backed, temporal project facts that change when the repository changes." };

function TruthPreview() {
  return <div className="truth-hero-panel"><ExampleLabel /><div className="truth-hero-status"><span>AUTHENTICATION</span><b>VERIFIED</b></div><h3>Supabase Auth</h3><p>project-wide <span>&middot;</span> confidence 99%</p><div className="truth-evidence-mini"><small>EVIDENCE / 03</small>{["middleware.ts:18-34", "lib/supabase/server.ts:7-22", "package.json:31"].map((item) => <strong key={item}>{item}<i>&nearr;</i></strong>)}</div><footer><span>COMMIT</span><code>c2137fb</code><span>VALID FROM</span><code>AUG 24</code></footer></div>;
}

export default function TruthMarketingPage() {
  return <MarketingShell><main className="public-page truth-page">
    <PublicHero eyebrow="PROJECT TRUTH / CURRENT STATE" title="Know what is true now." accent="Inspect why." copy="HARIKOS resolves important project claims against repository evidence, preserves their history, and exposes uncertainty instead of hiding it." primary={["Connect a repository", "/login"]} secondary={["Explore Evidence", "#evidence"]} visual={<TruthPreview />} />
    <PrincipleStrip items={[["CURRENT", "Verified against a commit"], ["TRACEABLE", "Every claim has evidence"], ["TEMPORAL", "Previous state is preserved"], ["HONEST", "Contradictions stay visible"]]} />
    <PublicSection eyebrow="TEMPORAL TRUTH" title={<>Current does not erase<br /><span>what was true before.</span></>} copy="Scrub across a controlled authentication migration. Status, code evidence, and documentation consistency change together."><ExampleLabel /><TemporalTruth /></PublicSection>
    <PublicSection eyebrow="EVIDENCE / PROVENANCE" title={<>Confidence you can<br /><span>open and inspect.</span></>} copy="A confidence score is only useful when the source, authority, line range, commit, and observation time are visible." tone="deeper">
      <div className="evidence-deep-grid" id="evidence"><ExampleLabel /><article><span>CLAIM</span><h3>Authentication uses Supabase Auth.</h3><div><b>VERIFIED</b><strong>99%</strong></div><small>CURRENT / PROJECT-WIDE</small></article><div className="evidence-path"><i /><i /><i /></div><section>{[["SOURCE", "middleware.ts", "18-34", "98%"], ["SOURCE", "lib/supabase/server.ts", "7-22", "98%"], ["MANIFEST", "package.json", "31", "86%"]].map(([kind, file, lines, authority]) => <article key={file}><span>{kind}</span><strong>{file}<small>:{lines}</small></strong><b>AUTHORITY {authority}</b></article>)}</section></div>
    </PublicSection>
    <PublicSection eyebrow="CONTRADICTIONS" title={<>Disagreement is a state,<br /><span>not an inconvenience.</span></>} copy="When documentation and implementation conflict, HARIKOS keeps both pieces of evidence, applies authority, and marks the disagreement for review." tone="blue"><div className="contradiction-compact"><ExampleLabel /><article><span>README.md:42</span><code>Authentication uses Clerk.</code><b>STALE DOCUMENTATION</b></article><i>VS</i><article><span>middleware.ts:18</span><code>createServerClient()</code><b>CODE / CURRENT</b></article><strong>RESOLUTION / SUPABASE VERIFIED</strong></div></PublicSection>
    <ProductCTA title="Stop treating stale assumptions as current fact." />
  </main></MarketingShell>;
}
