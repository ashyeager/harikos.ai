import type { Metadata } from "next";
import Link from "next/link";

import { Brand } from "../../components/brand";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <main className="auth-page">
      <header className="auth-nav">
        <Brand />
        <Link href="/">Back to overview</Link>
      </header>
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">TERMS</span>
          <h1>Use HARIKOS<br />with authorized work.</h1>
          <p>These terms keep repository access and account responsibility clear.</p>
        </div>
        <div className="connect-card">
          <h2>Terms of service</h2>
          <p>You may connect only repositories and accounts that you are authorized to access. You remain responsible for the code, content, and instructions you provide to HARIKOS.</p>
          <p>Do not use HARIKOS to access another person&apos;s data, bypass security controls, distribute malware, or violate applicable law or third-party rights.</p>
          <p>HARIKOS produces evidence-backed project information to assist development work. You remain responsible for reviewing outputs before relying on them in production.</p>
          <p>The service may change as the product develops. Repository authorization can be revoked through GitHub, and HARIKOS may restrict access required to protect the service or other users.</p>
          <small>Effective August 24, 2026.</small>
        </div>
      </section>
    </main>
  );
}
