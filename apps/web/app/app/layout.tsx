import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthIdentity } from "../../lib/auth";
import { isDemoMode } from "../../lib/config";

export default async function ProductLayout({ children }: { children: ReactNode }) {
  const identity = await getAuthIdentity();
  if (!identity) redirect("/login");
  return <>
    {isDemoMode() ? <div className="demo-mode-banner" role="status">DEMO MODE — Authentication bypassed for development</div> : null}
    {children}
  </>;
}
