import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Brand } from "../../components/brand";
import { integrationStatus } from "../../lib/config";
import { getAuthIdentity } from "../../lib/auth";
import { readSupabaseProviderStatus } from "../../lib/supabase/config";

export const metadata: Metadata = { title: "Connect GitHub" };

export default async function LoginPage() {
  if (await getAuthIdentity()) redirect("/app/projects");
  const status = integrationStatus();
  const providers = await readSupabaseProviderStatus();
  const hasProvider = providers.github || providers.google;
  return (
    <main className="auth-page">
      <header className="auth-nav"><Brand /><Link href="/">Back to overview</Link></header>
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">START WITH EVIDENCE</span>
          <h1>Connect a repository.<br />Build Project Truth.</h1>
          <p>HARIKOS requests read-only access to source contents and repository metadata. It never asks you to paste a personal access token.</p>
          <div className="auth-permissions">
            <div><span>✓</span><strong>Contents</strong><small>Read-only</small></div>
            <div><span>✓</span><strong>Metadata</strong><small>Read-only</small></div>
            <div><span>—</span><strong>Repository writes</strong><small>Not requested</small></div>
          </div>
        </div>
        <div className="connect-card">
          <div className="connect-mark" aria-hidden="true">⌘</div>
          <h2>Continue with GitHub</h2>
          <p>Authenticate, install the HARIKOS GitHub App on selected repositories, then choose what to analyze.</p>
          {status.supabaseAuth && hasProvider ? (
            <div className="auth-provider-buttons">
              {providers.github ? <a className="button button-dark full-button" href="/api/auth/github/start">Continue with GitHub <span>→</span></a> : null}
              {providers.google ? <a className="button button-ghost full-button" href="/api/auth/google/start">Continue with Google <span>→</span></a> : null}
            </div>
          ) : (
            <div className="config-notice">
              <span>CONFIGURATION NEEDED</span>
              {status.supabaseAuth
                ? "Enable a supported OAuth provider in the existing Supabase project."
                : "Connect Supabase Auth to enable the real sign-in flow."}
            </div>
          )}
          <small>By continuing, you authorize only the repositories you select.</small>
        </div>
      </section>
    </main>
  );
}
