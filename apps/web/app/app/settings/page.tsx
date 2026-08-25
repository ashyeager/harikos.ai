import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/page-header";
import { integrationStatus } from "../../../lib/config";
import { getAuthIdentity } from "../../../lib/auth";
import { Settings, Shield, Key, Database, Github, User, LogOut, CheckCircle2, ShieldAlert, Lock, Code2, AlertTriangle } from "lucide-react";
import { cn } from "../../../lib/utils";

const variables = [
  { label: "Supabase Auth", vars: "NEXT_PUBLIC_SUPABASE_URL\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key: "supabaseAuth", icon: Key },
  { label: "Github App", vars: "GITHUB_APP_ID\nGITHUB_APP_PRIVATE_KEY\nGITHUB_APP_SLUG\nGITHUB_CLIENT_ID\nGITHUB_CLIENT_SECRET", key: "githubApp", icon: Github },
  { label: "PostgreSQL", vars: "DATABASE_URL", key: "postgres", icon: Database },
] as const;

export default async function SettingsPage() {
  const status = integrationStatus();
  const identity = await getAuthIdentity();

  return (
    <AppShell>
      <PageHeader 
        eyebrow="SYSTEM CONFIGURATION" 
        title="Settings" 
        copy="Operational integration status. HARIKOS never invents credentials or reports an unavailable boundary as connected." 
      />

      {identity ? (
        <section className="bg-ink border border-line mb-8 flex flex-col rounded-sm overflow-hidden shadow-sm">
          <div className="p-6 border-b border-line bg-ink-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan/10 border border-cyan/20 text-cyan flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <span className="font-mono text-[9px] tracking-widest text-muted uppercase block mb-1">ACCOUNT</span>
                <h2 className="text-lg font-bold text-white leading-none">{identity.login}</h2>
              </div>
            </div>
            <b className="font-mono text-[9px] tracking-widest text-green uppercase flex items-center gap-1.5 bg-green/10 px-3 py-1.5 rounded-sm border border-green/20">
              <CheckCircle2 size={12} /> VERIFIED
            </b>
          </div>
          
          <div className="flex flex-col divide-y divide-line">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-ink-soft/30 transition-colors">
              <div className="flex items-center gap-3">
                <Key size={16} className="text-muted" />
                <span className="text-sm text-white">Identity provider</span>
              </div>
              <div className="flex items-center gap-3 bg-ink-elevated px-4 py-2 rounded-sm border border-line font-mono text-[11px] text-muted uppercase tracking-widest">
                Supabase Auth <span className="text-line">•</span> <span className="text-white">{identity.provider}</span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-ink-soft/30 transition-colors">
              <div className="flex items-center gap-3">
                <Github size={16} className="text-muted" />
                <span className="text-sm text-white">Repository access</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://github.com/settings/installations" className="text-sm text-cyan hover:text-white underline-offset-4 hover:underline transition-colors">
                  Manage Installations
                </a>
                <span className="font-mono text-[9px] tracking-widest text-muted uppercase bg-ink-soft px-2 py-1 rounded-sm border border-line">
                  READ ONLY
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-ink-soft border-t border-line flex justify-end">
            <form action="/api/auth/logout" method="post">
              <button 
                className="h-10 px-6 flex items-center justify-center gap-2 border border-line bg-ink text-white hover:border-orange hover:bg-orange/10 hover:text-orange transition-colors font-mono font-bold text-[10px] uppercase tracking-widest rounded-sm"
                type="submit"
              >
                <LogOut size={14} /> Sign out
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <div className="mb-4 flex items-center gap-2">
        <Settings size={14} className="text-cyan" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Infrastructure Boundaries</h3>
      </div>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {variables.map(({ label, vars, key: statusKey, icon: Icon }) => {
          const isReady = status[statusKey as keyof typeof status];
          return (
            <article 
              className={cn(
                "bg-ink border rounded-sm p-6 flex flex-col group transition-all relative overflow-hidden",
                isReady ? "border-line hover:border-cyan/50 shadow-sm" : "border-orange/30 hover:border-orange"
              )} 
              key={label}
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                isReady ? "bg-gradient-to-r from-transparent via-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" : "bg-orange"
              )} />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-sm flex items-center justify-center",
                    isReady ? "bg-cyan/10 text-cyan" : "bg-orange/10 text-orange"
                  )}>
                    <Icon size={16} />
                  </div>
                  <h2 className="text-base font-bold text-white">{label}</h2>
                </div>
                
                <span className={cn(
                  "font-mono text-[9px] tracking-widest uppercase flex items-center gap-1.5",
                  isReady ? "text-green" : "text-orange"
                )}>
                  {isReady ? <><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" /> READY</> : <><ShieldAlert size={12} /> PENDING</>}
                </span>
              </div>
              
              <code className="font-mono text-[10px] text-muted whitespace-pre-wrap break-all bg-ink-soft border border-line p-4 rounded-sm mb-6 flex-1 shadow-inner">
                {vars}
              </code>
              
              <p className={cn("text-xs leading-relaxed flex items-start gap-2", isReady ? "text-muted" : "text-orange/80")}>
                {isReady ? (
                  <><CheckCircle2 size={14} className="text-green shrink-0 mt-0.5" /> The server-side boundary is configured.</>
                ) : (
                  <><AlertTriangle size={14} className="shrink-0 mt-0.5" /> Add to server environment. Never expose to browser.</>
                )}
              </p>
            </article>
          );
        })}
      </section>

      <div className="mb-4 flex items-center gap-2">
        <Shield size={14} className="text-cyan" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security Policy Defaults</h3>
      </div>
      
      <section className="bg-ink border border-line mb-12 flex flex-col rounded-sm shadow-sm overflow-hidden">
        <div className="flex flex-col divide-y divide-line">
          
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ink-soft/30 hover:bg-ink-soft/50 transition-colors">
            <div className="flex items-center gap-3">
              <Github size={16} className="text-muted" />
              <span className="text-sm text-white font-medium">Github permissions</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">Contents: Read &middot; Metadata: Read</span>
              <b className="font-mono text-[9px] tracking-widest text-orange uppercase flex items-center gap-1 bg-orange/10 px-2 py-1 rounded-sm border border-orange/20">
                <Lock size={10} /> LOCKED
              </b>
            </div>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ink-soft/30 hover:bg-ink-soft/50 transition-colors">
            <div className="flex items-center gap-3">
              <Key size={16} className="text-muted" />
              <span className="text-sm text-white font-medium">Secret files</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">.env, keys, tokens, credentials denied</span>
              <b className="font-mono text-[9px] tracking-widest text-green uppercase flex items-center gap-1 bg-green/10 px-2 py-1 rounded-sm border border-green/20">
                <Shield size={10} /> ENFORCED
              </b>
            </div>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ink-soft/30 hover:bg-ink-soft/50 transition-colors">
            <div className="flex items-center gap-3">
              <Code2 size={16} className="text-muted" />
              <span className="text-sm text-white font-medium">Repository execution</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">Never execute connected project code</span>
              <b className="font-mono text-[9px] tracking-widest text-green uppercase flex items-center gap-1 bg-green/10 px-2 py-1 rounded-sm border border-green/20">
                <Shield size={10} /> ENFORCED
              </b>
            </div>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ink-soft/30 hover:bg-ink-soft/50 transition-colors">
            <div className="flex items-center gap-3">
              <Database size={16} className="text-muted" />
              <span className="text-sm text-white font-medium">Local fixture</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">Clearly labeled, no external credentials</span>
              <b className={cn(
                "font-mono text-[9px] tracking-widest uppercase flex items-center gap-1 px-2 py-1 rounded-sm border",
                status.localDemo 
                  ? "bg-cyan/10 text-cyan border-cyan/20" 
                  : "bg-ink border-line text-muted"
              )}>
                {status.localDemo ? "ENABLED" : "DISABLED"}
              </b>
            </div>
          </div>
          
        </div>
      </section>
    </AppShell>
  );
}
