import type { ProjectSnapshot } from "@harikos/core";
import type { ReactNode } from "react";

import { AppChrome } from "./app-chrome";

export function AppShell({ snapshot, children }: { snapshot?: ProjectSnapshot; children: ReactNode }) {
  const project = snapshot ? {
    id: snapshot.projectId,
    name: snapshot.repository.name,
    ...(snapshot.repository.owner ? { owner: snapshot.repository.owner } : {}),
    branch: snapshot.repository.defaultBranch,
    sha: snapshot.repository.headSha,
    scannedAt: snapshot.scannedAt,
    mode: snapshot.mode,
    openContradictions: snapshot.contradictions.filter((item) => item.status === "open").length,
  } : undefined;
  return <AppChrome project={project}>{children}</AppChrome>;
}
