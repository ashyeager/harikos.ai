import { AppShell } from "../../../../components/app-shell";
import { PageHeader } from "../../../../components/page-header";
import { SettingsNav } from "../../../../components/settings-nav";
import { getAuthIdentity } from "../../../../lib/auth";

export default async function ProfileSettingsPage() {
  const identity = await getAuthIdentity();
  return <AppShell><PageHeader eyebrow="SETTINGS / PROFILE" title="Account profile" copy="Your authenticated identity and the separate repository-authorization boundary." /><SettingsNav active="profile" /><section className="settings-content-grid"><article className="panel profile-card"><span>AUTHENTICATED IDENTITY</span><div className="profile-identity"><i>{identity?.login.slice(0, 2).toUpperCase() ?? "AI"}</i><div><h2>{identity?.displayName ?? identity?.login ?? "HARIKOS account"}</h2><p>{identity?.login ?? "No provider identity available"}</p></div></div><div className="settings-data-row"><span>Provider</span><strong>{identity?.provider ?? "Unavailable"}</strong><b>{identity ? "VERIFIED" : "NO SESSION"}</b></div><div className="settings-data-row"><span>Repository access</span><strong>HARIKOS GitHub App</strong><b>SEPARATE</b></div></article><article className="panel account-actions"><span>SESSION</span><h2>Account controls</h2><p>Signing out ends the current HARIKOS session. Repository authorization remains controlled from GitHub App installation settings.</p><a className="button button-ghost" href="https://github.com/settings/installations" rel="noreferrer" target="_blank">Manage GitHub access <span>&nearr;</span></a><form action="/api/auth/logout" method="post"><button className="button button-danger" type="submit">Sign out</button></form></article></section></AppShell>;
}
