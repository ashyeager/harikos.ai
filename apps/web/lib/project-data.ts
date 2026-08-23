import {
  createFlagshipDemoSnapshot,
  scanAndPersistLocalProject,
  type ProjectSnapshot,
} from "@harikos/core";

import { isLocalDemoEnabled, localRepositoryPath } from "./config";
import { getAuthIdentity } from "./auth";
import { loadCloudSnapshot } from "./cloud-projects";

export function demoSnapshot(): ProjectSnapshot {
  return createFlagshipDemoSnapshot();
}

export async function projectSnapshot(projectId: string): Promise<ProjectSnapshot | undefined> {
  if (projectId === "demo-project-truth") {
    return demoSnapshot();
  }
  if (projectId === "local-harikos" && isLocalDemoEnabled()) {
    const snapshot = await scanAndPersistLocalProject(localRepositoryPath());
    return { ...snapshot, projectId: "local-harikos" };
  }
  const session = await getAuthIdentity();
  return session ? loadCloudSnapshot(session, projectId) : undefined;
}
