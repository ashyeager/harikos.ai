import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthIdentity } from "../../lib/auth";
import { syncCloudUser } from "../../lib/cloud-projects";

export default async function ProductLayout({ children }: { children: ReactNode }) {
  const identity = await getAuthIdentity();
  if (!identity) redirect("/login");
  await syncCloudUser(identity);
  return <>{children}</>;
}
