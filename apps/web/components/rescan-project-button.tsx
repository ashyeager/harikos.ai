"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RescanProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>();

  async function rescan() {
    setError(undefined);
    setScanning(true);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/scan`,
        { method: "POST" },
      );
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error ?? "The repository scan failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("The repository scan could not reach the server.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="rescan-control">
      <button
        className="button button-ghost"
        disabled={scanning}
        onClick={rescan}
        type="button"
      >
        {scanning ? (
          <><i className="button-spinner dark-spinner" /> Refreshing truth…</>
        ) : (
          <>Rescan repository <span>↻</span></>
        )}
      </button>
      {error ? <p className="inline-error" role="alert">{error}</p> : null}
    </div>
  );
}
