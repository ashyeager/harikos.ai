"use client";

import Link from "next/link";
import { useState } from "react";

export function BillingActions({ enabled, managed, developer }: { enabled: boolean; managed: boolean; developer: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function openPortal() {
    if (!enabled || pending) return;
    setPending(true);
    setError(undefined);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const body = await response.json() as { url?: string; code?: string };
      if (!response.ok || !body.url) {
        setError(body.code === "BILLING_UNAVAILABLE" ? "Billing management is not available yet." : "Billing management couldn't open. Try again.");
        return;
      }
      window.location.assign(body.url);
    } catch {
      setError("Billing management couldn't reach the provider. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (developer) return <p className="billing-access-note">Internal access uses the same product boundaries without a Paddle subscription.</p>;

  return <div className="billing-actions">
    {managed ? <button className="button button-dark" disabled={!enabled || pending} onClick={openPortal} type="button">{pending ? "Opening secure billing…" : "Manage billing"} <span>&rarr;</span></button> : <Link className="button button-dark" href="/pricing">Choose a plan <span>&rarr;</span></Link>}
    {!enabled ? <p className="empty-state">Billing is not available yet. Your current access state is unchanged.</p> : null}
    {error ? <p className="inline-error" role="alert">{error}</p> : null}
  </div>;
}
