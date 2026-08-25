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
    <div className="flex flex-col gap-2 w-full">
      <button 
        className="h-12 px-6 flex items-center justify-center gap-2 border border-line bg-ink text-white hover:border-cyan disabled:opacity-50 disabled:cursor-wait font-mono font-bold text-xs tracking-wide transition-colors w-full md:w-auto self-start"
        disabled={scanning} 
        onClick={scan} 
        type="button"
      >
        {scanning ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing repository...
          </>
        ) : (
          <>Analyze this HARIKOS repository &rarr;</>
        )}
      </button>
      {error ? <p className="text-red text-xs mt-2" role="alert">{error}</p> : null}
    </div>
  );
}
