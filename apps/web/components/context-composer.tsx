"use client";

import { useState } from "react";
import { Terminal, Copy, CheckCircle2, ChevronRight, FileCode, Cpu, Code2, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface ContextResult {
  text: string;
  tokenEstimate: number;
  relevantFiles: string[];
  truths: Array<{ id: string; subject: string; value: string; status: string }>;
}

export function ContextComposer({ projectId }: { projectId: string }) {
  const [task, setTask] = useState("Modify authentication middleware");
  const [result, setResult] = useState<ContextResult>();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string>();
  const [error, setError] = useState<string>();

  async function prepare() {
    if (!task.trim()) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const body = (await response.json()) as ContextResult & { error?: string };
      if (!response.ok || !body.text) {
        setError(body.error ?? "Context generation failed.");
        return;
      }
      setResult(body);
    } catch {
      setError("Context generation could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(label: string) {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(label);
      window.setTimeout(() => setCopied(undefined), 1600);
    } catch {
      setError("Clipboard access was not available. Select the context text manually.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      {/* INPUT SECTION */}
      <section className="bg-ink border border-line flex flex-col gap-6 relative rounded-sm shadow-xl overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange to-transparent opacity-30 group-hover:opacity-70 transition-opacity" />
        
        <div className="p-8 pb-0">
          <span className="font-mono text-[9px] tracking-widest text-orange uppercase flex items-center gap-2 mb-3">
            <Terminal size={12} /> TASK INPUT
          </span>
          <h2 className="text-xl font-bold text-white mb-2 leading-snug">What are you about to build?</h2>
          <p className="text-sm text-muted">HARIKOS will select current truths, relevant changes, constraints, and evidence — creating a compact Context Pack.</p>
        </div>
        
        <div className="px-8 pb-8 flex flex-col gap-4">
          <textarea 
            aria-label="Development task" 
            onChange={(event) => setTask(event.target.value)} 
            value={task}
            placeholder="Describe the feature, bug fix, or architecture change..."
            className="min-h-[180px] p-4 bg-ink-soft border border-line text-white font-mono text-sm leading-relaxed outline-none focus:border-orange/50 focus:shadow-[0_0_15px_rgba(255,104,24,0.14)] transition-all resize-y rounded-sm placeholder:text-muted/50"
          />
          
          <div className="flex items-center justify-between">
            {error ? (
              <p className="text-red text-xs p-2 border border-red/20 bg-red/10 rounded-sm flex items-center gap-2 font-mono">
                <AlertCircle size={12} />
                {error}
              </p>
            ) : <div />}
            
            <button 
              className={cn(
                "h-12 px-8 flex items-center justify-center gap-3 bg-white text-ink font-mono font-bold text-[10px] tracking-widest uppercase rounded-sm shadow-sm transition-colors",
                (loading || !task.trim()) ? "opacity-50 cursor-not-allowed" : "hover:bg-paper-soft"
              )}
              disabled={loading || !task.trim()} 
              onClick={prepare} 
              type="button"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  Prepare Context Pack <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* OUTPUT SECTION */}
      <section className="bg-ink border border-line flex flex-col min-h-[480px] rounded-sm overflow-hidden">
        {result ? (
          <>
            <div className="px-6 py-4 flex items-center justify-between border-b border-line bg-ink-soft">
              <div className="flex items-center gap-2">
                <FileCode size={14} className="text-muted" />
                <h2 className="text-sm font-bold text-white">Generated Context Pack</h2>
              </div>
              <span className="font-mono text-[9px] tracking-widest text-orange uppercase bg-orange/10 border border-orange/20 px-2 py-0.5 rounded-sm">
                {result.tokenEstimate} estimated tokens
              </span>
            </div>
            
            <pre className="flex-1 p-6 text-[11px] sm:text-xs text-white font-mono whitespace-pre-wrap break-words overflow-auto max-h-[600px] bg-ink selection:bg-orange selection:text-ink">
              {result.text}
            </pre>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-line divide-x divide-line bg-ink-soft">
              {[
                { id: "context", label: "Copy Text", icon: Copy },
                { id: "codex", label: "For Codex", icon: Code2 },
                { id: "claude", label: "For Claude", icon: Cpu },
                { id: "cursor", label: "For Cursor", icon: Terminal },
              ].map(({ id, label, icon: Icon }) => (
                <button 
                  key={id} 
                  onClick={() => copy(id)} 
                  type="button"
                  className="p-4 flex flex-col items-center justify-center gap-2 transition-colors text-muted hover:text-white hover:bg-ink-elevated group"
                >
                  {copied === id ? (
                    <>
                      <CheckCircle2 size={16} className="text-green" />
                      <span className="text-[9px] font-mono tracking-widest uppercase text-green font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Icon size={16} className="group-hover:text-orange transition-colors" />
                      <span className="text-[9px] font-mono tracking-widest uppercase">{label}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-ink-soft/30">
            <div className="w-16 h-16 rounded-full border border-line bg-ink flex items-center justify-center mb-6 shadow-sm">
              <Code2 size={24} className="text-muted opacity-50" />
            </div>
            <strong className="text-white text-base mb-2">Context Pack will appear here.</strong>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Describe a development task to generate perfectly scoped instructions for your coding agent.
            </p>
          </div>
        )}
      </section>
      
    </div>
  );
}
