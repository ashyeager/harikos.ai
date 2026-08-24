import type { Metadata } from "next";
import Link from "next/link";

import { Brand } from "../../components/brand";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main className="auth-page">
      <header className="auth-nav">
        <Brand />
        <Link href="/">Back to overview</Link>
      </header>
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">PRIVACY</span>
          <h1>Your account.<br />Your repositories.</h1>
          <p>HARIKOS uses account and repository data only to provide the project-brain service you request.</p>
        </div>
        <div className="connect-card">
          <h2>Privacy notice</h2>
          <p>Supabase Auth receives identity information from Google or GitHub so HARIKOS can authenticate you and associate your projects with your account.</p>
          <p>When you connect the HARIKOS GitHub App, HARIKOS can read only the repositories you authorize and the read-only contents and metadata permitted by that installation.</p>
          <p>HARIKOS stores project records, scans, evidence-backed claims, memories, contexts, and connection history needed to provide the service. OAuth credentials and GitHub App credentials are handled server-side.</p>
          <p>HARIKOS does not sell personal data. You can revoke repository access from your GitHub App installation settings and sign out to end the current HARIKOS session.</p>
          <small>Effective August 24, 2026.</small>
        </div>
      </section>
    </main>
  );
}
