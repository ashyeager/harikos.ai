"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ScanLocalButton() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>();

  async function scan() {
    setError(undefined);
    setScanning(true);
    try {
      const response = await fetch("/api/projects/local-harikos/scan", { method: "POST" });
      const body = (await response.json()) as { projectId?: string; error?: string };
      if (!response.ok || !body.projectId) {
        setError(body.error ?? "The repository scan failed.");
        return;
      }
      router.push(`/app/project/${body.projectId}`);
      router.refresh();
    } catch {
      setError("The repository scan could not reach the server.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="scan-control">
      <button className="button button-dark" disabled={scanning} onClick={scan} type="button">
        {scanning ? <><i className="button-spinner" /> Analyzing repository…</> : <>Analyze this HARIKOS repository <span>→</span></>}
      </button>
      {error ? <p className="inline-error" role="alert">{error}</p> : null}
    </div>
  );
}
