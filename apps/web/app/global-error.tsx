"use client";

import React from "react";
import Link from "next/link";
import { Brand } from "../components/brand";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  return (
    <html lang="en">
      <body className="global-error-body">
        <main className="app-error-page" id="main-content">
          <Brand />
          <section className="panel" role="alert">
            <span>HARIKOS / RECOVERY</span>
            <h1>The product could not load.</h1>
            <p>Retry this view. If the problem continues, return home and start again from a known state.</p>
            <div><button className="button button-primary" onClick={() => reset()} type="button">Retry</button><Link className="button button-ghost" href="/">Return home</Link></div>
          </section>
        </main>
      </body>
    </html>
  );
}
