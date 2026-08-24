"use client";

import { useState } from "react";

export function BillingActions() {
  const [error, setError] = useState<string>();
  async function open(path: string) {
    setError(undefined);
    const response = await fetch(path, { method: "POST" });
    const body = await response.json() as { url?: string; error?: string };
    if (!response.ok || !body.url) { setError(body.error ?? "Billing is not available."); return; }
    window.location.assign(body.url);
  }
  return <div className="project-actions"><button className="button button-dark" onClick={() => open("/api/billing/checkout")} type="button">Upgrade to Pro <span>→</span></button><button className="button button-ghost" onClick={() => open("/api/billing/portal")} type="button">Manage billing</button>{error ? <p className="inline-error" role="alert">{error}</p> : null}</div>;
}
