"use client";

import { useState } from "react";

export function BillingActions({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState<"checkout" | "portal">();
  const [error, setError] = useState<string>();
  async function open(kind: "checkout" | "portal") {
    setPending(kind); setError(undefined);
    try {
      const response = await fetch(`/api/billing/${kind}`, { method: "POST" });
      const body = await response.json() as { url?: string; error?: string };
      if (!response.ok || !body.url) { setError(body.error ?? "Billing is not available for this deployment."); return; }
      window.location.assign(body.url);
    } catch { setError("The billing service could not be reached."); }
    finally { setPending(undefined); }
  }
  return <div className="billing-actions"><button className="button button-dark" disabled={!enabled || pending !== undefined} onClick={() => open("checkout")} type="button">{pending === "checkout" ? "Opening checkout..." : "Upgrade to Pro"} <span>&rarr;</span></button><button className="button button-ghost" disabled={!enabled || pending !== undefined} onClick={() => open("portal")} type="button">{pending === "portal" ? "Opening portal..." : "Manage billing"}</button>{!enabled ? <p className="empty-state">Stripe billing is not configured for this deployment. No upgrade state is being simulated.</p> : null}{error ? <p className="inline-error" role="alert">{error}</p> : null}</div>;
}
