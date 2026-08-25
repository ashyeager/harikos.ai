import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "../../components/brand";
import { integrationStatus } from "../../lib/config";
import { getAuthIdentity } from "../../lib/auth";
import { readSupabaseProviderStatus } from "../../lib/supabase/config";
import { Github, FileCode2, Database, Shield, Lock, ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = { title: "Sign in - HARIKOS" };

export default async function LoginPage() {
  if (await getAuthIdentity()) redirect("/app/projects");

  const status = integrationStatus();
  const providers = await readSupabaseProviderStatus();
  const hasProvider = providers.github || providers.google;

  return (
    <main className="min-h-screen bg-ink text-paper font-sans flex flex-col">
      <header className="h-16 px-6 md:px-12 flex justify-between items-center border-b border-line">
        <Brand />
        <Link href="/" className="font-mono text-[10px] tracking-widest text-muted hover:text-white uppercase transition-colors flex items-center gap-2">
          Back to overview <ArrowRight size={12} />
        </Link>
      </header>

      <section className="flex-1 grid grid-cols-1 md:grid-cols-2 relative">
        
        {/* LEFT COLUMN - MARKETING/INFO */}
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center border-b md:border-b-0 md:border-r border-line bg-ink relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-xl">
            <span className="font-mono text-[10px] tracking-widest text-cyan uppercase mb-6 flex items-center gap-2">
              <Shield size={12} /> SECURE AUTHENTICATION
            </span>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
              Connect a repository.<br />Build Project Truth.
            </h1>
            
            <p className="text-muted leading-relaxed mb-12 text-lg">
              HARIKOS requests read-only access to source contents and repository metadata. It never asks you to paste a personal access token.
            </p>
            
            <div className="flex flex-col gap-5 border-t border-line pt-12">
              <div className="flex justify-between items-center bg-ink-soft p-4 border border-line rounded-sm">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 rounded-full bg-green/10 text-green flex items-center justify-center">
                    <FileCode2 size={14} />
                  </div>
                  <span className="font-medium text-sm">Source Contents</span>
                </div>
                <span className="font-mono text-[10px] text-green tracking-widest uppercase flex items-center gap-1">
                  <Check size={12} /> Read-only
                </span>
              </div>
              
              <div className="flex justify-between items-center bg-ink-soft p-4 border border-line rounded-sm">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 rounded-full bg-green/10 text-green flex items-center justify-center">
                    <Database size={14} />
                  </div>
                  <span className="font-medium text-sm">Repository Metadata</span>
                </div>
                <span className="font-mono text-[10px] text-green tracking-widest uppercase flex items-center gap-1">
                  <Check size={12} /> Read-only
                </span>
              </div>
              
              <div className="flex justify-between items-center bg-ink/50 p-4 border border-dashed border-line rounded-sm opacity-60">
                <div className="flex items-center gap-3 text-muted">
                  <div className="w-8 h-8 rounded-full bg-ink text-muted flex items-center justify-center border border-line">
                    <Lock size={14} />
                  </div>
                  <span className="font-medium text-sm">Repository Writes</span>
                </div>
                <span className="font-mono text-[10px] text-muted tracking-widest uppercase">Not requested</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - LOGIN FORM */}
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center relative bg-ink-soft/30">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
          
          <div className="relative z-10 w-full max-w-[400px] bg-ink p-10 border border-line shadow-2xl rounded-sm">
            <div className="w-12 h-12 bg-white text-ink flex items-center justify-center rounded-sm mb-8 shadow-sm">
              <Github size={24} />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Sign in to HARIKOS</h2>
            <p className="text-muted text-sm leading-relaxed mb-8">
              Authenticate securely to install the HARIKOS Github App and start analyzing your codebase.
            </p>
            
            {status.supabaseAuth && hasProvider ? (
              <div className="flex flex-col gap-4">
                {providers.github && (
                  <a 
                    href="/api/auth/github/start" 
                    className="h-12 flex items-center justify-center gap-3 bg-white text-ink hover:bg-paper-soft font-mono font-bold text-[10px] tracking-widest uppercase transition-colors w-full rounded-sm shadow-sm"
                  >
                    <Github size={16} /> Continue with Github
                  </a>
                )}
                {providers.google && (
                  <a 
                    href="/api/auth/google/start" 
                    className="h-12 flex items-center justify-center gap-2 border border-line text-white hover:border-cyan hover:bg-ink-soft font-mono font-bold text-[10px] tracking-widest uppercase transition-colors w-full rounded-sm"
                  >
                    Continue with Google
                  </a>
                )}
              </div>
            ) : (
              <div className="border border-orange bg-orange/10 p-5 rounded-sm">
                <span className="font-mono text-[10px] font-bold tracking-widest text-orange block mb-2 flex items-center gap-2">
                  <Shield size={12} /> CONFIGURATION NEEDED
                </span>
                <span className="text-xs text-orange/80 leading-relaxed block">
                  {status.supabaseAuth
                    ? "Enable a supported OAuth provider in the existing Supabase project."
                    : "Connect Supabase Auth to enable the real sign-in flow."}
                </span>
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-line text-center">
              <p className="text-[10px] font-mono text-muted leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy Policy. You authorize only the repositories you explicitly select.
              </p>
            </div>
          </div>
        </div>
        
      </section>
    </main>
  );
}
