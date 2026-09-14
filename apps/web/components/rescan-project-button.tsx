"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LoadingButton } from "./ui-primitives";
import { useToast } from "./ux-provider";

export function RescanProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>();
  const { notify } = useToast();

  async function rescan() {
    setError(undefined);
    setScanning(true);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/scan`,
        { method: "POST" },
      );
      const body = (await response.json()) as { error?: string; code?: string };
      if (!response.ok) {
        const message = body.code === "QUOTA_EXCEEDED" ? "You've used this month's manual rescan. Core keeps your project continuously verified." : body.error ?? "The repository scan failed.";
        setError(message);
        notify({ message, tone: "error" });
        return;
      }
      notify({ message: "Repository rescan completed.", tone: "success" });
      router.refresh();
    } catch {
      setError("The repository scan could not reach the server.");
      notify({ message: "Repository rescan could not reach the server.", tone: "error" });
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full md:w-auto">
      <LoadingButton
        className="h-12 px-6 flex items-center justify-center gap-2 border border-line bg-ink-soft hover:border-orange text-white disabled:opacity-50 disabled:cursor-wait font-mono font-bold text-xs tracking-wide transition-colors whitespace-nowrap"
        loading={scanning}
        loadingLabel="Rescanning repository…"
        onClick={rescan}
        type="button"
      >
        Rescan repository <span className="font-sans ml-1">&#8635;</span>
      </LoadingButton>
      {error ? <p className="text-red text-xs mt-1" role="alert">{error} {error.includes("manual rescan") ? <Link className="text-orange" href="/pricing?plan=core">Upgrade to Core</Link> : null}</p> : null}
    </div>
  );
}
