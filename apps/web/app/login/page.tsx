import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "../../components/brand";
import { ProjectBrain } from "../../components/marketing/project-brain";
import { ThemeToggle } from "../../components/ux-provider";
import { safeAuthNext } from "../../lib/auth-redirect";
import { getAuthIdentity } from "../../lib/auth";
import { integrationStatus } from "../../lib/config";
import { readSupabaseProviderStatus } from "../../lib/supabase/config";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to connect a repository and build a shared HARIKOS Project Brain." };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string | string[]; next?: string | string[] }> }) {
  const params = await searchParams;
  const next = safeAuthNext(typeof params.next === "string" ? params.next : null);
  if (await getAuthIdentity()) redirect(next === "/app/projects" ? "/app/dashboard" : next);
  const { error } = params;
  const status = integrationStatus();
  const providers = await readSupabaseProviderStatus();
  const hasProvider = providers.github || providers.google;
  return <main className="login-page" id="main-content" tabIndex={-1}>
    <header className="login-nav"><Brand /><div className="login-nav-actions"><ThemeToggle /><Link href="/">Back to HARIKOS AI</Link></div></header>
    <section className="login-visual technical-sphere-stage">
      <span className="example-label">ILLUSTRATIVE PROJECT BRAIN</span>
      <ProjectBrain />
      <div className="login-visual-copy"><span>ONE PROJECT / MANY AGENTS</span><h1>Your next agent should know what the last one learned.</h1><p>Truth stays current. Useful history persists. Context stays focused.</p></div>
    </section>
    <section className="login-workspace">
      <div className="login-card">
        <span className="eyebrow"><i />ACCOUNT / AUTHENTICATION</span>
        <h2>Connect your project brain.</h2>
        <p>Sign in first. GitHub repository authorization is a separate read-only App connection that you choose afterward.</p>
        {error === "oauth" ? <p className="inline-error" role="alert">Sign-in could not be completed. Please try again.</p> : null}
        {status.supabaseAuth && hasProvider ? <div className="auth-provider-buttons">
          {providers.github ? <a className="auth-provider auth-github" href={`/api/auth/github/start?next=${encodeURIComponent(next)}`}><span>GH</span><strong>Continue with GitHub</strong><b>&rarr;</b></a> : null}
          {providers.google ? <a className="auth-provider auth-google" href={`/api/auth/google/start?next=${encodeURIComponent(next)}`}><span>G</span><strong>Continue with Google</strong><b>&rarr;</b></a> : null}
        </div> : <div className="config-notice" role="status"><span>AUTHENTICATION UNAVAILABLE</span>{status.supabaseAuth ? "No supported OAuth provider is enabled for this deployment." : "Supabase Auth is not configured for this deployment."}</div>}
        <div className="permission-note"><i /><p><strong>Repository access is not granted here.</strong> After authentication, you choose which repositories the read-only HARIKOS GitHub App can access.</p></div>
        <small>By continuing, you agree to the <Link href="/terms">Terms</Link> and acknowledge the <Link href="/privacy">Privacy notice</Link>.</small>
      </div>
    </section>
  </main>;
}
