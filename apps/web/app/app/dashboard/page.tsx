import { redirect } from "next/navigation";

import { getAuthIdentity } from "../../../lib/auth";
import { listCloudProjects } from "../../../lib/cloud-projects";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const identity = await getAuthIdentity();
  if (!identity) redirect("/login");
  const [project] = await listCloudProjects(identity);
  redirect(project ? `/app/project/${project.id}` : "/app/projects");
}
