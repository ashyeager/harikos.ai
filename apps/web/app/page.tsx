import Link from "next/link";

import { Brand } from "../components/brand";
import { LandingDemo } from "../components/landing-demo";

const features = [
  {
    number: "01",
    title: "Project Truth",
    copy: "Important facts are structured, scoped, confidence-rated, and attached to the evidence that supports them.",
    accent: "orange",
  },
  {
    number: "02",
    title: "Continuous verification",
    copy: "When code changes, HARIKOS updates what is current without erasing what was true before.",
    accent: "cyan",
  },
  {
    number: "03",
    title: "Agent-ready context",
    copy: "Every task gets the smallest useful set of current truths, constraints, changes, and relevant files.",
    accent: "black",
  },
];

export default function LandingPage() {
  return (
    <main className="marketing-page">
      <header className="marketing-nav">
        <Brand />
        <nav aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="#security">Security</a>
        </nav>
        <div className="nav-actions">
          <Link className="text-link" href="/login">Log in</Link>
          <Link className="button button-dark button-small" href="/login">Connect GitHub</Link>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="release-pill"><i /> PROJECT TRUTH / MVP</div>
          <h1>
            Your AI can write the code.
            <span><em>HARIKOS</em> makes sure it understands the project.</span>
          </h1>
          <p>
            One continuously verified understanding of your software — for every coding agent.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/login">
              <span aria-hidden="true">⌘</span> Connect GitHub
            </Link>
            <a className="button button-ghost" href="#how-it-works">See how it works <span>↓</span></a>
          </div>
          <div className="trust-line">
            <span>READ-ONLY BY DEFAULT</span>
            <span>EVIDENCE ON EVERY TRUTH</span>
            <span>AGENT-NEUTRAL</span>
          </div>
        </div>
        <LandingDemo />
      </section>

      <section className="proof-strip" aria-label="Product proof points">
        <div><strong>01</strong><span>Observe repository evidence</span></div>
        <div><strong>02</strong><span>Resolve what is current</span></div>
        <div><strong>03</strong><span>Prepare agent context</span></div>
      </section>

      <section className="grid-section" id="product">
        <div className="section-heading">
          <span className="eyebrow">THE TRUTH LAYER</span>
          <h2>A project your agents can actually understand.</h2>
          <p>Technically deep underneath. Immediately understandable above.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className={`feature-card accent-${feature.accent}`} key={feature.number}>
              <span>{feature.number}</span>
              <div className="feature-icon" aria-hidden="true">{feature.number === "01" ? "◎" : feature.number === "02" ? "↻" : "↗"}</div>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
              <a href="#how-it-works">Explore the system <b>→</b></a>
            </article>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-heading left-heading">
          <span className="eyebrow light">CONTINUOUS UNDERSTANDING</span>
          <h2>Code changes. Project Truth changes with it.</h2>
        </div>
        <div className="monitor-card">
          <div className="monitor-heading">
            <span className="monitor-icon">▦</span>
            <div><strong>Repository monitoring</strong><small>Semantic changes, not noisy file counts</small></div>
            <span className="monitor-live"><i /> WATCHING MAIN</span>
          </div>
          <div className="monitor-chart" aria-label="Project truth verification timeline">
            {[42, 58, 51, 78, 64, 86].map((height, index) => (
              <div className={index === 3 ? "alert-bar" : ""} key={height + index} style={{ "--bar-height": `${height}%` } as React.CSSProperties}>
                {index === 3 ? <span>DRIFT</span> : null}
              </div>
            ))}
          </div>
          <div className="monitor-axis"><span>CLERK VERIFIED</span><span>AUTH MIGRATION</span><span>SUPABASE VERIFIED</span></div>
        </div>
      </section>

      <section className="security-section" id="security">
        <div>
          <span className="eyebrow">SECURITY BOUNDARY</span>
          <h2>Your source is evidence, not inventory.</h2>
        </div>
        <div className="security-points">
          <p><strong>01</strong> Read-only GitHub permissions: contents and metadata.</p>
          <p><strong>02</strong> High-signal files are fetched temporarily and bounded.</p>
          <p><strong>03</strong> Secrets and live environment files are denied by default.</p>
        </div>
      </section>

      <section className="final-cta">
        <span className="eyebrow light">ONE CURRENT UNDERSTANDING</span>
        <h2>Give your next agent the truth.</h2>
        <Link className="button button-light" href="/login">Connect your first repository <span>→</span></Link>
      </section>

      <footer className="marketing-footer">
        <div><Brand /><small>THE TRUTH LAYER FOR AI-BUILT SOFTWARE</small></div>
        <div><a href="#product">Product</a><a href="#security">Security</a><Link href="/app/dashboard">Local demo</Link></div>
        <span>HARIKOS AI · 2026</span>
      </footer>
    </main>
  );
}
