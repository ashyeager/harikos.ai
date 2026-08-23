import type { Metadata } from "next";
import Link from "next/link";

import { Brand } from "../../components/brand";
import { integrationStatus } from "../../lib/config";

export const metadata: Metadata = { title: "Connect GitHub" };

export default function LoginPage() {
  const status = integrationStatus();
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
          {status.githubOAuth ? (
            <a className="button button-dark full-button" href="/api/auth/github/start">Continue with GitHub <span>→</span></a>
          ) : (
            <div className="config-notice">
              <span>CONFIGURATION NEEDED</span>
              Add GitHub OAuth/App credentials to enable the real connection flow.
            </div>
          )}
          {status.localDemo ? (
            <Link className="button button-ghost full-button" href="/app/dashboard">Open verified local demo</Link>
          ) : null}
          <small>By continuing, you authorize only the repositories you select.</small>
        </div>
      </section>
    </main>
  );
}
