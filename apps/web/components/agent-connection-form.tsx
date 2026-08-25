"use client";

import { useState } from "react";
import type { AgentConnection } from "../lib/cloud-projects";
import { Cpu, Key, Copy, CheckCircle2, ShieldAlert, Plus, Trash2, PowerOff, Shield, Terminal } from "lucide-react";
import { cn } from "../lib/utils";

export function AgentConnectionForm({ projectId, initialConnections }: { projectId: string; initialConnections: AgentConnection[] }) {
  const [connections, setConnections] = useState(initialConnections);
  const [name, setName] = useState("Claude Code");
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setIsGenerating(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/projects/${projectId}/agents`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ name }) 
      });
      const body = await response.json() as { connection?: AgentConnection; token?: string; error?: string };
      
      if (!response.ok || !body.connection || !body.token) { 
        setError(body.error ?? "Connection could not be created."); 
        return; 
      }
      
      setConnections((current) => [body.connection!, ...current]); 
      setToken(body.token);
      setShowForm(false);
    } catch {
      setError("Failed to create connection.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function revoke(id: string) {
    await fetch(`/api/projects/${projectId}/agents?connectionId=${encodeURIComponent(id)}`, { method: "DELETE" });
    setConnections((current) => current.map((connection) => connection.id === id ? { ...connection, revokedAt: new Date().toISOString() } : connection));
  }
  
  function copyToken() {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* HEADER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line rounded-sm overflow-hidden">
        <div className="bg-ink p-5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase block mb-1">TOTAL AGENTS</span>
            <strong className="text-white text-xl">{connections.length}</strong>
          </div>
          <Cpu size={24} className="text-muted opacity-50" />
        </div>
        <div className="bg-ink p-5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase block mb-1">ACTIVE</span>
            <strong className="text-cyan text-xl">{connections.filter(c => !c.revokedAt).length}</strong>
          </div>
          <Shield size={24} className="text-cyan opacity-50" />
        </div>
        <div className="bg-ink p-5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase block mb-1">REVOKED</span>
            <strong className="text-orange text-xl">{connections.filter(c => c.revokedAt).length}</strong>
          </div>
          <ShieldAlert size={24} className="text-orange opacity-50" />
        </div>
      </div>
      
      {/* TOKEN DISPLAY (CRITICAL) */}
      {token && (
        <div className="bg-ink-elevated border border-cyan/30 p-6 rounded-sm shadow-[0_0_30px_rgba(0,217,232,0.1)] animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-cyan/10 text-cyan flex items-center justify-center">
              <Key size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Connection Created</h2>
              <p className="text-sm text-cyan">Copy this token now. You won't be able to see it again.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <code className="flex-1 p-4 bg-ink border border-line text-white font-mono text-xs rounded-sm break-all leading-relaxed">
              {token}
            </code>
            <button 
              onClick={copyToken}
              className="px-6 flex items-center justify-center gap-2 bg-white text-ink hover:bg-paper-soft font-mono text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
            >
              {copied ? <><CheckCircle2 size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-ink/50 border border-line rounded-sm">
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase mb-3 flex items-center gap-2">
              <Terminal size={12} /> Usage Instruction
            </span>
            <pre className="text-[11px] text-muted font-mono whitespace-pre-wrap">
<span className="text-cyan">POST</span> /api/mcp/{projectId}
<span className="text-cyan">Authorization</span>: Bearer {'<token>'}
            </pre>
          </div>
          
          <button 
            onClick={() => setToken(undefined)}
            className="mt-6 text-[10px] font-mono tracking-widest text-muted hover:text-white uppercase transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CREATE FORM */}
      {showForm && !token ? (
        <section className="bg-ink border border-line p-6 rounded-sm animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus size={16} className="text-cyan" /> New Agent Connection
            </h2>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-white transition-colors">×</button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              aria-label="Connection name" 
              onChange={(event) => setName(event.target.value)} 
              value={name} 
              placeholder="e.g. Claude Code Desktop"
              className="flex-1 h-10 px-4 bg-ink-soft border border-line text-white font-mono text-sm outline-none focus:border-cyan transition-colors rounded-sm"
              autoFocus
            />
            <button 
              className={cn(
                "h-10 px-6 flex items-center justify-center gap-2 bg-white text-ink font-mono font-bold text-[10px] tracking-widest uppercase rounded-sm shadow-sm transition-colors",
                (!name.trim() || isGenerating) ? "opacity-50 cursor-not-allowed" : "hover:bg-paper-soft"
              )}
              onClick={create} 
              disabled={!name.trim() || isGenerating}
              type="button"
            >
              {isGenerating ? "Generating..." : "Generate Token"}
            </button>
          </div>
          {error && <p className="text-red text-xs mt-3 flex items-center gap-1.5 font-mono"><ShieldAlert size={12}/> {error}</p>}
        </section>
      ) : !token ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full p-4 border border-dashed border-line hover:border-cyan hover:bg-ink-soft text-muted hover:text-cyan transition-all rounded-sm flex items-center justify-center gap-2 group"
        >
          <div className="w-6 h-6 rounded-sm bg-ink border border-line group-hover:border-cyan/50 flex items-center justify-center transition-colors">
            <Plus size={12} />
          </div>
          <span className="font-mono text-[10px] tracking-widest uppercase">Create New Connection</span>
        </button>
      )}

      {/* CONNECTIONS LIST */}
      <section className="bg-ink border border-line rounded-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-line bg-ink-soft">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-muted" />
            <h2 className="text-sm font-bold text-white">Active Connections</h2>
          </div>
        </div>
        
        <div className="flex flex-col divide-y divide-line">
          {connections.length ? connections.map((connection) => (
            <div className="p-5 flex items-center justify-between gap-4 group hover:bg-ink-soft/50 transition-colors" key={connection.id}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-2 h-2 rounded-full shadow-sm",
                  connection.revokedAt ? "bg-orange shadow-orange/20" : "bg-cyan shadow-cyan/20 animate-pulse"
                )} />
                <div className="flex flex-col gap-1">
                  <strong className="text-white text-sm">{connection.name}</strong>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase">
                    <span className="text-muted px-1.5 py-0.5 bg-ink border border-line rounded-sm">
                      {connection.tokenPrefix}••••
                    </span>
                    <span className={connection.revokedAt ? "text-orange" : "text-cyan"}>
                      {connection.revokedAt ? `Revoked ${new Date(connection.revokedAt).toLocaleDateString()}` : "Active"}
                    </span>
                  </div>
                </div>
              </div>
              
              {!connection.revokedAt ? (
                <button 
                  onClick={() => revoke(connection.id)} 
                  type="button"
                  className="px-4 py-2 border border-line hover:border-orange hover:bg-orange/10 hover:text-orange transition-colors text-muted font-mono text-[9px] uppercase tracking-widest rounded-sm flex items-center gap-2 opacity-0 group-hover:opacity-100"
                >
                  <PowerOff size={10} />
                  Revoke
                </button>
              ) : null}
            </div>
          )) : (
            <div className="p-12 text-center flex flex-col items-center">
              <Shield size={32} className="text-muted mb-4 opacity-50" />
              <p className="text-sm text-white font-medium mb-1">No connections active</p>
              <p className="text-[11px] text-muted max-w-sm">Create an agent connection to allow Claude Code or Cursor to interact with this project's Truth Engine.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
