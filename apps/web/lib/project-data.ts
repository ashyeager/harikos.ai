import type { ProjectSnapshot } from "@harikos/core";
import { getAuthIdentity } from "./auth";
import { loadCloudSnapshot } from "./cloud-projects";

export async function projectSnapshot(projectId: string): Promise<ProjectSnapshot | undefined> {
  const session = await getAuthIdentity();
  return session ? loadCloudSnapshot(session, projectId) : undefined;
}
