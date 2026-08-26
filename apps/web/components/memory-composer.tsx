"use client";

import { useState } from "react";
import type { CloudMemory } from "../lib/cloud-projects";
import { History, Cpu, FileWarning, Lightbulb, AlertCircle, Save, CheckCircle2, Bot, Plus } from "lucide-react";
import { cn } from "../lib/utils";

const memoryTypes = [
  { id: "decision", label: "Decision", icon: CheckCircle2, color: "text-green" },
  { id: "attempt", label: "Attempt", icon: Cpu, color: "text-cyan" },
  { id: "failed_attempt", label: "Failed Attempt", icon: FileWarning, color: "text-red" },
  { id: "fix", label: "Fix", icon: Save, color: "text-green" },
  { id: "bug", label: "Bug", icon: AlertCircle, color: "text-red" },
  { id: "root_cause", label: "Root Cause", icon: Search, color: "text-orange" },
  { id: "constraint", label: "Constraint", icon: AlertCircle, color: "text-orange" },
  { id: "discovery", label: "Discovery", icon: Lightbulb, color: "text-yellow" },
  { id: "outcome", label: "Outcome", icon: CheckCircle2, color: "text-green" },
  { id: "incident", label: "Incident", icon: FileWarning, color: "text-red" },
  { id: "note", label: "Note", icon: History, color: "text-muted" },
] as const;

import { Search } from "lucide-react";

export function MemoryComposer({ projectId, initialMemories }: { projectId: string; initialMemories: CloudMemory[] }) {
  const [memories, setMemories] = useState(initialMemories);
  const [type, setType] = useState<typeof memoryTypes[number]["id"]>("note");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [isComposing, setIsComposing] = useState(false);

  async function save() {
    if (!content.trim()) return;
    setSaving(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content }),
      });
      const body = (await response.json()) as { memory?: CloudMemory; error?: string };
      if (!response.ok || !body.memory) {
        setError(body.error ?? "Memory could not be saved.");
        return;
      }
      setMemories((current) => [body.memory!, ...current]);
      setContent("");
      setIsComposing(false);
    } catch {
      setError("Memory could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  const selectedType = memoryTypes.find(t => t.id === type) || memoryTypes[10];

  return (
    <div className="flex flex-col gap-8">
      
      {/* COMPOSER SECTION */}
      {isComposing ? (
        <section className="bg-ink border border-line rounded-sm overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 border-b border-line bg-ink-soft flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus size={14} className="text-cyan" />
              <h2 className="text-sm font-bold text-white">Record New Memory</h2>
            </div>
            <button 
              onClick={() => setIsComposing(false)}
              className="text-muted hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {memoryTypes.map((item) => {
                const Icon = item.icon;
                const active = type === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setType(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-[10px] font-mono tracking-wide uppercase transition-all",
                      active 
                        ? `bg-ink-elevated border-line-light ${item.color} shadow-sm` 
                        : "bg-ink border-transparent text-muted hover:bg-ink-soft hover:border-line"
                    )}
                  >
                    <Icon size={12} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            
            <textarea 
              aria-label="Memory content" 
              onChange={(event) => setContent(event.target.value)} 
              placeholder={`Describe this ${selectedType.label.toLowerCase()} so future agents don't repeat mistakes...`}
              value={content}
              className="min-h-[160px] p-4 bg-ink-soft border border-line text-white text-sm leading-relaxed outline-none focus:border-cyan/50 focus:shadow-[0_0_15px_rgba(0,217,232,0.1)] transition-all resize-y rounded-sm font-mono placeholder:text-muted/50"
              autoFocus
            />
            
            <div className="flex items-center justify-between">
              {error ? (
                <p className="text-red text-xs flex items-center gap-2 font-mono">
                  <AlertCircle size={12} />
                  {error}
                </p>
              ) : <div />}
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 text-xs font-medium text-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  className={cn(
                    "h-9 px-6 flex items-center justify-center gap-2 bg-white text-ink font-mono font-bold text-[10px] uppercase tracking-widest transition-colors rounded-sm shadow-sm",
                    (saving || !content.trim()) ? "opacity-50 cursor-not-allowed" : "hover:bg-paper-soft"
                  )}
                  disabled={saving || !content.trim()} 
                  onClick={save} 
                  type="button"
                >
                  {saving ? (
                    <>
                      <span className="w-3 h-3 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={12} />
                      Save Memory
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <button 
          onClick={() => setIsComposing(true)}
          className="w-full p-4 border border-dashed border-line hover:border-cyan hover:bg-ink-soft text-muted hover:text-cyan transition-all rounded-sm flex items-center justify-center gap-2 group"
        >
          <div className="w-6 h-6 rounded-sm bg-ink border border-line group-hover:border-cyan/50 flex items-center justify-center transition-colors">
            <Plus size={12} />
          </div>
          <span className="font-mono text-[10px] tracking-widest uppercase">Record New Memory</span>
        </button>
      )}

      {/* TIMELINE SECTION */}
      <section className="bg-ink border border-line rounded-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-ink-soft">
          <div className="flex items-center gap-2">
            <History size={14} className="text-muted" />
            <h2 className="text-sm font-bold text-white">Project Timeline</h2>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-muted uppercase bg-ink border border-line px-2 py-0.5 rounded-sm">
            {memories.length} records
          </span>
        </div>
        
        <div className="p-6">
          <div className="relative border-l border-line ml-3 flex flex-col gap-8 pb-4">
            {memories.length ? memories.map((memory) => {
              const memType = memoryTypes.find(t => t.id === memory.type) || memoryTypes[10];
              const Icon = memType.icon;
              
              return (
                <article className="relative pl-6 group" key={memory.id}>
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-ink",
                    memType.color.replace("text-", "bg-")
                  )} />
                  
                  <div className="bg-ink-elevated border border-line p-5 rounded-sm group-hover:border-line-light transition-colors relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={memType.color} />
                        <strong className="font-mono text-[10px] tracking-widest text-white uppercase">{memType.label}</strong>
                      </div>
                      <small className="font-mono text-[9px] text-muted tracking-wide">
                        {new Date(memory.createdAt).toLocaleString(undefined, {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </small>
                    </div>
                    
                    <p className="text-sm text-paper leading-relaxed font-mono">{memory.content}</p>
                    
                    {memory.agent ? (
                      <div className="mt-4 pt-3 border-t border-line/50 flex items-center gap-1.5">
                        <Bot size={10} className="text-cyan" />
                        <small className="text-[9px] font-mono tracking-widest text-muted uppercase">
                          Recorded by {memory.agent}
                        </small>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            }) : (
              <div className="pl-6 text-center py-12">
                <History size={24} className="text-muted mx-auto mb-4 opacity-50" />
                <p className="text-sm text-white font-medium mb-1">Timeline is empty</p>
                <p className="text-[11px] text-muted">No cloud memories have been recorded for this project yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
