import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { integrationStatus } from "../../../lib/config";
import { demoSnapshot } from "../../../lib/project-data";

const variables = [
  ["GitHub OAuth", "GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET", "githubOAuth"],
  ["GitHub App", "GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY / GITHUB_APP_SLUG", "githubApp"],
  ["PostgreSQL", "DATABASE_URL", "postgres"],
] as const;

export default function SettingsPage() {
  const snapshot = demoSnapshot();
  const status = integrationStatus();
  return (
    <AppShell snapshot={snapshot}>
      <PageHeader eyebrow="SYSTEM CONFIGURATION" title="Settings" copy="Operational integration status. HARIKOS never invents credentials or reports an unavailable boundary as connected." />
      <section className="settings-grid">
        {variables.map(([label, variable, key]) => (
          <article className="panel setting-card" key={label}>
            <div><span className={`integration-dot ${status[key] ? "ready" : ""}`} /><small>{status[key] ? "READY" : "NOT CONFIGURED"}</small></div>
            <h2>{label}</h2>
            <code>{variable}</code>
            <p>{status[key] ? "The server-side boundary is configured." : "Add this value to the server environment. Never expose it to the browser."}</p>
          </article>
        ))}
      </section>
      <section className="panel security-settings">
        <div className="panel-heading"><div><span>REPOSITORY ACCESS POLICY</span><h2>Security defaults</h2></div></div>
        <div className="security-setting-row"><span>GitHub permissions</span><strong>Contents: Read · Metadata: Read</strong><b>LOCKED</b></div>
        <div className="security-setting-row"><span>Secret files</span><strong>.env, keys, tokens, credentials denied</strong><b>ENFORCED</b></div>
        <div className="security-setting-row"><span>Repository execution</span><strong>Never execute connected project code</strong><b>ENFORCED</b></div>
        <div className="security-setting-row"><span>Local fixture</span><strong>Clearly labeled, no external credentials</strong><b>{status.localDemo ? "ENABLED" : "DISABLED"}</b></div>
      </section>
    </AppShell>
  );
}
