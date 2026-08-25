import type { ProjectSnapshot } from "@harikos/core";
import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "./brand";
import { SideNav } from "./side-nav";
import { Settings, Search, GitMerge } from "lucide-react";

export function AppShell({
  snapshot,
  children,
}: {
  snapshot?: ProjectSnapshot;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink text-paper font-sans flex flex-col md:flex-row selection:bg-cyan selection:text-ink">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-[260px] md:h-screen md:sticky top-0 bg-ink-soft border-b md:border-b-0 md:border-r border-line p-4 flex flex-col z-20">
        <div className="hidden md:flex px-2 text-white items-center justify-between mb-8">
          <Brand compact />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-ink border border-line text-[9px] font-mono text-muted">
            <span>⌘</span><span>K</span>
          </div>
        </div>
        
        <Link 
          href="/app/projects" 
          className="mb-6 p-3 flex items-center gap-3 border border-line bg-ink hover:border-cyan/50 hover:bg-ink-elevated transition-colors group rounded-sm shadow-sm"
        >
          <div className="w-8 h-8 rounded-sm bg-line text-white flex items-center justify-center font-mono text-xs font-bold group-hover:bg-cyan/10 group-hover:text-cyan transition-colors">
            {snapshot ? snapshot.repository.name.slice(0, 2).toUpperCase() : "H"}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="text-[9px] font-mono tracking-widest text-muted group-hover:text-cyan/70 transition-colors uppercase">
              {snapshot ? "ACTIVE PROJECT" : "PROJECTS"}
            </span>
            <span className="text-xs font-bold text-white truncate">
              {snapshot?.repository.name ?? "Choose a project"}
            </span>
          </div>
          <span className="text-muted text-[10px] group-hover:text-white transition-colors">▼</span>
        </Link>
        
        <div className="mb-4">
          <span className="hidden md:block mx-3 mb-2 font-mono text-[9px] tracking-widest uppercase text-muted">Workspace</span>
          {snapshot ? <SideNav projectId={snapshot.projectId} /> : null}
        </div>
        
        <div className="hidden md:flex mt-auto flex-col gap-2">
          <Link href="/app/settings" className="h-9 px-3 flex items-center gap-3 text-muted hover:text-white hover:bg-ink border border-transparent hover:border-line transition-all rounded-sm group">
            <Settings size={14} className="group-hover:text-white transition-colors" strokeWidth={2} />
            <span className="text-xs font-medium">Settings</span>
          </Link>
          
          <div className="mt-2 pt-4 border-t border-line flex items-center gap-3 px-2">
            <div className="w-7 h-7 rounded-full bg-ink border border-line text-cyan flex items-center justify-center font-mono text-[9px] font-bold shadow-[0_0_8px_rgba(0,217,232,0.1)]">
              AK
            </div>
            <div className="flex flex-col min-w-0">
              <strong className="text-xs font-medium text-white truncate">
                {snapshot?.mode === "github" ? "GitHub workspace" : snapshot?.mode === "fixture" ? "Demo workspace" : snapshot ? "Local builder" : "Account"}
              </strong>
              <span className="text-[9px] font-mono tracking-widest text-muted uppercase">
                {snapshot?.mode === "fixture" ? "Verified" : snapshot?.mode ?? "No active project"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-ink">
        <header className="h-14 px-4 md:px-8 flex items-center justify-between sticky top-0 bg-ink/80 backdrop-blur-xl border-b border-line z-10">
          <Link href="/app/dashboard" className="md:hidden font-mono font-bold text-white">H/AI</Link>
          
          <div className="hidden md:flex items-center gap-4 text-xs">
             <div className="flex items-center gap-2 text-muted">
               <GitMerge size={14} />
               <span className="font-mono">{snapshot?.repository.name ?? 'No Project'}</span>
             </div>
             {snapshot && (
               <>
                 <span className="text-line-light">/</span>
                 <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"></span>
                   <span className="font-mono text-[10px] tracking-widest text-white uppercase flex items-center gap-2">
                     VERIFIED <span className="text-muted px-1.5 border border-line bg-ink-soft rounded-sm">{snapshot.repository.headSha.slice(0, 8)}</span>
                   </span>
                 </div>
               </>
             )}
          </div>
          
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 h-8 px-3 border border-line bg-ink-soft text-muted hover:text-white transition-colors text-xs rounded-sm">
              <Search size={12} />
              <span>Search...</span>
              <kbd className="font-mono text-[9px] bg-line px-1 rounded-sm ml-4 text-muted">⌘K</kbd>
            </button>
            
            {snapshot ? (
              <Link href={`/app/project/${snapshot.projectId}/context`} className="h-8 px-4 flex items-center justify-center border border-transparent bg-white text-ink hover:bg-paper-soft font-mono font-bold text-[10px] tracking-wide uppercase transition-colors rounded-sm shadow-sm">
                Prepare Context &rarr;
              </Link>
            ) : null}
            
            <Link href="/app/settings" className="md:hidden w-8 h-8 border border-line bg-ink hover:border-cyan text-white flex items-center justify-center transition-colors rounded-sm">
              <Settings size={14} />
            </Link>
          </div>
        </header>
        
        <main className="p-6 md:p-10 w-full max-w-[1100px] mx-auto pb-32">
          {children}
        </main>
      </div>
    </div>
  );
}
