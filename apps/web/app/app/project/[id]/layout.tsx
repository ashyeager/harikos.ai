import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthIdentity } from "../../../../lib/auth";
import { requireProductAccess } from "../../../../lib/entitlements";

export default async function ProjectLayout({ children }: { children: ReactNode }) {
  const identity = await getAuthIdentity();
  if (!identity) redirect("/login");
  try {
    await requireProductAccess(identity);
  } catch {
    redirect("/app/settings/billing");
  }
  return <>{children}</>;
}
