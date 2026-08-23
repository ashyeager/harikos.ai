import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthIdentity } from "../../lib/auth";

export default async function ProductLayout({ children }: { children: ReactNode }) {
  const identity = await getAuthIdentity();
  if (!identity) redirect("/login");
  return children;
}
