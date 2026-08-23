export function LandingDemo() {
  return (
    <div className="truth-terminal" aria-label="HARIKOS truth update example">
      <div className="terminal-bar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span>project-truth / auth</span>
        <span className="live-dot">LIVE</span>
      </div>
      <div className="terminal-body">
        <div className="terminal-kicker">REPOSITORY CHANGE DETECTED</div>
        <div className="transition-row">
          <div className="provider old-provider">
            <span>PREVIOUS</span>
            <strong>Clerk</strong>
            <small>SUPERSEDED</small>
          </div>
          <div className="transition-line" aria-hidden="true">
            <i />
            <b>→</b>
          </div>
          <div className="provider new-provider">
            <span>CURRENT</span>
            <strong>Supabase Auth</strong>
            <small>VERIFIED · 98%</small>
          </div>
        </div>
        <div className="evidence-log">
          <div><span className="log-ok">✓</span> middleware.ts <em>active implementation</em></div>
          <div><span className="log-ok">✓</span> lib/supabase/server.ts <em>corroborated</em></div>
          <div><span className="log-warn">!</span> README.md <em>still references Clerk</em></div>
        </div>
        <div className="terminal-result">
          <span>AGENT CONTEXT</span>
          <strong>Updated to Supabase</strong>
          <i className="pulse-cursor" />
        </div>
      </div>
    </div>
  );
}
