import Link from "next/link";

export default function NotFound() {
  return <main className="not-found-page" id="main-content" tabIndex={-1}><div className="not-found-grid" aria-hidden="true" /><section><span>404 / CONTEXT NOT FOUND</span><h1>The Project Brain could not resolve this route.</h1><p>No current page matches the requested path. Return to the product or sign in to open an authorized project.</p><div><Link className="button button-primary" href="/">Back to HARIKOS AI</Link><Link className="button button-secondary" href="/app/dashboard">Open dashboard</Link></div></section><div className="disconnected-node" aria-hidden="true"><i /><i /><i /><span>?</span></div></main>;
}
