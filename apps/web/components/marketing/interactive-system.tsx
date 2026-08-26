"use client";

import { useEffect, useRef, useState } from "react";

const loopStages = [
  { label: "TASK RECEIVED", title: "Replace Clerk with Supabase", status: "task" },
  { label: "REPOSITORY SCAN", title: "3 relevant files changed", status: "scan" },
  { label: "TRUTH UPDATED", title: "Supabase → VERIFIED", status: "truth" },
  { label: "MEMORY RECORDED", title: "Migration decision persisted", status: "memory" },
  { label: "CONTEXT READY", title: "Next agent brief synchronized", status: "context" },
] as const;

export function CinematicLoop() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)), { threshold: 0.15 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setStep((value) => (value + 1) % loopStages.length), 1900);
    return () => window.clearInterval(interval);
  }, [active]);
  const current = loopStages[step]!;
  return (
    <div className="cinematic-loop" ref={ref}>
      <div className="cinematic-topbar"><span><i /> LIVE PRODUCT MECHANIC</span><span>LOOP / 0{step + 1}:05</span></div>
      <div className="cinematic-stage">
        <div className="cinematic-task"><small>{current.label}</small><strong>{current.title}</strong><span className={`loop-status loop-${current.status}`}>{current.status}</span></div>
        <div className="cinematic-data-line"><i /><b /><em /></div>
        <div className="cinematic-files">
          <span className={step >= 1 ? "is-active" : ""}>middleware.ts <b>+18 −9</b></span>
          <span className={step >= 1 ? "is-active" : ""}>lib/supabase/server.ts <b>+34</b></span>
          <span className={step >= 2 ? "is-stale" : ""}>README.md <b>{step >= 2 ? "STALE" : "CURRENT"}</b></span>
        </div>
        <div className="cinematic-truth">
          <div className={step >= 2 ? "is-superseded" : "is-verified"}><small>AUTH / PREVIOUS</small><strong>Clerk</strong><span>{step >= 2 ? "SUPERSEDED" : "VERIFIED"}</span></div>
          <i aria-hidden="true">→</i>
          <div className={step >= 2 ? "is-verified" : "is-pending"}><small>AUTH / CURRENT</small><strong>Supabase</strong><span>{step >= 2 ? "VERIFIED" : "CANDIDATE"}</span></div>
        </div>
      </div>
      <div className="cinematic-progress">{loopStages.map((stage, index) => <button aria-label={`Show ${stage.label}`} className={index === step ? "active" : index < step ? "passed" : ""} key={stage.label} onClick={() => setStep(index)} type="button"><i /><span>{stage.label}</span></button>)}</div>
    </div>
  );
}

export function TemporalTruth() {
  const [value, setValue] = useState(100);
  const after = value >= 50;
  return (
    <div className={`temporal-truth ${after ? "is-after" : "is-before"}`}>
      <div className="temporal-topbar"><span>TEMPORAL TRUTH / AUTHENTICATION</span><span>COMMIT <b>{after ? "C2137FB" : "A891DF2"}</b></span></div>
      <div className="temporal-grid">
        <div className="temporal-code">
          <div><span>12</span><code><b>{after ? "+" : " "}</b> import &#123; createMiddlewareClient &#125; from <em>"@supabase/ssr"</em></code></div>
          <div className={after ? "line-add" : ""}><span>18</span><code><b>{after ? "+" : " "}</b> const supabase = createServerClient()</code></div>
          <div className={!after ? "line-active" : "line-remove"}><span>21</span><code><b>{after ? "−" : " "}</b> authMiddleware.protect()</code></div>
          <div><span>27</span><code>return response</code></div>
        </div>
        <div className="temporal-claims">
          <article className={after ? "claim-verified" : "claim-pending"}><span>AUTHENTICATION</span><strong>Supabase Auth</strong><small>{after ? "VERIFIED · 99%" : "NOT OBSERVED"}</small></article>
          <article className={after ? "claim-superseded" : "claim-verified"}><span>AUTHENTICATION</span><strong>Clerk</strong><small>{after ? "SUPERSEDED" : "VERIFIED · 97%"}</small></article>
          <article className={after ? "claim-stale" : "claim-verified"}><span>DOCUMENTATION</span><strong>README.md</strong><small>{after ? "STALE · REVIEW" : "CONSISTENT"}</small></article>
        </div>
      </div>
      <div className="temporal-scrubber">
        <div><span>BEFORE</span><strong>Clerk / verified</strong></div>
        <input aria-label="Scrub between previous and current project truth" max="100" min="0" onChange={(event) => setValue(Number(event.target.value))} type="range" value={value} />
        <div><span>AFTER</span><strong>Supabase / verified</strong></div>
      </div>
    </div>
  );
}

const handoffRecords = ["FAILED ATTEMPT", "DECISION", "OUTCOME"] as const;
const inherited = ["CURRENT TRUTH", "CONSTRAINT", "FAILED ATTEMPT", "DECISION", "OUTCOME", "RELEVANT FILES"] as const;

