import { redirect } from "next/navigation";

import { getAuthIdentity } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const identity = await getAuthIdentity();
  if (!identity) redirect("/login");

  return (
    <main>
      <h1>HARIKOS AUTHENTICATED</h1>
      <p>User ID: {identity.id}</p>
      <p>Email: {identity.email ?? "Not provided"}</p>
      <p>Provider: {identity.provider}</p>
      <p>Session verified successfully.</p>
    </main>
  );
}
