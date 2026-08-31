"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Code2, Database, FileText, GitMerge, MessageSquare, Shield, Sparkles, TerminalSquare } from "lucide-react";
import { cn } from "../lib/utils";

const suggestions = [
  { text: "How does authentication work?", icon: Shield },
  { text: "How is the database structured?", icon: Database },
  { text: "What changed recently?", icon: GitMerge },
  { text: "Explain the deployment process.", icon: TerminalSquare },
];

export function UnderstandExplorer({ projectId }: { projectId: string }) {
  const [question, setQuestion] = useState(suggestions[0].text);
  const [mode, setMode] = useState<"simple" | "technical" | "evidence">("simple");
  const [answer, setAnswer] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/understand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode }),
      });
      const body = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !body.answer) {
        setError(body.error ?? "HARIKOS could not prepare a grounded answer.");
        return;
      }
      setAnswer(body.answer);
    } catch {
      setError("HARIKOS could not reach the project service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">

      {/* SUGGESTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={suggestion.text}
              onClick={() => setQuestion(suggestion.text)}
              type="button"
              className="px-4 py-3 bg-ink border border-line text-xs text-muted hover:text-white hover:bg-ink-soft hover:border-orange/50 transition-all font-mono text-left rounded-sm group flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Icon size={14} className="group-hover:text-orange transition-colors" />
                <span className="truncate">{suggestion.text}</span>
              </span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </button>
          );
        })}
      </div>

      {/* INPUT AREA */}
      <div className="bg-ink border border-line p-6 flex flex-col gap-6 relative rounded-sm shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange to-transparent opacity-50" />

        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-orange" />
          <label htmlFor="project-question" className="font-mono text-[10px] tracking-widest text-white uppercase font-bold">
            Ask about the verified project
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            id="project-question"
            onChange={(event) => setQuestion(event.target.value)}
            value={question}
            className="flex-1 h-12 px-4 bg-ink-soft border border-line text-white font-mono text-sm outline-none focus:border-orange transition-colors rounded-sm shadow-inner"
            placeholder="What do you want to understand?"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) ask();
            }}
          />
          <button
            className={cn(
              "h-12 px-8 flex items-center justify-center gap-2 bg-white text-ink font-mono font-bold text-[10px] tracking-widest uppercase transition-colors whitespace-nowrap rounded-sm shadow-sm",
              (loading || !question.trim()) ? "opacity-50 cursor-not-allowed" : "hover:bg-paper-soft"
            )}
            disabled={loading || !question.trim()}
            onClick={ask}
            type="button"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
                Checking Evidence
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Ask HARIKOS
              </>
            )}
          </button>
        </div>

        {/* MODE SELECTOR */}
        <div className="flex items-center gap-4 mt-2">
          <span className="font-mono text-[9px] tracking-widest text-muted uppercase">Depth:</span>
          <div className="flex items-center bg-ink-soft rounded-sm p-1 border border-line">
            {[
              { id: "simple", label: "Simple", icon: FileText },
              { id: "technical", label: "Technical", icon: Code2 },
              { id: "evidence", label: "Evidence", icon: Database }
            ].map((item) => {
              const Icon = item.icon;
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] tracking-widest uppercase transition-all rounded-sm",
                    active
                      ? "bg-ink border-line text-orange font-bold shadow-sm"
                      : "text-muted hover:text-white hover:bg-ink-elevated border border-transparent"
                  )}
                  onClick={() => setMode(item.id as "simple" | "technical" | "evidence")}
                  type="button"
                >
                  <Icon size={10} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error ? (
        <p className="text-red text-xs p-4 bg-red/10 border border-red/20 font-mono rounded-sm flex items-center gap-2" role="alert">
          <Shield size={14} />
          {error}
        </p>
      ) : null}

      {/* ANSWER OUTPUT */}
      {answer ? (
        <article className="bg-ink border border-line flex flex-col rounded-sm overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" aria-live="polite">
          <div className="flex items-center gap-4 border-b border-line px-6 py-4 bg-ink-soft">
            <div className="w-8 h-8 flex items-center justify-center bg-orange/10 border border-orange/30 text-orange font-mono font-bold rounded-sm shadow-[0_0_10px_rgba(255,104,24,0.16)]">
              H
            </div>
            <div className="flex flex-col gap-1">
              <small className="font-mono text-[9px] tracking-widest text-orange uppercase">GROUNDED IN PROJECT TRUTH</small>
              <strong className="text-white text-sm capitalize">{mode} Answer</strong>
            </div>
          </div>

          <div className="p-8 bg-ink text-white leading-relaxed text-sm whitespace-pre-wrap font-sans">
            {answer}
          </div>

          <div className="flex items-center justify-between px-6 py-4 bg-ink-soft border-t border-line font-mono text-[9px] tracking-widest text-muted uppercase">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-green" />
              Generated from current verified claims
            </span>
            <span className="opacity-50">Not generic repo chat</span>
          </div>
        </article>
      ) : null}
    </div>
  );
}
