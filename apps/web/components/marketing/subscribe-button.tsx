"use client";

import { useState } from "react";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function subscribe() {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/billing/checkout", { method: "POST" });
      const body = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error ?? "Checkout is not available.");
      window.location.assign(body.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout is not available.");
      setLoading(false);
    }
  }

  return <div className="flex flex-col gap-2">
    <button className="button button-primary button-large" type="button" onClick={subscribe} disabled={loading}>
      {loading ? "Opening checkout..." : "Subscribe to Pro - $1/month"} <span aria-hidden="true">&rarr;</span>
    </button>
    {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
  </div>;
}
