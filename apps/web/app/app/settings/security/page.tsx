import { AppShell } from "../../../../components/app-shell";
import { PageHeader } from "../../../../components/page-header";
import { SettingsNav } from "../../../../components/settings-nav";
import { integrationStatus } from "../../../../lib/config";

export default function SecuritySettingsPage() {
  const status = integrationStatus();
  const checks = [["Supabase Auth", status.supabaseAuth, "Session and identity boundary"], ["PostgreSQL", status.postgres, "Private project persistence"], ["GitHub App", status.githubApp, "Read-only repository authorization"], ["Stripe", status.stripe, "Subscription and webhook boundary"]] as const;
  return <AppShell><PageHeader eyebrow="SETTINGS / SECURITY" title="Security boundaries" copy="Deployment-level readiness and the access rules HARIKOS applies. Missing configuration stays visibly missing." /><SettingsNav active="security" /><section className="panel security-console"><div className="panel-heading"><div><span>INTEGRATION READINESS</span><h2>Server boundaries</h2></div></div>{checks.map(([label, ready, copy]) => <div className="settings-data-row" key={label}><span>{label}</span><strong>{copy}</strong><b className={ready ? "ready" : "missing"}>{ready ? "READY" : "NOT CONFIGURED"}</b></div>)}</section><section className="security-policy-grid">{[["GITHUB", "Contents: Read / Metadata: Read", "No repository writes"], ["SOURCE", "Secret paths denied", "No arbitrary code execution"], ["AGENT TOKENS", "Hashed and project-scoped", "Plaintext shown once"], ["OWNERSHIP", "Resolved on server operations", "Browser IDs are not trusted"]].map(([label, rule, foot], index) => <article className="panel" key={label}><span>0{index + 1} / {label}</span><h3>{rule}</h3><p>{foot}</p></article>)}</section></AppShell>;
}
