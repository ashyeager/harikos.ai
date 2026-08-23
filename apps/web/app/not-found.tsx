import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <span>404 / NO EVIDENCE</span>
      <h1>HARIKOS could not verify this page.</h1>
      <p>The requested project or truth record does not exist in the current scope.</p>
      <Link className="button button-dark" href="/app/dashboard">Return to dashboard</Link>
    </main>
  );
}
