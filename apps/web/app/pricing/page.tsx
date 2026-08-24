import Link from "next/link";

export default function PricingPage() {
  return <main className="auth-page"><header className="auth-nav"><Link href="/">HARIKOS AI</Link><Link href="/login">Sign in</Link></header><section className="auth-panel"><div className="auth-copy"><span className="eyebrow">PRICING</span><h1>One project brain for every agent.</h1><p>Start with the evidence-backed project understanding your current repository can support.</p></div><div className="connect-card"><h2>Free</h2><p>1 project, 1 agent connection, 250 memories per project, and 25 context packs per month.</p><Link className="button button-dark full-button" href="/login">Start with Free <span>→</span></Link><hr /><h2>Pro · $15/month</h2><p>Up to 5 repositories and agent connections, with higher practical memory and context limits.</p><Link className="button button-ghost full-button" href="/login">Sign in to upgrade <span>→</span></Link></div></section></main>;
}
