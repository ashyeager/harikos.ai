"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Brand } from "../../components/brand";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="app-error-page" id="main-content"><Brand /><section className="panel" role="alert"><span>WORKSPACE / RECOVERY</span><h1>HARIKOS could not load this view.</h1><p>Retry the request. If you just submitted a change, check the relevant project page before submitting it again.</p><div><button className="button button-primary" onClick={reset} type="button">Retry</button><Link className="button button-ghost" href="/app/projects">View projects</Link><Link className="button button-ghost" href="/app/dashboard">Dashboard</Link></div></section></main>;
}
