"use client";

import { useState } from "react";

export function BillingActions({ isPro = false }: { isPro?: boolean }) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function open(path: string) {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(path, { method: "POST" });
      const body = await response.json() as { url?: string; error?: string };
      if (!response.ok || !body.url) { 
        setError(body.error ?? "Billing is not available."); 
        setLoading(false);
        return; 
      }
      window.location.assign(body.url);
    } catch {
      setError("Could not reach billing service.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 items-center">
        {!isPro ? (
          <button 
            className="h-12 px-6 flex items-center justify-center bg-white text-ink hover:bg-paper-soft font-mono font-bold text-xs tracking-wide transition-colors disabled:opacity-50" 
            onClick={() => open("/api/billing/checkout")} 
            disabled={loading}
            type="button"
          >
            {loading ? "Redirecting..." : "Upgrade to Pro \u2192"}
          </button>
        ) : null}
        <button 
          className="h-12 px-6 flex items-center justify-center border border-line bg-transparent hover:border-cyan text-white font-mono font-bold text-xs tracking-wide transition-colors disabled:opacity-50" 
          onClick={() => open("/api/billing/portal")} 
          disabled={loading}
          type="button"
        >
          {loading && isPro ? "Redirecting..." : "Manage billing"}
        </button>
      </div>
      {error ? <p className="text-red text-xs p-3 border border-red/20 bg-red/10" role="alert">{error}</p> : null}
    </div>
  );
}