export function AgentHandoff() {
  const [phase, setPhase] = useState<0 | 1>(1);
  return (
    <div className="handoff-visual">
      <div className="handoff-agent agent-codex"><span>01</span><i>C</i><div><strong>CODEX</strong><small>SESSION COMPLETE</small></div></div>
      <div className="handoff-records">{handoffRecords.map((record, index) => <span className={phase >= 1 ? "is-sent" : ""} style={{ "--delay": `${index * 90}ms` } as React.CSSProperties} key={record}>{record}</span>)}</div>
      <button aria-label="Replay agent handoff" className="handoff-brain" onClick={() => { setPhase(0); window.setTimeout(() => setPhase(1), 60); }} type="button"><span className="brand-mark"><i /><i /><i /></span><strong>HARIKOS</strong><small>PROJECT BRAIN</small></button>
      <div className="handoff-context">{inherited.map((record, index) => <span className={phase >= 1 ? "is-received" : ""} style={{ "--delay": `${320 + index * 70}ms` } as React.CSSProperties} key={record}><i />{record}</span>)}</div>
      <div className="handoff-agent agent-claude"><span>02</span><i>CL</i><div><strong>CLAUDE</strong><small>CONTEXT RECEIVED</small></div></div>
    </div>
  );
}

const contextSignals = [
  ["middleware.ts", "truth"], ["README.md", "dim"], ["stripe.ts", "file"], ["auth.ts", "dim"],
  ["billing decision", "memory"], ["failed client attempt", "memory"], ["route.ts", "file"], ["dashboard.tsx", "dim"],
  ["webhook constraint", "truth"], ["package.json", "dim"], ["current plan", "truth"], ["old auth change", "dim"],
] as const;

export function ContextCompression() {
  const [compressed, setCompressed] = useState(true);
  return (
    <div className={`compression-visual ${compressed ? "is-compressed" : ""}`}>
      <div className="compression-task"><span>TASK / INPUT</span><strong>Modify subscription flow</strong><button onClick={() => setCompressed((value) => !value)} type="button">{compressed ? "Show all signals" : "Compress context"}</button></div>
      <div className="compression-field">{contextSignals.map(([label, kind], index) => <span className={`signal signal-${kind}`} style={{ "--signal-x": `${(index * 37) % 82}%`, "--signal-y": `${(index * 53) % 78}%` } as React.CSSProperties} key={label}>{label}</span>)}</div>
      <div className="compression-funnel"><i /><i /><i /><span>RELEVANCE ENGINE</span></div>
      <div className="context-pack-mini"><div><span>HARIKOS CONTEXT PACK</span><b>1,184 TOKENS</b></div>{["CURRENT TRUTH", "FILES", "CONSTRAINTS", "FAILED ATTEMPTS", "DECISIONS", "OUTCOMES"].map((item) => <p key={item}><i />{item}<span>INCLUDED</span></p>)}</div>
    </div>
  );
}

const terminalResults: Record<string, string[]> = {
  "truth auth": ["Authentication", "Supabase Auth", "VERIFIED · 99%", "", "Evidence", "middleware.ts:18", "lib/supabase/server.ts:7", "", "Previous: Clerk · SUPERSEDED"],
  "memory billing": ["4 relevant memories", "", "DECISION · Keep subscription creation server-side", "FAILED_ATTEMPT · Client-side Stripe credentials", "CONSTRAINT · Webhook state is authoritative", "OUTCOME · Checkout boundary implemented"],
  "context subscriptions": ["Context Pack / subscriptions", "1,184 estimated tokens", "", "6 current truths", "3 relevant files", "2 constraints", "1 failed attempt", "1 outcome"],
  "agents": ["Illustrative connection", "Codex laptop · token shown once", "State: authenticated request observed", "Scope: project / read-write memory"],
};

export function InteractiveTerminal() {
  const [command, setCommand] = useState("truth auth");
  const [copied, setCopied] = useState(false);
  const lines = terminalResults[command] ?? ["Unknown command", "Try: truth auth, memory billing, context subscriptions, agents"];
  return (
    <div className="interactive-terminal">
      <div className="terminal-bar"><span><i /><i /><i /></span><strong>harikos — illustrative shell</strong><button onClick={async () => { await navigator.clipboard.writeText(`harikos ${command}`); setCopied(true); window.setTimeout(() => setCopied(false), 1200); }} type="button">{copied ? "COPIED" : "COPY"}</button></div>
      <div className="terminal-body"><div className="terminal-command"><span>$</span><input aria-label="HARIKOS illustrative command" onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") setCommand(event.currentTarget.value.trim()); }} value={command} /></div><div className="terminal-output">{lines.map((line, index) => <p className={line.includes("VERIFIED") ? "terminal-success" : line.includes("SUPERSEDED") || line.includes("FAILED") ? "terminal-muted" : ""} key={`${line}-${index}`}>{line || "\u00a0"}</p>)}</div></div>
      <div className="terminal-presets">{Object.keys(terminalResults).map((preset) => <button className={preset === command ? "active" : ""} key={preset} onClick={() => setCommand(preset)} type="button">{preset}</button>)}</div>
    </div>
  );
}
