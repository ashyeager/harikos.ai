"use client";

import { useState } from "react";

type CheckoutPlan = "core" | "pro" | "scale";

const labels: Record<CheckoutPlan, string> = {
  core: "Choose Core",
  pro: "Start 7-day Pro trial",
  scale: "Choose Scale",
};

export function SubscribeButton({ enabled, featured = false, plan = "pro" }: { enabled: boolean; featured?: boolean; plan?: CheckoutPlan }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>();

  async function subscribe() {
    if (!enabled || loading) return;
    setLoading(true);
    setMessage(undefined);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const body = (await response.json()) as { url?: string; error?: string; code?: string };
      if (response.status === 401 || body.code === "AUTHENTICATION_REQUIRED") {
        window.location.assign(`/login?next=${encodeURIComponent(`/pricing?plan=${plan}`)}`);
        return;
      }
      if (body.code === "ALREADY_SUBSCRIBED") {
        setMessage("You already have a managed plan. Open Billing settings to manage it.");
        return;
      }
      if (!response.ok || !body.url) {
        setMessage(body.code === "BILLING_UNAVAILABLE" ? "Billing is temporarily unavailable." : "Checkout couldn't start. Try again.");
        return;
      }
      window.location.assign(body.url);
    } catch {
      setMessage("Checkout couldn't reach the billing service. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="checkout-action">
    <button className={`button ${featured ? "button-primary" : "button-secondary"} button-large`} type="button" onClick={subscribe} disabled={!enabled || loading}>
      {loading ? "Starting secure checkout…" : labels[plan]} <span aria-hidden="true">&rarr;</span>
    </button>
    {!enabled ? <p className="checkout-note">Billing is temporarily unavailable.</p> : null}
    {message ? <p aria-live="polite" className="inline-error" role="status">{message}</p> : null}
  </div>;
}
