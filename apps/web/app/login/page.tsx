import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "../../components/brand";
import { ProjectBrain } from "../../components/marketing/project-brain";
import { getAuthIdentity } from "../../lib/auth";
import { integrationStatus, isDemoMode } from "../../lib/config";
import { readSupabaseProviderStatus } from "../../lib/supabase/config";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to connect a repository and build a shared HARIKOS Project Brain." };

export default async function LoginPage() {
  if (await getAuthIdentity()) redirect("/app/dashboard");
  const status = integrationStatus();
  const providers = await readSupabaseProviderStatus();
  const hasProvider = providers.github || providers.google;
  return <main className="login-page">
    <header className="login-nav"><Brand /><Link href="/">Back to HARIKOS AI</Link></header>
    <section className="login-visual">
      <span className="example-label">ILLUSTRATIVE PROJECT BRAIN</span>
      <ProjectBrain />
      <div className="login-visual-copy"><span>ONE PROJECT / MANY AGENTS</span><h1>Your next agent should know what the last one learned.</h1><p>Truth stays current. Useful history persists. Context stays focused.</p></div>
    </section>
    <section className="login-workspace">
      <div className="login-card">
        <span className="eyebrow"><i />ACCOUNT / AUTHENTICATION</span>
        <h2>Connect your project brain.</h2>
        <p>Sign in first. GitHub repository authorization is a separate read-only App connection that you choose afterward.</p>
        {isDemoMode() ? <div className="auth-provider-buttons">
          <a className="auth-provider auth-demo" href="/app/dashboard"><span>DE</span><strong>Enter Demo</strong><b>&rarr;</b></a>
          <div className="config-notice" role="status"><span>DEMO MODE</span>Authentication is bypassed for development only.</div>
        </div> : status.supabaseAuth && hasProvider ? <div className="auth-provider-buttons">
          {providers.github ? <a className="auth-provider auth-github" href="/api/auth/github/start"><span>GH</span><strong>Continue with GitHub</strong><b>&rarr;</b></a> : null}
          {providers.google ? <a className="auth-provider auth-google" href="/api/auth/google/start"><span>G</span><strong>Continue with Google</strong><b>&rarr;</b></a> : null}
        </div> : <div className="config-notice" role="status"><span>AUTHENTICATION UNAVAILABLE</span>{status.supabaseAuth ? "No supported OAuth provider is enabled for this deployment." : "Supabase Auth is not configured for this deployment."}</div>}
        <div className="permission-note"><i /><p><strong>Repository access is not granted here.</strong> After authentication, you choose which repositories the read-only HARIKOS GitHub App can access.</p></div>
        <small>By continuing, you agree to the <Link href="/terms">Terms</Link> and acknowledge the <Link href="/privacy">Privacy notice</Link>.</small>
      </div>
    </section>
  </main>;
}
