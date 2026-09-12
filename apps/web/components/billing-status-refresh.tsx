"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_ATTEMPTS = 5;

export function BillingStatusRefresh() {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (confirmed || attempts >= MAX_ATTEMPTS) return;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/billing/status", { cache: "no-store" });
        const status = await response.json() as { hasAccess?: boolean; status?: string };
        if (response.ok && status.hasAccess && (status.status === "trialing" || status.status === "active" || status.status === "developer")) {
          setConfirmed(true);
          router.refresh();
          return;
        }
      } finally {
        setAttempts((value) => value + 1);
      }
    }, attempts === 0 ? 250 : 2_000);
    return () => window.clearTimeout(timer);
  }, [attempts, confirmed, router]);

  return <section className="billing-confirmation" aria-live="polite">
    <span>{confirmed ? "SUBSCRIPTION CONFIRMED" : "CHECKOUT RETURN"}</span>
    <h2>{confirmed ? "Your access is ready." : "Confirming your subscription…"}</h2>
    <p>{confirmed ? "HARIKOS received the authoritative billing state." : attempts >= MAX_ATTEMPTS ? "We haven't received confirmation yet. Your access will update only after Paddle confirms the subscription." : "This usually takes a few seconds. HARIKOS is waiting for the signed Paddle update."}</p>
    {attempts >= MAX_ATTEMPTS && !confirmed ? <button className="button button-ghost" onClick={() => setAttempts(0)} type="button">Check again</button> : null}
  </section>;
}
